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

  // Local deleted accounts
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
    localStorage.setItem(
      "deletedAccounts",
      JSON.stringify(deletedAccounts.filter((e) => e !== email))
    );
  };

  // Init user on mount
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
    } catch {
      setUser(null);
      setUserDataLoaded(true);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Check if verified
  const isUserVerified = () =>
    user?.prefs?.authMethod === "oauth" || user?.emailVerification === true;

  // Send verification email
  const sendVerificationEmail = async () => {
    try {
      await account.createVerification(
        `${window.location.origin}/verify-email`
      );
      toast.success("Verification email sent!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to send verification email");
      return false;
    }
  };

  // Verify email via URL
  const verifyEmail = async (userId, secret) => {
    try {
      await account.updateVerification(userId, secret);
      const updatedUser = await account.get();
      setUser(updatedUser);
      toast.success("Email verified!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Verification failed");
      return false;
    }
  };

  // Profile picture
  const uploadProfilePicture = async (file) => {
    try {
      if (user?.prefs?.profilePictureId) {
        await storage
          .deleteFile(
            import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID,
            user.prefs.profilePictureId
          )
          .catch(() => {});
      }
      const uploadedFile = await storage.createFile(
        import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID,
        ID.unique(),
        file
      );
      await account.updatePrefs({
        ...user.prefs,
        profilePictureId: uploadedFile.$id,
      });
      setUser(await account.get());
      toast.success("Profile picture updated!");
      return uploadedFile.$id;
    } catch (error) {
      console.error(error);
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
      await account.updatePrefs({ ...user.prefs, profilePictureId: null });
      setUser(await account.get());
      toast.success("Profile picture removed!");
    } catch (error) {
      console.error(error);
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

  // Login/register
  const login = async (email, password) => {
    try {
      if (isAccountDeleted(email)) throw new Error("Account deleted");
      await account.createEmailPasswordSession(email, password);
      const loggedIn = await account.get();
      setUser(loggedIn);
      await account.updatePrefs({ authMethod: "email" });
      if (!loggedIn.emailVerification) toast.warning("Verify your email");
      else toast.success("Logged in!");
      return loggedIn;
    } catch (error) {
      console.error(error);
      if (error.message !== "Account deleted") toast.error("Login failed");
      throw error;
    }
  };

  const register = async (email, password) => {
    try {
      if (isAccountDeleted(email)) removeFromDeletedAccounts(email);
      await account.create(ID.unique(), email, password);
      await account.createEmailPasswordSession(email, password);
      const loggedIn = await account.get();
      await account.updatePrefs({ authMethod: "email" });
      setUser(loggedIn);
      setUserDataLoaded(true);
      setLoading(false);
      try {
        await account.createVerification(
          `${window.location.origin}/verify-email`
        );
        toast.success("Account created! Verify your email.");
      } catch {
        toast.success("Account created!");
      }
      return loggedIn;
    } catch (error) {
      console.error(error);
      toast.error("Registration failed");
      throw error;
    }
  };

  // OAuth
  const loginWithGoogle = () =>
    account.createOAuth2Token(
      OAuthProvider.Google,
      `${window.location.origin}/`,
      `${window.location.origin}/login`
    );
  const loginWithGithub = () =>
    account.createOAuth2Token(
      OAuthProvider.Github,
      `${window.location.origin}/`,
      `${window.location.origin}/login`
    );
  const loginWithDiscord = () =>
    account.createOAuth2Token(
      OAuthProvider.Discord,
      `${window.location.origin}/`,
      `${window.location.origin}/login`
    );

  const logout = async () => {
    try {
      await account.deleteSession("current");
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
    }
  };

  // Delete all user data
  const deleteAllUserData = async (userId) => {
    const collections = [
      { id: import.meta.env.VITE_APPWRITE_COLLECTION_ID, name: "ideas" },
      { id: "user-preferences", name: "preferences" },
    ];
    const deletions = [];
    for (const col of collections) {
      try {
        const docs = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          col.id,
          [Query.equal("userId", userId)]
        );
        docs.documents.forEach((doc) =>
          deletions.push(
            databases
              .deleteDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                col.id,
                doc.$id
              )
              .catch(console.warn)
          )
        );
      } catch (error) {
        console.warn(error);
      }
    }
    await Promise.allSettled(deletions);
  };

  // Delete account
  const deleteAccount = async () => {
    try {
      const currentUser = await account.get();
      if (currentUser?.prefs?.profilePictureId)
        await storage
          .deleteFile(
            import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID,
            currentUser.prefs.profilePictureId
          )
          .catch(() => {});
      await deleteAllUserData(currentUser.$id);
      markAccountAsDeleted(currentUser.email);
      await account.deleteSessions();
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("ideas");
      return true;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to delete account");
    }
  };

  // Init on mount
  useEffect(() => {
    init();
  }, [init]);

  // OAuth redirect handler
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      if (oauthProcessed) return;
      const params = new URLSearchParams(window.location.search);
      const userId = params.get("userId");
      const secret = params.get("secret");
      if (userId && secret) {
        setOauthProcessed(true);
        try {
          setLoading(true);
          await account.createSession(userId, secret);
          const loggedIn = await account.get();
          if (isAccountDeleted(loggedIn.email))
            removeFromDeletedAccounts(loggedIn.email);
          setUser(loggedIn);
          await account.updatePrefs({ authMethod: "oauth" });
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          toast.success("Logged in!");
        } catch (error) {
          console.error(error);
          toast.error("OAuth login failed");
          setOauthProcessed(false);
        } finally {
          setLoading(false);
        }
      }
    };
    if (isInitialized && !loading) handleOAuthRedirect();
  }, [isInitialized, loading, oauthProcessed]);

  // Email verification redirect
  useEffect(() => {
    const handleVerificationRedirect = async () => {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get("userId");
      const secret = params.get("secret");
      if (userId && secret && window.location.pathname === "/verify-email") {
        try {
          await verifyEmail(userId, secret);
          window.history.replaceState({}, document.title, "/");
        } catch (error) {
          console.error(error);
        }
      }
    };
    if (isInitialized && !loading) handleVerificationRedirect();
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
