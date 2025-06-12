import { createContext, useContext, useEffect, useState, useRef } from "react";
import { databases } from "../appwrite";
import { ID, Query } from "appwrite";
import { toast } from "sonner";
import { useUser } from "./user";

export const IDEAS_DATABASE_ID = `${process.env.REACT_APP_APPWRITE_DATABASE_ID}`;
export const IDEAS_COLLECTION_ID = `${process.env.REACT_APP_APPWRITE_COLLECTION_ID}`;

const IdeasContext = createContext();

export function useIdeas() {
  return useContext(IdeasContext);
}

export function IdeasProvider({ children }) {
  const { current: user, isInitialized } = useUser();
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchTimeRef = useRef(null);

  const getErrorMessage = (error) => {
    if (error?.code === 401) return "Please log in to continue";
    if (error?.code === 404) return "Database or collection not found";
    if (error?.code === 400) return "Invalid data provided";
    return error?.message || "Something went wrong. Please try again.";
  };

  async function add(idea) {
    if (!user) {
      toast.error("Please log in to add ideas");
      return;
    }

    try {
      const response = await databases.createDocument(
        IDEAS_DATABASE_ID,
        IDEAS_COLLECTION_ID,
        ID.unique(),
        {
          ...idea,
          userId: user.$id,
        }
      );
      setIdeas((prev) => [response, ...prev].slice(0, 50));
      toast.success("Idea added successfully!");
      return response;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  }

  async function update(id, updatedIdea) {
    if (!user) {
      toast.error("Please log in to update ideas");
      return;
    }

    try {
      const response = await databases.updateDocument(
        IDEAS_DATABASE_ID,
        IDEAS_COLLECTION_ID,
        id,
        updatedIdea
      );
      setIdeas((prev) =>
        prev.map((idea) => (idea.$id === id ? response : idea))
      );
      toast.success("Idea updated successfully!");
      return response;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  }

  async function remove(id) {
    if (!user) {
      toast.error("Please log in to delete ideas");
      return;
    }

    try {
      await databases.deleteDocument(
        IDEAS_DATABASE_ID,
        IDEAS_COLLECTION_ID,
        id
      );
      setIdeas((prev) => prev.filter((idea) => idea.$id !== id));
      toast.info("Idea deleted successfully");
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  }

  async function fetchIdeas() {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await databases.listDocuments(
        IDEAS_DATABASE_ID,
        IDEAS_COLLECTION_ID,
        [
          Query.equal("userId", user.$id),
          Query.orderDesc("$createdAt"),
          Query.limit(50),
        ]
      );
      setIdeas(response.documents);
      lastFetchTimeRef.current = new Date().toISOString();
    } catch (err) {
      console.error("Fetch ideas error:", err);
      toast.error(getErrorMessage(err));
      setIdeas([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isInitialized) {
      if (user) {
        console.log("User authenticated, fetching ideas...", user);
        fetchIdeas();
      } else {
        console.log("No user, clearing ideas");
        setIdeas([]);
        setIsLoading(false);
      }
    }
  }, [user, isInitialized]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = databases.client.subscribe(
      `databases.${IDEAS_DATABASE_ID}.collections.${IDEAS_COLLECTION_ID}.documents`,
      (response) => {
        const eventType = response.events[0];
        const payload = response.payload;

        if (payload.userId === user.$id) {
          if (eventType.includes("create")) {
            setIdeas((prev) => {
              if (prev.find((idea) => idea.$id === payload.$id)) return prev;
              return [payload, ...prev].slice(0, 50);
            });
          } else if (eventType.includes("update")) {
            setIdeas((prev) =>
              prev.map((idea) => (idea.$id === payload.$id ? payload : idea))
            );
          } else if (eventType.includes("delete")) {
            setIdeas((prev) => prev.filter((idea) => idea.$id !== payload.$id));
          }
        }
      }
    );

    return () => unsubscribe?.();
  }, [user]);

  const contextValue = {
    current: ideas,
    add,
    update,
    remove,
    isLoading,
    refresh: fetchIdeas,
  };

  return (
    <IdeasContext.Provider value={contextValue}>
      {children}
    </IdeasContext.Provider>
  );
}
