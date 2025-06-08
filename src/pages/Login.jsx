import { useState } from "react";
import { useUser } from "../lib/context/user";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export function Login({ navigate }) {
  const user = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await user.login(email, password);
      navigate("home");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await user.register(email, password);
      navigate("home");
    } catch (err) {
      setError("Registration failed. Email might already exist.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Welcome to Idea Tracker
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Professional idea management for developers
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          className="bg-[#1D1D1D] border border-gray-800 rounded-2xl p-5 sm:p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div
                className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-2 rounded-lg text-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="email"
                  placeholder="developer@appwrite.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FD366E] focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Your secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border border-gray-700 rounded-lg pl-10 pr-12 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FD366E] focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.button
                type="submit"
                disabled={isLoading}
                className="bg-[#FD366E] hover:bg-[#FD366E]/80 disabled:bg-gray-600 text-white font-medium py-2 rounded-lg transition-all flex items-center justify-center order-2 sm:order-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Sign In"
                )}
              </motion.button>

              <motion.button
                type="button"
                onClick={handleRegister}
                disabled={isLoading}
                className="bg-transparent hover:bg-gray-800 border border-gray-700 hover:border-gray-600 text-white font-medium py-2 rounded-lg transition-all order-1 sm:order-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Register
              </motion.button>
            </div>
          </form>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <p className="text-gray-400 text-md text-center mb-4">
              What you'll get:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-md text-gray-300">
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

        {/* Back Link */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => navigate("home")}
            className="text-gray-400 hover:text-white transition-colors text-md"
          >
            ← Back to Ideas
          </button>
        </motion.div>
      </div>
    </div>
  );
}
