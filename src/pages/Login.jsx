import { useState } from "react";
import { useUser } from "../lib/context/user";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { BsGithub, BsDiscord } from "react-icons/bs";
import { toast } from "sonner";

export function Login({ navigate }) {
  const user = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8)
      return "Password must be at least 8 characters long";
    return "";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (emailErr || passwordErr) {
      toast.error("Please fix the errors before signing in");
      return;
    }

    setIsLoading(true);
    try {
      await user.login(email, password);
      navigate("home");
      toast.success("Successfully signed in!");
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (emailErr || passwordErr) {
      toast.error("Please fix the errors before registering");
      return;
    }

    setIsLoading(true);
    try {
      await user.register(email, password);
      toast.success("Account created successfully! Please verify your email.");
    } catch (err) {
      console.error("Registration error:", err);
      if (err.message?.includes("already exists") || err.code === 409) {
        toast.error(
          "An account with this email already exists. Please sign in instead."
        );
      } else {
        toast.error("Failed to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError && value) {
      setEmailError(validateEmail(value));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordError && value) {
      setPasswordError(validatePassword(value));
    }
  };

  const handleGoogleLogin = () => {
    if (isLoading) return;
    try {
      user.loginWithGoogle();
    } catch (err) {
      toast.error("Failed to sign in with Google. Please try again.");
    }
  };

  const handleGithubLogin = () => {
    if (isLoading) return;
    try {
      user.loginWithGithub();
    } catch (err) {
      toast.error("Failed to sign in with GitHub. Please try again.");
    }
  };

  const handleDiscordLogin = () => {
    if (isLoading) return;
    try {
      user.loginWithDiscord();
    } catch (err) {
      toast.error("Failed to sign in with Discord. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl font-medium text-gray-900 dark:text-white mb-2">
            Welcome to Idea Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Professional idea management for developers
          </p>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-[#000000] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-8 shadow-lg dark:shadow-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4 text-sm">
              Sign up or sign in with your preferred method
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <motion.button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 dark:bg-white dark:hover:bg-gray-100 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-medium py-2 px-4 rounded-lg transition-all border border-gray-300 dark:border-gray-600"
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                <FcGoogle className="w-5 h-5" />
                <span className="hidden sm:inline">Google</span>
              </motion.button>

              <motion.button
                onClick={handleGithubLogin}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-all"
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                <BsGithub className="w-5 h-5" />
                <span className="hidden sm:inline">GitHub</span>
              </motion.button>

              <motion.button
                onClick={handleDiscordLogin}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-all"
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                <BsDiscord className="w-5 h-5" />
                <span className="hidden sm:inline">Discord</span>
              </motion.button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-[#000000] text-gray-600 dark:text-gray-400">
                  Or continue with email
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <input
                  type="email"
                  placeholder="developer@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => setEmailError(validateEmail(email))}
                  autoComplete="off"
                  className={`w-full bg-transparent border rounded-lg pl-10 pr-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FD366E] focus:border-transparent transition-all ${
                    emailError
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                  required
                  disabled={isLoading}
                />
              </div>
              {emailError && (
                <p className="text-red-500 dark:text-red-400 text-sm flex items-center space-x-1">
                  <span>⚠</span>
                  <span>{emailError}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => setPasswordError(validatePassword(password))}
                  autoComplete="off"
                  className={`w-full bg-transparent border rounded-lg pl-10 pr-12 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FD366E] focus:border-transparent transition-all ${
                    passwordError
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                  required
                  disabled={isLoading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-500 dark:text-red-400 text-sm flex items-center space-x-1">
                  <span>⚠</span>
                  <span>{passwordError}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.button
                type="submit"
                disabled={
                  isLoading ||
                  !email ||
                  !password ||
                  emailError ||
                  passwordError
                }
                className="bg-[#FD366E] hover:bg-[#FD366E]/80 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition-all flex items-center justify-center order-2 sm:order-1"
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </motion.button>

              <motion.button
                type="button"
                onClick={handleRegister}
                disabled={
                  isLoading ||
                  !email ||
                  !password ||
                  emailError ||
                  passwordError
                }
                className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 dark:text-white font-medium py-2 rounded-lg transition-all order-1 sm:order-2"
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                Register
              </motion.button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <p className="text-gray-600 dark:text-gray-400 text-md text-center mb-4">
              What you'll get:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-md text-gray-700 dark:text-gray-300">
              {[
                "Organize ideas by category",
                "Priority tracking",
                "Tag your projects",
                "Real-time updates",
              ].map((feature, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#FD366E] rounded-full"></div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => navigate("home")}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-md"
            disabled={isLoading}
          >
            ← Back to Ideas
          </button>
        </motion.div>
      </div>
    </div>
  );
}
