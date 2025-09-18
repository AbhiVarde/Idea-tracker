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

  // Check if user is verified
  const isUserVerified = () => {
    if (user?.prefs?.authMethod === "oauth") return true;
    return user?.emailVerification === true;
  };

  // Send verification email
  const sendVerificationEmail = async () => {
    try {
      await account.createVerification(
        `${window.location.origin}/verify-email`
      );
      toast.success("Verification email sent! Please check your inbox.");
      return true;
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast.error("Failed to send verification email. Please try again.");
      return false;
    }
  };

  // Verify email with secret from URL
  const verifyEmail = async (userId, secret) => {
    try {
      await account.updateVerification(userId, secret);
      // Refresh user data to get updated verification status
      const updatedUser = await account.get();
      setUser(updatedUser);
      toast.success("Email verified successfully!");
      return true;
    } catch (error) {
      console.error("Error verifying email:", error);
      toast.error("Failed to verify email. The link may have expired.");
      return false;
    }
  };

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
      await account.updatePrefs({ authMethod: "email" }); // Set authMethod

      // Check if email is verified for email/password login
      if (!loggedIn.emailVerification) {
        toast.warning("Please verify your email", {
          description: "Check your inbox for the verification link.",
          duration: 6000,
        });
      } else {
        toast.success("Successfully logged in!", {
          description: "Welcome to Idea Tracker!",
        });
      }

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

  // In your UserContext, replace the register function with this:
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

      await account.updatePrefs({ authMethod: "email" }); // Set authMethod first

      // Set all states together to ensure proper loading state management
      setUser(loggedIn);
      setUserDataLoaded(true);
      setLoading(false); // Explicitly set loading to false

      console.log("Registration successful for:", loggedIn.email);

      // Automatically send verification email after registration
      try {
        await account.createVerification(
          `${window.location.origin}/verify-email`
        );
        toast.success("Account created successfully!", {
          description: "Please check your email to verify your account.",
          duration: 6000,
        });
      } catch (verificationError) {
        console.warn("Failed to send verification email:", verificationError);
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

  // Helper function to delete all user data from collections
  const deleteAllUserData = async (userId) => {
    const collectionsToClean = [
      {
        id: import.meta.env.VITE_APPWRITE_COLLECTION_ID,
        name: "ideas",
      },
      {
        id: "user-preferences",
        name: "preferences",
      },
    ];

    const deletionPromises = [];

    for (const collection of collectionsToClean) {
      try {
        // Get all documents for this user
        const userDocuments = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          collection.id,
          [Query.equal("userId", userId)]
        );

        // Add deletion promises for all documents
        userDocuments.documents.forEach((doc) => {
          deletionPromises.push(
            databases
              .deleteDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                collection.id,
                doc.$id
              )
              .catch((error) => {
                console.warn(
                  `Error deleting ${collection.name} document ${doc.$id}:`,
                  error
                );
              })
          );
        });

        console.log(
          `Found ${userDocuments.documents.length} ${collection.name} documents to delete`
        );
      } catch (error) {
        console.warn(`Error fetching ${collection.name} documents:`, error);
      }
    }

    // Execute all deletions in parallel
    if (deletionPromises.length > 0) {
      await Promise.allSettled(deletionPromises);
      console.log(`Completed deletion of ${deletionPromises.length} documents`);
    }
  };

  // Delete account with complete data removal
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

      // Delete all user data from database collections
      await deleteAllUserData(currentUser.$id);

      // Mark account as deleted in localStorage
      markAccountAsDeleted(currentUser.email);

      // Delete all sessions to log out
      await account.deleteSessions();

      // Clear local state
      setUser(null);

      // Clear any cached data
      localStorage.removeItem("user");
      localStorage.removeItem("ideas");

      // Note: We cannot delete the actual Appwrite user account from client-side
      // The user account will remain in Appwrite but all associated data is removed
      // and the account is marked as deleted locally

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

          // Clear any "deleted" status for OAuth logins since they create new sessions
          if (isAccountDeleted(loggedIn.email)) {
            removeFromDeletedAccounts(loggedIn.email);
          }

          setUser(loggedIn);
          await account.updatePrefs({ authMethod: "oauth" }); // Set authMethod for OAuth

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

  // Handle email verification redirect
  useEffect(() => {
    const handleVerificationRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get("userId");
      const secret = urlParams.get("secret");
      const isVerificationPage = window.location.pathname === "/verify-email";

      if (userId && secret && isVerificationPage) {
        try {
          await verifyEmail(userId, secret);
          // Clear URL parameters
          window.history.replaceState({}, document.title, "/");
        } catch (error) {
          console.error("Verification failed:", error);
        }
      }
    };

    if (isInitialized && !loading) {
      handleVerificationRedirect();
    }
  }, [isInitialized, loading]);

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
    isUserVerified,
    sendVerificationEmail,
    verifyEmail,
    account,
    databases,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}
