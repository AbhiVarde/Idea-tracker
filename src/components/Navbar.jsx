import { useUser } from "../lib/context/user";
import { motion } from "framer-motion";
import { Home, User, LogIn, LogOut, Lightbulb, Sparkles } from "lucide-react";

function Navbar({ navigate, currentPage }) {
  const user = useUser();

  const handleLogout = async () => {
    await user.logout();
    navigate("home");
  };

  return (
    <motion.nav
      className="bg-[#1D1D1D]/50 backdrop-blur-sm sticky top-0 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex flex-row sm:items-center justify-between gap-2 sm:gap-0 py-4 sm:py-0">
          {/* Logo */}
          <motion.button
            onClick={() => navigate("home")}
            className="flex items-center space-x-3 text-white font-bold text-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <Lightbulb className="w-7 h-7 text-[#FD366E]" />
                <Sparkles className="w-3 h-3 text-[#FD366E] absolute -top-1 -right-1 animate-pulse" />
              </div>
            </motion.div>
            {!user?.current && <span>Idea Tracker</span>}
          </motion.button>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-end items-center space-x-2">
            {user.current ? (
              <>
                <NavButton
                  icon={Home}
                  label="Home"
                  isActive={currentPage === "home"}
                  onClick={() => navigate("home")}
                />
                <NavButton
                  icon={User}
                  label="Profile"
                  isActive={currentPage === "profile"}
                  onClick={() => navigate("profile")}
                />

                {/* User Info */}
                <div className="flex items-center space-x-3 ml-2 sm:ml-4 pl-3 border-l border-gray-700">
                  <div className="w-8 h-8 rounded-full bg-[#FD366E] flex items-center justify-center text-white font-medium text-sm select-none">
                    {user.current.avatarUrl ? (
                      <img
                        src={user.current.avatarUrl}
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      user.current.email
                        .split("@")[0]
                        .split(".")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    )}
                  </div>

                  <div className="hidden md:block text-right">
                    <p className="text-xs text-gray-400">
                      {user.current.email}
                    </p>
                  </div>

                  <motion.button
                    onClick={handleLogout}
                    className="flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </motion.button>
                </div>
              </>
            ) : (
              <NavButton
                icon={LogIn}
                label="Login"
                isActive={true}
                onClick={() => navigate("login")}
                forceActiveStyle
              />
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

function NavButton({
  icon: Icon,
  label,
  isActive,
  onClick,
  forceActiveStyle = false,
}) {
  const activeStyle = "bg-[#FD366E] text-white shadow-lg shadow-[#FD366E]/20";
  const defaultStyle = "text-gray-400 hover:text-white hover:bg-[#1D1D1D]/80";

  return (
    <motion.button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
        isActive || forceActiveStyle ? activeStyle : defaultStyle
      }`}
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline text-sm font-medium">{label}</span>
    </motion.button>
  );
}

export default Navbar;
