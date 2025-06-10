import { ID } from "appwrite";
import { createContext, useContext, useEffect, useState } from "react";
import { account } from "../appwrite";
import { toast } from "sonner";

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider(props) {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const getErrorMessage = (error) => {
    if (error?.code === 401) return "Invalid email or password";
    if (error?.code === 409) return "An account with this email already exists";
    if (error?.code === 400)
      return "Please check your email and password format";
    if (error?.message) return error.message;
    return "Something went wrong. Please try again.";
  };

  async function login(email, password) {
    try {
      const loggedIn = await account.createEmailPasswordSession(
        email,
        password
      );
      setUser(loggedIn);
      toast.success("Welcome back!");
      window.location.replace("/");
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  }

  async function logout() {
    try {
      await account.deleteSession("current");
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out");
      throw error;
    }
  }

  async function register(email, password) {
    try {
      await account.create(ID.unique(), email, password);
      await login(email, password);
      toast.success("Welcome! Account created successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  }

  // Completely silent initialization
  async function init() {
    try {
      const loggedIn = await account.get();
      setUser(loggedIn);
    } catch (err) {
      setUser(null);
    } finally {
      setIsInitialized(true);
    }
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <UserContext.Provider
      value={{
        current: user,
        login,
        logout,
        register,
        isInitialized,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
}
