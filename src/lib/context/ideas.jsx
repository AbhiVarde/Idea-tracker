import { createContext, useContext, useEffect, useState, useRef } from "react";
import { databases } from "../appwrite";
import { ID, Query } from "appwrite";
import { toast } from "react-toastify";

export const IDEAS_DATABASE_ID = `${process.env.REACT_APP_APPWRITE_DATABASE_ID}`;
export const IDEAS_COLLECTION_ID = `${process.env.REACT_APP_APPWRITE_COLLECTION_ID}`;

const IdeasContext = createContext();

export function useIdeas() {
  return useContext(IdeasContext);
}

export function IdeasProvider(props) {
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(null);
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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
          updatedAt: new Date().toISOString(),
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
    setLastFetchTime(newFetchTime);
    lastFetchTimeRef.current = newFetchTime;
  }

  // Fetch only new ideas created after lastFetchTime
  async function fetchNewIdeas() {
    try {
      setIsLoading(true);

      const queries = [Query.orderDesc("$createdAt"), Query.limit(50)];

      if (lastFetchTimeRef.current) {
        queries.push(Query.greaterThan("createdAt", lastFetchTimeRef.current));
      }

      const response = await databases.listDocuments(
        IDEAS_DATABASE_ID,
        IDEAS_COLLECTION_ID,
        queries
      );

      setIdeas(response.documents);
      const newFetchTime = new Date().toISOString();
      setLastFetchTime(newFetchTime);
      lastFetchTimeRef.current = newFetchTime;
    } catch (err) {
      console.error("Error fetching new ideas:", err);
      toast.error(getErrorMessage(err));
      setIdeas([]);
    } finally {
      setIsLoading(false);
    }
  }

  // Initialize with empty state (no existing ideas)
  async function init() {
    try {
      setIsLoading(true);
      // Start with empty ideas array - only show new ones going forward
      setIdeas([]);
      const newFetchTime = new Date().toISOString();
      setLastFetchTime(newFetchTime);
      lastFetchTimeRef.current = newFetchTime;
    } catch (err) {
      console.error("Error initializing:", err);
      setIdeas([]);
    } finally {
      setIsLoading(false);
    }
  }

  // Initialize once and set up real-time subscription
  useEffect(() => {
    init();

    // Set up real-time subscription
    const unsubscribe = databases.client.subscribe(
      `databases.${IDEAS_DATABASE_ID}.collections.${IDEAS_COLLECTION_ID}.documents`,
      (response) => {
        const eventType = response.events[0];
        const payload = response.payload;

        if (eventType.includes("create")) {
          // Only add if it's truly new (created after our initialization)
          const ideaCreatedAt = new Date(payload.createdAt);
          const initTime = new Date(lastFetchTimeRef.current);

          if (ideaCreatedAt > initTime) {
            setIdeas((prev) => {
              // Check if idea already exists (avoid duplicates)
              if (prev.find((idea) => idea.$id === payload.$id)) {
                return prev;
              }
              return [payload, ...prev].slice(0, 50);
            });
          }
        } else if (eventType.includes("update")) {
          setIdeas((prev) =>
            prev.map((idea) => (idea.$id === payload.$id ? payload : idea))
          );
        } else if (eventType.includes("delete")) {
          setIdeas((prev) => prev.filter((idea) => idea.$id !== payload.$id));
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
