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
import { emailService } from "../services/emailService";

export const IDEAS_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const IDEAS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const IdeasContext = createContext();

export function useIdeas() {
  return useContext(IdeasContext);
}

export function IdeasProvider({ children }) {
  const {
    current: user,
    isInitialized,
    loading,
    getProfilePictureUrl,
  } = useUser();
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

  // Add this function after getErrorMessage:
  const fetchUserPreferences = useCallback(async (userId) => {
    try {
      const response = await databases.listDocuments(
        IDEAS_DATABASE_ID,
        IDEAS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      if (response.documents.length > 0) {
        // Look for preferences in the user document
        const userDoc = response.documents.find(
          (doc) => doc.userId === userId && doc.emailNotifications !== undefined
        );
        if (userDoc) {
          return {
            emailNotifications: userDoc.emailNotifications ?? true,
            ideaAdded: userDoc.ideaAdded ?? true,
            ideaExpanded: userDoc.ideaExpanded ?? true,
            weeklySummary: userDoc.weeklySummary ?? true,
          };
        }
      }

      // Default preferences if none found
      return {
        emailNotifications: true,
        ideaAdded: true,
        ideaExpanded: true,
        weeklySummary: true,
      };
    } catch (error) {
      console.error("Failed to fetch user preferences:", error);
      return {
        emailNotifications: true,
        ideaAdded: true,
        ideaExpanded: true,
        weeklySummary: true,
      };
    }
  }, []);

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

  // Helper function to send email notifications with user preferences check
  const sendNotificationEmail = async (type, ideaTitle = "", userId) => {
    if (!user?.email || !user?.name) return;

    try {
      // Fetch user preferences from database
      const userPreferences = await fetchUserPreferences(userId);

      // Check if notifications are enabled
      if (!userPreferences.emailNotifications) {
        // console.log("Email notifications disabled for user");
        return;
      }

      // Check specific notification type
      const shouldSend = checkNotificationPreference(type, userPreferences);
      if (!shouldSend) {
        // console.log(`Notification ${type} skipped due to user preferences`);
        return;
      }

      switch (type) {
        case "ideaAdded":
          await emailService.sendIdeaAddedNotification(
            user.email,
            user.name,
            ideaTitle,
            userId
          );
          break;
        case "ideaExpanded":
          await emailService.sendIdeaExpandedNotification(
            user.email,
            user.name,
            ideaTitle,
            userId
          );
          break;
      }
    } catch (error) {
      console.error("Email notification failed:", error);
    }
  };

  // Helper function to check if notification should be sent based on user preferences
  const checkNotificationPreference = (type, preferences) => {
    if (!preferences?.emailNotifications) return false;

    switch (type) {
      case "ideaAdded":
        return preferences.ideaAdded;
      case "ideaExpanded":
        return preferences.ideaExpanded;
      default:
        return true;
    }
  };

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
          userName: user.name || "",
          userEmail: user.email || "",
          userProfilePicture:
            getProfilePictureUrl(user.prefs.profilePictureId) || "",
        }
      );

      // Always update state immediately for better UX
      addIdeaToState(response);

      toast.success("Idea added successfully!");

      // Send email notification in background
      sendNotificationEmail("ideaAdded", idea.title, user.$id);

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
      const finalUpdatedIdea = {
        ...updatedIdea,
        userName: user.name || "",
        userEmail: user.email || "",
        userProfilePicture:
          getProfilePictureUrl(user.prefs.profilePictureId) || "",
      };

      const response = await databases.updateDocument(
        IDEAS_DATABASE_ID,
        IDEAS_COLLECTION_ID,
        id,
        finalUpdatedIdea
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

  const checkDailyExpansionLimit = (ideas, userId) => {
    const today = new Date().toDateString();
    const todayExpansions = ideas.filter(
      (idea) =>
        idea.userId === userId &&
        idea.expandedAt &&
        new Date(idea.expandedAt).toDateString() === today
    );
    return todayExpansions.length >= 3;
  };

  async function expandWithAI(idea) {
    if (!user) {
      toast.error("Please log in to expand ideas");
      return;
    }

    // Check daily limit
    if (checkDailyExpansionLimit(ideas, user.$id)) {
      toast.error("Daily limit reached! You can expand 3 ideas per day.");
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

        // Send email notification for AI expansion
        sendNotificationEmail("ideaExpanded", idea.title, user.$id);

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

  async function toggleLike(ideaId) {
    if (!user) {
      toast.error("Please log in to like ideas");
      return;
    }

    try {
      // Get current idea
      const currentIdea = ideas.find((idea) => idea.$id === ideaId);
      if (!currentIdea) return;

      const likedBy = currentIdea.likedBy || [];
      const hasLiked = likedBy.includes(user.$id);

      let newLikedBy;
      let newLikes;

      if (hasLiked) {
        // Unlike
        newLikedBy = likedBy.filter((id) => id !== user.$id);
        newLikes = Math.max(0, (currentIdea.likes || 0) - 1);
      } else {
        // Like
        newLikedBy = [...likedBy, user.$id];
        newLikes = (currentIdea.likes || 0) + 1;
      }

      await update(ideaId, {
        likes: newLikes,
        likedBy: newLikedBy,
      });

      return !hasLiked; // Return new like status
    } catch (err) {
      console.error("Toggle like error:", err);
      toast.error("Failed to update like. Please try again.");
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

  const fetchPublicIdeas = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await databases.listDocuments(
        IDEAS_DATABASE_ID,
        IDEAS_COLLECTION_ID,
        [
          Query.equal("isPublic", true),
          Query.orderDesc("$createdAt"),
          Query.limit(50),
        ]
      );

      return response.documents;
    } catch (err) {
      console.error("Fetch public ideas error:", err);
      toast.error(getErrorMessage(err));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    toggleLike,
    fetchPublicIdeas,
    isLoading,
    refresh: fetchIdeas,
  };

  return (
    <IdeasContext.Provider value={contextValue}>
      {children}
    </IdeasContext.Provider>
  );
}
