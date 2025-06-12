import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { account, databases } from "../appwrite";
import { OAuthProvider, Query } from "appwrite";
import { toast } from "sonner";

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

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
        return;
      }

      setUser(loggedIn);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [isInitialized]);

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

      await account.create("unique()", email, password);
      await account.createEmailPasswordSession(email, password);
      const loggedIn = await account.get();
      setUser(loggedIn);
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
    account.createOAuth2Session(
      OAuthProvider.Google,
      `${window.location.origin}/`,
      `${window.location.origin}/login`
    );
  };

  const loginWithGithub = () => {
    account.createOAuth2Session(
      OAuthProvider.Github,
      `${window.location.origin}/`,
      `${window.location.origin}/login`
    );
  };

  const loginWithDiscord = () => {
    account.createOAuth2Session(
      OAuthProvider.Discord,
      `${window.location.origin}/`,
      `${window.location.origin}/login`
    );
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

      try {
        const userDocuments = await databases.listDocuments(
          process.env.REACT_APP_APPWRITE_DATABASE_ID,
          process.env.REACT_APP_APPWRITE_COLLECTION_ID,
          [Query.equal("userId", currentUser.$id)]
        );

        if (userDocuments.documents.length > 0) {
          const deletePromises = userDocuments.documents.map((doc) =>
            databases.deleteDocument(
              process.env.REACT_APP_APPWRITE_DATABASE_ID,
              process.env.REACT_APP_APPWRITE_COLLECTION_ID,
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

  // Handle OAuth redirect
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("userId") || urlParams.get("secret")) {
        try {
          const loggedIn = await account.get();
          setUser(loggedIn);
          // Clean URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } catch (error) {
          console.error("OAuth redirect error:", error);
        }
      }
    };

    if (isInitialized && !loading) {
      handleOAuthRedirect();
    }
  }, [isInitialized, loading]);

  const contextValue = {
    current: user,
    loading,
    login,
    logout,
    register,
    loginWithGoogle,
    loginWithGithub,
    loginWithDiscord,
    deleteAccount,
    account,
    databases,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}
