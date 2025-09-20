import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { databases } from "../appwrite";
import { ID, Query, Permission, Role } from "appwrite";
import { toast } from "sonner";
import { useUser } from "./user";
import { expandIdea } from "../services/gemini";
import { emailService } from "../services/emailService";

export const IDEAS_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const IDEAS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const PREFERENCES_COLLECTION_ID = "user-preferences";

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
  const [customCategories, setCustomCategories] = useState([]);
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 25,
    hasMore: true,
  });
  const lastFetchTimeRef = useRef(null);
  const pendingOperationsRef = useRef(new Set());
  const previousUserIdRef = useRef(null);

  const emailDebounceRef = useRef(null);
  const pendingNotificationsRef = useRef([]);

  // Clear state when user changes or logs out
  useEffect(() => {
    const currentUserId = user?.$id;

    if (previousUserIdRef.current !== currentUserId) {
      // User changed or logged out - clear all state
      setIdeas([]);
      setIsLoading(false);
      setCustomCategories([]);
      setPagination({ offset: 0, limit: 25, hasMore: true });
      lastFetchTimeRef.current = null;
      pendingOperationsRef.current.clear();
      pendingNotificationsRef.current = [];

      // Clear email debounce
      if (emailDebounceRef.current) {
        clearTimeout(emailDebounceRef.current);
        emailDebounceRef.current = null;
      }

      previousUserIdRef.current = currentUserId;
    }
  }, [user?.$id]);

  const getErrorMessage = (error) => {
    if (error?.code === 401) return "Please log in to continue";
    if (error?.code === 404) return "Database or collection not found";
    if (error?.code === 400) return "Invalid data provided";
    return error?.message || "Something went wrong. Please try again.";
  };

  const fetchUserPreferences = useCallback(async (userId) => {
    try {
      // Look for preferences in the new collection
      const response = await databases.listDocuments(
        IDEAS_DATABASE_ID,
        PREFERENCES_COLLECTION_ID,
        [Query.equal("userId", userId), Query.limit(1)]
      );

      if (response.documents.length > 0) {
        const prefsDoc = response.documents[0];
        return {
          emailNotifications: prefsDoc.emailNotifications ?? true,
          ideaAdded: prefsDoc.ideaAdded ?? true,
          ideaExpanded: prefsDoc.ideaExpanded ?? true,
          weeklySummary: prefsDoc.weeklySummary ?? true,
          customCategories: prefsDoc.customCategories || [],
        };
      }

      // Default preferences if none found
      return {
        emailNotifications: true,
        ideaAdded: true,
        ideaExpanded: true,
        weeklySummary: true,
        customCategories: [],
      };
    } catch (error) {
      console.error("Failed to fetch user preferences:", error);
      return {
        emailNotifications: true,
        ideaAdded: true,
        ideaExpanded: true,
        weeklySummary: true,
        customCategories: [],
      };
    }
  }, []);

  // Load custom categories
  useEffect(() => {
    if (user?.$id) {
      fetchUserPreferences(user.$id).then((prefs) => {
        setCustomCategories(prefs.customCategories || []);
      });
    }
  }, [user?.$id, fetchUserPreferences]);

  const addCustomCategory = async (categoryName) => {
    if (!user?.$id || !categoryName.trim()) return;

    const trimmedName = categoryName.trim();
    if (customCategories.includes(trimmedName)) {
      toast.error("Category already exists");
      return;
    }

    try {
      const newCategories = [...customCategories, trimmedName];

      // Try to update existing preferences
      const existingPrefs = await databases.listDocuments(
        IDEAS_DATABASE_ID,
        PREFERENCES_COLLECTION_ID,
        [Query.equal("userId", user.$id), Query.limit(1)]
      );

      if (existingPrefs.documents.length > 0) {
        await databases.updateDocument(
          IDEAS_DATABASE_ID,
          PREFERENCES_COLLECTION_ID,
          existingPrefs.documents[0].$id,
          { customCategories: newCategories }
        );
      } else {
        await databases.createDocument(
          IDEAS_DATABASE_ID,
          PREFERENCES_COLLECTION_ID,
          ID.unique(),
          {
            userId: user.$id,
            customCategories: newCategories,
            emailNotifications: true,
            ideaAdded: true,
            ideaExpanded: true,
            weeklySummary: true,
          },
          [
            Permission.read(Role.user(user.$id)),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ]
        );
      }

      setCustomCategories(newCategories);
      toast.success("Category added successfully!");
      return true;
    } catch (error) {
      console.error("Failed to add category:", error);
      toast.error("Failed to add category");
      return false;
    }
  };

  const removeCustomCategory = async (categoryName) => {
    if (!user?.$id || !categoryName) return;

    try {
      const newCategories = customCategories.filter(
        (cat) => cat !== categoryName
      );

      // Update database
      const existingPrefs = await databases.listDocuments(
        IDEAS_DATABASE_ID,
        PREFERENCES_COLLECTION_ID,
        [Query.equal("userId", user.$id), Query.limit(1)]
      );

      if (existingPrefs.documents.length > 0) {
        await databases.updateDocument(
          IDEAS_DATABASE_ID,
          PREFERENCES_COLLECTION_ID,
          existingPrefs.documents[0].$id,
          { customCategories: newCategories }
        );
      }

      setCustomCategories(newCategories);
      toast.success("Category removed successfully!");
      return true;
    } catch (error) {
      console.error("Failed to remove category:", error);
      toast.error("Failed to remove category");
      return false;
    }
  };

  const addIdeaToState = useCallback((newIdea) => {
    setIdeas((prev) => {
      const existingIndex = prev.findIndex((idea) => idea.$id === newIdea.$id);

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newIdea;
        return updated;
      } else {
        return [newIdea, ...prev];
      }
    });
  }, []);

  // Helper function to send email notifications with user preferences check
  const sendBatchedNotificationEmail = async (type, ideaTitle = "", userId) => {
    if (!user?.email || !user?.name) return;

    try {
      // Fetch user preferences from database
      const userPreferences = await fetchUserPreferences(userId);

      // Check if notifications are enabled
      if (!userPreferences.emailNotifications) {
        return;
      }

      // Check specific notification type
      const shouldSend = checkNotificationPreference(type, userPreferences);
      if (!shouldSend) {
        return;
      }

      if (type === "ideaAdded") {
        // Add to pending notifications
        pendingNotificationsRef.current.push({
          type,
          ideaTitle,
          userId,
          timestamp: new Date(),
        });

        // Clear existing debounce
        if (emailDebounceRef.current) {
          clearTimeout(emailDebounceRef.current);
        }

        // Set new debounce - send email after 5 minutes of inactivity
        emailDebounceRef.current = setTimeout(
          async () => {
            const notifications = pendingNotificationsRef.current;
            pendingNotificationsRef.current = [];

            if (notifications.length === 0) return;

            // If only one notification, send normal email
            if (notifications.length === 1) {
              await emailService.sendIdeaAddedNotification(
                user.email,
                user.name,
                notifications[0].ideaTitle,
                userId
              );
            } else {
              // Send batch notification
              const ideaTitles = notifications
                .map((n) => n.ideaTitle)
                .slice(0, 5); // Show max 5 titles
              const remainingCount = Math.max(0, notifications.length - 5);

              await emailService.sendBatchIdeaNotification(
                user.email,
                user.name,
                ideaTitles,
                remainingCount,
                userId
              );
            }
          },
          5 * 60 * 1000
        ); // 5 minutes
      } else {
        // For other types (like ideaExpanded), send immediately
        switch (type) {
          case "ideaExpanded":
            await emailService.sendIdeaExpandedNotification(
              user.email,
              user.name,
              ideaTitle,
              userId
            );
            break;
        }
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
      const permissions = [
        Permission.read(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
      ];

      // Add public read permission if idea is public
      if (idea.isPublic) {
        permissions.push(Permission.read(Role.any()));
      }

      const response = await databases.createDocument(
        IDEAS_DATABASE_ID,
        IDEAS_COLLECTION_ID,
        tempId,
        {
          ...idea,
          userId: user.$id,
          userName: user.name || "",
          userProfilePicture:
            getUserAvatarUrl(user, getProfilePictureUrl) || "",
          status: "active",
        },
        permissions // Use the permissions array
      );

      // Always update state immediately for better UX
      addIdeaToState(response);

      toast.success("Idea added successfully!");

      // Send batched email notification in background
      sendBatchedNotificationEmail("ideaAdded", idea.title, user.$id);

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
        userProfilePicture: getUserAvatarUrl(user, getProfilePictureUrl) || "",
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

  async function markAsComplete(id) {
    return await update(id, { status: "completed" });
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

        sendBatchedNotificationEmail("ideaExpanded", idea.title, user.$id);

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

  async function toggleLike(
    ideaId,
    externalIdeas = null,
    setExternalIdeas = null
  ) {
    if (!user) {
      toast.error("Please log in to like ideas");
      return;
    }

    try {
      const targetIdeas = externalIdeas || ideas;
      const currentIdea = targetIdeas.find((idea) => idea.$id === ideaId);
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

      // Update database
      await databases.updateDocument(
        IDEAS_DATABASE_ID,
        IDEAS_COLLECTION_ID,
        ideaId,
        {
          likes: newLikes,
          likedBy: newLikedBy,
        }
      );

      // Update appropriate state based on context
      if (externalIdeas && setExternalIdeas) {
        // Update external state (for public ideas in Discover)
        setExternalIdeas((prev) =>
          prev.map((idea) =>
            idea.$id === ideaId
              ? { ...idea, likes: newLikes, likedBy: newLikedBy }
              : idea
          )
        );
      } else {
        // Update internal state (for user's own ideas in Home)
        setIdeas((prev) =>
          prev.map((idea) =>
            idea.$id === ideaId
              ? { ...idea, likes: newLikes, likedBy: newLikedBy }
              : idea
          )
        );
      }

      return !hasLiked;
    } catch (err) {
      console.error("Toggle like error:", err);
      toast.error("Failed to update like. Please try again.");
      throw err;
    }
  }

  const fetchIdeas = useCallback(
    async (loadMore = false) => {
      if (!user) return;

      try {
        setIsLoading(true);

        const currentOffset = loadMore ? pagination.offset : 0;

        const response = await databases.listDocuments(
          IDEAS_DATABASE_ID,
          IDEAS_COLLECTION_ID,
          [
            Query.equal("userId", user.$id),
            Query.orderDesc("$createdAt"),
            Query.limit(pagination.limit),
            Query.offset(currentOffset),
          ]
        );

        const uniqueIdeas = response.documents.filter(
          (idea, index, self) =>
            index === self.findIndex((i) => i.$id === idea.$id)
        );

        if (loadMore) {
          setIdeas((prev) => [...prev, ...uniqueIdeas]);
        } else {
          setIdeas(uniqueIdeas);
        }

        setPagination((prev) => ({
          ...prev,
          offset: loadMore
            ? currentOffset + uniqueIdeas.length
            : uniqueIdeas.length,
          hasMore: uniqueIdeas.length === pagination.limit,
        }));

        lastFetchTimeRef.current = new Date().toISOString();
      } catch (err) {
        console.error("Fetch ideas error:", err);
        toast.error(getErrorMessage(err));
        if (!loadMore) setIdeas([]);
      } finally {
        setIsLoading(false);
      }
    },
    [user, pagination.limit]
  );

  const fetchPublicIdeas = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await databases.listDocuments(
        IDEAS_DATABASE_ID,
        IDEAS_COLLECTION_ID,
        [
          Query.equal("isPublic", true),
          Query.orderDesc("$createdAt"),
          Query.limit(100),
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

  const searchIdeas = useCallback(
    async (searchTerm, filters = {}) => {
      if (!user || !searchTerm.trim()) return [];

      try {
        const queries = [
          Query.equal("userId", user.$id),
          Query.orderDesc("$createdAt"),
          Query.limit(50),
        ];

        // Add search query - this will search across title, description, and tags
        if (searchTerm.trim()) {
          queries.push(Query.search("title", searchTerm.trim()));
        }

        // Add filters
        if (filters.category && filters.category !== "All") {
          queries.push(Query.equal("category", filters.category));
        }
        if (filters.priority && filters.priority !== "All") {
          queries.push(Query.equal("priority", filters.priority));
        }
        if (filters.status && filters.status !== "All") {
          queries.push(Query.equal("status", filters.status));
        }

        const response = await databases.listDocuments(
          IDEAS_DATABASE_ID,
          IDEAS_COLLECTION_ID,
          queries
        );

        let results = response.documents;

        // Client-side filtering for description and tags (since Appwrite doesn't support multiple search queries)
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase();
          results = results.filter(
            (idea) =>
              idea.title?.toLowerCase().includes(searchLower) ||
              idea.description?.toLowerCase().includes(searchLower) ||
              idea.tags?.toLowerCase().includes(searchLower)
          );
        }

        // Filter by tags if specified
        if (filters.tags?.trim()) {
          results = results.filter((idea) =>
            idea.tags?.toLowerCase().includes(filters.tags.toLowerCase())
          );
        }

        return results;
      } catch (err) {
        console.error("Search ideas error:", err);
        return [];
      }
    },
    [user]
  );

  const getUserAvatarUrl = (user, getProfilePictureUrl) => {
    if (!user) return null;

    // Custom uploaded profile picture
    if (user.prefs?.profilePictureId) {
      try {
        return getProfilePictureUrl(user.prefs.profilePictureId);
      } catch (e) {
        console.warn("Failed to get profile picture URL:", e);
      }
    }

    // OAuth avatar URL
    if (user.avatarUrl) {
      return user.avatarUrl;
    }

    return null;
  };

  useEffect(() => {
    if (isInitialized && !loading) {
      if (user) {
        fetchIdeas();
      } else {
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
              return [payload, ...prev];
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

  useEffect(() => {
    return () => {
      if (emailDebounceRef.current) {
        clearTimeout(emailDebounceRef.current);
      }
    };
  }, []);

  const contextValue = {
    current: ideas,
    add,
    update,
    remove,
    markAsComplete,
    expandWithAI,
    toggleLike,
    fetchPublicIdeas,
    searchIdeas,
    isLoading,
    refresh: fetchIdeas,
    loadMore: () => fetchIdeas(true),
    hasMore: pagination.hasMore,
    customCategories,
    addCustomCategory,
    removeCustomCategory,
  };

  return (
    <IdeasContext.Provider value={contextValue}>
      {children}
    </IdeasContext.Provider>
  );
}
