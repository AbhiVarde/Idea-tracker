import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { databases } from "../appwrite";
import { ID, Query } from "appwrite";
import { toast } from "sonner";
import { useUser } from "./user";
import { expandIdea } from "../services/gemini";

export const IDEAS_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const IDEAS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const IdeasContext = createContext();

export function useIdeas() {
  return useContext(IdeasContext);
}

export function IdeasProvider({ children }) {
  const { current: user, isInitialized, loading } = useUser();
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchTimeRef = useRef(null);
  const pendingOperationsRef = useRef(new Set());

  const getErrorMessage = (error) => {
    if (error?.code === 401) return "Please log in to continue";
    if (error?.code === 404) return "Database or collection not found";
    if (error?.code === 400) return "Invalid data provided";
    return error?.message || "Something went wrong. Please try again.";
  };

  const addIdeaToState = useCallback((newIdea) => {
    setIdeas((prev) => {
      const existingIndex = prev.findIndex((idea) => idea.$id === newIdea.$id);

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newIdea;
        return updated;
      } else {
        return [newIdea, ...prev].slice(0, 50);
      }
    });
  }, []);

  async function add(idea) {
    if (!user) {
      toast.error("Please log in to add ideas");
      return;
    }

    const tempId = ID.unique();
    pendingOperationsRef.current.add(tempId);

    try {
      const response = await databases.createDocument(
        IDEAS_DATABASE_ID,
        IDEAS_COLLECTION_ID,
        tempId,
        {
          ...idea,
          userId: user.$id,
        }
      );

      // Always update state immediately for better UX
      addIdeaToState(response);

      toast.success("Idea added successfully!");
      return response;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    } finally {
      pendingOperationsRef.current.delete(tempId);
    }
  }

  async function update(id, updatedIdea) {
    if (!user) {
      toast.error("Please log in to update ideas");
      return;
    }

    pendingOperationsRef.current.add(id);

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
      console.error("Update error details:", err);
      toast.error(getErrorMessage(err));
      throw err;
    } finally {
      pendingOperationsRef.current.delete(id);
    }
  }

  async function remove(id) {
    if (!user) {
      toast.error("Please log in to delete ideas");
      return;
    }

    pendingOperationsRef.current.add(id);

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
    } finally {
      pendingOperationsRef.current.delete(id);
    }
  }

  async function expandWithAI(idea) {
    if (!user) {
      toast.error("Please log in to expand ideas");
      return;
    }

    try {
      const result = await expandIdea(
        idea.title,
        idea.description,
        idea.category,
        idea.priority
      );

      if (result.success) {
        const expandedAt = new Date().toISOString();

        await update(idea.$id, {
          aiExpansion: result.expansion,
          expandedAt: expandedAt,
        });

        return result.expansion;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error("AI expansion error:", err);
      toast.error("Failed to expand idea. Please try again.");
      throw err;
    }
  }

  const fetchIdeas = useCallback(async () => {
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

      const uniqueIdeas = response.documents.filter(
        (idea, index, self) =>
          index === self.findIndex((i) => i.$id === idea.$id)
      );

      setIdeas(uniqueIdeas);
      lastFetchTimeRef.current = new Date().toISOString();
    } catch (err) {
      console.error("Fetch ideas error:", err);
      toast.error(getErrorMessage(err));
      setIdeas([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isInitialized && !loading) {
      if (user) {
        fetchIdeas();
      } else {
        console.log("No user, clearing ideas");
        setIdeas([]);
        setIsLoading(false);
        pendingOperationsRef.current.clear();
      }
    }
  }, [user, isInitialized, loading, fetchIdeas]);

  useEffect(() => {
    if (!user || !isInitialized) return;

    const unsubscribe = databases.client.subscribe(
      `databases.${IDEAS_DATABASE_ID}.collections.${IDEAS_COLLECTION_ID}.documents`,
      (response) => {
        const eventType = response.events[0];
        const payload = response.payload;

        if (payload.userId !== user.$id) return;

        if (pendingOperationsRef.current.has(payload.$id)) {
          pendingOperationsRef.current.delete(payload.$id);
          return;
        }

        if (eventType.includes("create")) {
          setIdeas((prev) => {
            const exists = prev.some((idea) => idea.$id === payload.$id);
            if (!exists) {
              return [payload, ...prev].slice(0, 50);
            }
            return prev;
          });
        } else if (eventType.includes("update")) {
          setIdeas((prev) => {
            const existingIndex = prev.findIndex(
              (idea) => idea.$id === payload.$id
            );
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = payload;
              return updated;
            }
            return prev;
          });
        } else if (eventType.includes("delete")) {
          setIdeas((prev) => prev.filter((idea) => idea.$id !== payload.$id));
        }
      }
    );

    const currentPendingOperations = pendingOperationsRef.current;

    return () => {
      unsubscribe?.();
      currentPendingOperations.clear();
    };
  }, [user, isInitialized, addIdeaToState]);

  const contextValue = {
    current: ideas,
    add,
    update,
    remove,
    expandWithAI,
    isLoading,
    refresh: fetchIdeas,
  };

  return (
    <IdeasContext.Provider value={contextValue}>
      {children}
    </IdeasContext.Provider>
  );
}
