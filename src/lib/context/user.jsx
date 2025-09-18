import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { account, databases, storage } from "../appwrite";
import { OAuthProvider, Query, ID } from "appwrite";
import { toast } from "sonner";

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [oauthProcessed, setOauthProcessed] = useState(false);
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  const isAccountDeleted = (email) => {
    const deletedAccounts = JSON.parse(
      localStorage.getItem("deletedAccounts") || "[]"
    );
    return deletedAccounts.includes(email);
  };

  const markAccountAsDeleted = (email) => {
    const deletedAccounts = JSON.parse(
      localStorage.getItem("deletedAccounts") || "[]"
    );
    if (!deletedAccounts.includes(email)) {
      deletedAccounts.push(email);
      localStorage.setItem("deletedAccounts", JSON.stringify(deletedAccounts));
    }
  };

  const removeFromDeletedAccounts = (email) => {
    const deletedAccounts = JSON.parse(
      localStorage.getItem("deletedAccounts") || "[]"
    );
    const updatedAccounts = deletedAccounts.filter(
      (deletedEmail) => deletedEmail !== email
    );
    localStorage.setItem("deletedAccounts", JSON.stringify(updatedAccounts));
  };

  const init = useCallback(async () => {
    if (isInitialized) return;

    setLoading(true);
    try {
      const loggedIn = await account.get();

      if (isAccountDeleted(loggedIn.email)) {
        await account.deleteSession("current");
        setUser(null);
        setUserDataLoaded(true);
        return;
      }

      setUser(loggedIn);
      setUserDataLoaded(true);
    } catch (err) {
      setUser(null);
      setUserDataLoaded(true);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const uploadProfilePicture = async (file) => {
    try {
      // Delete old profile picture if exists
      if (user?.prefs?.profilePictureId) {
        try {
          await storage.deleteFile(
            import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID,
            user.prefs.profilePictureId
          );
        } catch (error) {
          console.warn("Error deleting old profile picture:", error);
        }
      }

      // Upload new profile picture
      const uploadedFile = await storage.createFile(
        import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID,
        ID.unique(),
        file
      );

      // Update user preferences with the new file ID
      await account.updatePrefs({
        ...user.prefs,
        profilePictureId: uploadedFile.$id,
      });

      // Get the updated user data and update local state
      const updatedUser = await account.get();
      setUser(updatedUser);

      toast.success("Profile picture updated successfully!");
      return uploadedFile.$id;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture");
      throw error;
    }
  };

  const removeProfilePicture = async () => {
    try {
      if (user?.prefs?.profilePictureId) {
        await storage.deleteFile(
          import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID,
          user.prefs.profilePictureId
        );
      }

      await account.updatePrefs({
        ...user.prefs,
        profilePictureId: null,
      });

      // Get the updated user data and update local state
      const updatedUser = await account.get();
      setUser(updatedUser);

      toast.success("Profile picture removed successfully!");
    } catch (error) {
      console.error("Error removing profile picture:", error);
      toast.error("Failed to remove profile picture");
      throw error;
    }
  };

  const getProfilePictureUrl = (profilePictureId) => {
    if (!profilePictureId) return null;
    return storage.getFileView(
      import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID,
      profilePictureId
    );
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      // Check if account was manually deleted
      if (isAccountDeleted(email)) {
        toast.error("This account has been deleted", {
          description: "Please create a new account to continue.",
          duration: 4000,
        });
        throw new Error("Account deleted");
      }

      await account.createEmailPasswordSession(email, password);
      const loggedIn = await account.get();
      setUser(loggedIn);

      // Show success toast for email/password login
      toast.success("Successfully logged in!", {
        description: "Welcome to Idea Tracker!",
      });

      return loggedIn;
    } catch (error) {
      console.error("Login error:", error);

      if (error.message === "Account deleted") {
        throw error;
      } else if (error.code === 401) {
        toast.error("Invalid credentials", {
          description: "Please check your email and password.",
        });
      } else if (error.code === 429) {
        toast.error("Too many attempts", {
          description: "Please wait a moment before trying again.",
        });
      } else {
        toast.error("Login failed", {
          description: "Please check your credentials and try again.",
        });
      }
      throw error;
    }
  };

  // Register with email and password
  const register = async (email, password) => {
    try {
      // Clean up deleted account marker for this email (allow re-registration)
      if (isAccountDeleted(email)) {
        removeFromDeletedAccounts(email);
        toast.success("Welcome back!", {
          description: "Creating your new account...",
          duration: 3000,
        });
      }

      await account.create(ID.unique(), email, password);
      await account.createEmailPasswordSession(email, password);
      const loggedIn = await account.get();
      setUser(loggedIn);

      // Show success toast for email/password registration
      if (!isAccountDeleted(email)) {
        toast.success("Account created successfully!", {
          description: "Welcome to Idea Tracker!",
        });
      }

      return loggedIn;
    } catch (error) {
      console.error("Registration error:", error);

      if (error.code === 409) {
        toast.error("Account already exists", {
          description:
            "This email is already registered. Try logging in instead.",
        });
      } else if (error.code === 400) {
        toast.error("Invalid registration", {
          description:
            "Please check your email format and password requirements.",
        });
      } else {
        toast.error("Registration failed", {
          description: "Unable to create account. Please try again.",
        });
      }
      throw error;
    }
  };

  // OAuth Login methods
  const loginWithGoogle = () => {
    try {
      account.createOAuth2Token(
        OAuthProvider.Google,
        `${window.location.origin}/`,
        `${window.location.origin}/login`
      );
    } catch (error) {
      console.error("Google OAuth initiation failed:", error);
      toast.error("OAuth failed", {
        description: "Unable to connect with Google. Please try again.",
      });
    }
  };

  const loginWithGithub = () => {
    try {
      account.createOAuth2Token(
        OAuthProvider.Github,
        `${window.location.origin}/`,
        `${window.location.origin}/login`
      );
    } catch (error) {
      console.error("GitHub OAuth initiation failed:", error);
      toast.error("OAuth failed", {
        description: "Unable to connect with GitHub. Please try again.",
      });
    }
  };

  const loginWithDiscord = () => {
    try {
      account.createOAuth2Token(
        OAuthProvider.Discord,
        `${window.location.origin}/`,
        `${window.location.origin}/login`
      );
    } catch (error) {
      console.error("Discord OAuth initiation failed:", error);
      toast.error("OAuth failed", {
        description: "Unable to connect with Discord. Please try again.",
      });
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  // Delete account
  const deleteAccount = async () => {
    try {
      const currentUser = await account.get();

      // Delete profile picture if exists
      if (currentUser?.prefs?.profilePictureId) {
        try {
          await storage.deleteFile(
            import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID,
            currentUser.prefs.profilePictureId
          );
        } catch (error) {
          console.warn("Error deleting profile picture:", error);
        }
      }

      try {
        const userDocuments = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_COLLECTION_ID,
          [Query.equal("userId", currentUser.$id)]
        );

        if (userDocuments.documents.length > 0) {
          const deletePromises = userDocuments.documents.map((doc) =>
            databases.deleteDocument(
              import.meta.env.VITE_APPWRITE_DATABASE_ID,
              import.meta.env.VITE_APPWRITE_COLLECTION_ID,
              doc.$id
            )
          );
          await Promise.all(deletePromises);
        }
      } catch (docError) {
        console.warn("Error deleting user documents:", docError);
      }

      markAccountAsDeleted(currentUser.email);

      // Logout user
      await account.deleteSessions();
      setUser(null);

      return true;
    } catch (error) {
      console.error("Delete account error:", error);
      throw new Error("Failed to delete account. Please try again.");
    }
  };

  // Initialize on mount
  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const handleOAuthRedirect = async () => {
      if (oauthProcessed) return;

      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get("userId");
      const secret = urlParams.get("secret");

      if (userId && secret) {
        setOauthProcessed(true);

        try {
          setLoading(true);
          await account.createSession(userId, secret);
          const loggedIn = await account.get();
          setUser(loggedIn);

          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );

          toast.success("Successfully logged in!", {
            description: "Welcome to Idea Tracker!",
          });
        } catch (error) {
          console.error("OAuth session creation failed:", error);
          toast.error("Login failed", {
            description: "Unable to complete OAuth login. Please try again.",
          });
          setOauthProcessed(false);
        } finally {
          setLoading(false);
        }
      }
    };

    if (isInitialized && !loading) {
      handleOAuthRedirect();
    }
  }, [isInitialized, loading, oauthProcessed]);

  const contextValue = {
    current: user,
    loading,
    isInitialized,
    userDataLoaded,
    login,
    logout,
    register,
    loginWithGoogle,
    loginWithGithub,
    loginWithDiscord,
    deleteAccount,
    uploadProfilePicture,
    removeProfilePicture,
    getProfilePictureUrl,
    account,
    databases,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}
