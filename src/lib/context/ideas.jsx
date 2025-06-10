import { createContext, useContext, useEffect, useState, useRef } from "react";
import { databases } from "../appwrite";
import { ID, Query } from "appwrite";
import { toast } from "sonner";

export const IDEAS_DATABASE_ID = `${process.env.REACT_APP_APPWRITE_DATABASE_ID}`;
export const IDEAS_COLLECTION_ID = `${process.env.REACT_APP_APPWRITE_COLLECTION_ID}`;

const IdeasContext = createContext();

export function useIdeas() {
  return useContext(IdeasContext);
}

export function IdeasProvider(props) {
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const lastFetchTimeRef = useRef(null);

  const getErrorMessage = (error) => {
    if (error?.code === 401) return "Please log in to continue";
    if (error?.code === 404) return "Database or collection not found";
    if (error?.code === 400) return "Invalid data provided";
    if (error?.message) return error.message;
    return "Something went wrong. Please try again.";
  };

  async function add(idea) {
    try {
      const response = await databases.createDocument(
        IDEAS_DATABASE_ID,
        IDEAS_COLLECTION_ID,
        ID.unique(),
        {
          ...idea,
        }
      );
      setIdeas((prev) => [response, ...prev].slice(0, 50));
      toast.success("Idea added successfully!");
      return response;
    } catch (err) {
      console.error("Error adding idea:", err);
      toast.error(getErrorMessage(err));
      throw err;
    }
  }

  async function update(id, updatedIdea) {
    try {
      const response = await databases.updateDocument(
        IDEAS_DATABASE_ID,
        IDEAS_COLLECTION_ID,
        id,
        {
          ...updatedIdea,
        }
      );
      setIdeas((prev) =>
        prev.map((idea) => (idea.$id === id ? response : idea))
      );
      toast.success("Idea updated successfully!");
      return response;
    } catch (err) {
      console.error("Error updating idea:", err);
      toast.error(getErrorMessage(err));
      throw err;
    }
  }

  async function remove(id) {
    try {
      await databases.deleteDocument(
        IDEAS_DATABASE_ID,
        IDEAS_COLLECTION_ID,
        id
      );
      setIdeas((prev) => prev.filter((idea) => idea.$id !== id));
      toast.info("Idea deleted successfully");
    } catch (err) {
      console.error("Error removing idea:", err);
      toast.error(getErrorMessage(err));
      throw err;
    }
  }

  function clearExistingIdeas() {
    setIdeas([]);
    const newFetchTime = new Date().toISOString();
    lastFetchTimeRef.current = newFetchTime;
  }

  async function fetchNewIdeas() {
    try {
      setIsLoading(true);

      const queries = [Query.orderDesc("$createdAt"), Query.limit(50)];

      if (lastFetchTimeRef.current) {
        queries.push(Query.greaterThan("$createdAt", lastFetchTimeRef.current));
      }

      const response = await databases.listDocuments(
        IDEAS_DATABASE_ID,
        IDEAS_COLLECTION_ID,
        queries
      );

      setIdeas(response.documents);
      const newFetchTime = new Date().toISOString();
      lastFetchTimeRef.current = newFetchTime;
    } catch (err) {
      console.error("Error fetching new ideas:", err);
      toast.error(getErrorMessage(err));
      setIdeas([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function init() {
    try {
      setIsLoading(true);
      const response = await databases.listDocuments(
        IDEAS_DATABASE_ID,
        IDEAS_COLLECTION_ID,
        [Query.orderDesc("$createdAt"), Query.limit(50)]
      );
      setIdeas(response.documents);
      const newFetchTime = new Date().toISOString();
      lastFetchTimeRef.current = newFetchTime;
    } catch (err) {
      console.error("Error initializing:", err);
      setIdeas([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    init();

    // Set up real-time subscription
    const unsubscribe = databases.client.subscribe(
      `databases.${IDEAS_DATABASE_ID}.collections.${IDEAS_COLLECTION_ID}.documents`,
      (response) => {
        const eventType = response.events[0];
        const payload = response.payload;

        if (eventType.includes("create")) {
          setIdeas((prev) => {
            if (prev.find((idea) => idea.$id === payload.$id)) {
              return prev;
            }
            const ideaCreatedAt = new Date(payload.$createdAt);
            const initTime = new Date(lastFetchTimeRef.current);

            if (prev.length === 0 || ideaCreatedAt > initTime) {
              return [payload, ...prev].slice(0, 50);
            }
            return prev;
          });
        }
      }
    );

    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const contextValue = {
    current: ideas,
    add,
    update,
    remove,
    isLoading,
    refresh: fetchNewIdeas,
    clearExisting: clearExistingIdeas,
    fetchNewOnly: fetchNewIdeas,
  };

  return (
    <IdeasContext.Provider value={contextValue}>
      {props.children}
    </IdeasContext.Provider>
  );
}
