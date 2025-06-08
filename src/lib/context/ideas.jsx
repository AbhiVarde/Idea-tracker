import { createContext, useContext, useEffect, useState } from "react";
import { databases } from "../appwrite";
import { ID, Query } from "appwrite";

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
      return response;
    } catch (err) {
      console.error("Error adding idea:", err);
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
      return response;
    } catch (err) {
      console.error("Error updating idea:", err);
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
    } catch (err) {
      console.error("Error removing idea:", err);
      throw err;
    }
  }

  // Clear existing ideas and start fresh
  function clearExistingIdeas() {
    setIdeas([]);
    setLastFetchTime(new Date().toISOString());
  }

  // Fetch only new ideas created after lastFetchTime
  async function fetchNewIdeas() {
    try {
      setIsLoading(true);

      const queries = [Query.orderDesc("$createdAt"), Query.limit(50)];

      // If we have a last fetch time, only get ideas created after that
      if (lastFetchTime) {
        queries.push(Query.greaterThan("createdAt", lastFetchTime));
      }

      const response = await databases.listDocuments(
        IDEAS_DATABASE_ID,
        IDEAS_COLLECTION_ID,
        queries
      );

      // Only show new ideas, don't append to existing ones
      setIdeas(response.documents);
      setLastFetchTime(new Date().toISOString());
    } catch (err) {
      console.error("Error fetching new ideas:", err);
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
      setLastFetchTime(new Date().toISOString());
    } catch (err) {
      console.error("Error initializing:", err);
      setIdeas([]);
    } finally {
      setIsLoading(false);
    }
  }

  // Subscribe to real-time updates - only for new ideas
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
          const initTime = new Date(lastFetchTime);

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
  }, [lastFetchTime]);

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
