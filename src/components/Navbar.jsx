import { useState, useRef, useEffect } from "react";
import { useUser } from "../lib/context/user";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSwitcher } from "./LanguageSwitcher";
import AccountSettings from "./dialogs/AccountSettings";
import NotificationPreferences from "./dialogs/NotificationPreferences";
import ThemeSelector from "./ThemeSelector";
import moment from "moment";
import {
  Home,
  User,
  LogIn,
  LogOut,
  Lightbulb,
  Sparkles,
  ChevronDown,
  Settings,
  Bell,
  Compass,
} from "lucide-react";
import { SiGithub } from "react-icons/si";
import AnnouncementBar from "./AnnouncementBar";

function Navbar({ navigate, currentPage }) {
  const user = useUser();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await user.logout();
      navigate("home");
      setShowUserDropdown(false);
    } catch (error) {
      console.error("Logout error:", error);
      navigate("home");
      setShowUserDropdown(false);
    }
  };

  const openSettings = () => {
    setShowSettings(true);
    setShowUserDropdown(false);
  };

  const openNotifications = () => {
    setShowNotifications(true);
    setShowUserDropdown(false);
  };

  const getAvatarContent = () => {
    const currentUser = user.current;
    if (!currentUser) return "?";

    // Generate initials fallback
    let initials = "";
    if (currentUser.name) {
      initials = currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    } else if (currentUser.email) {
      const emailParts = currentUser.email.split("@")[0].split(".");
      initials = emailParts
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }

    return initials || "U";
  };

  const renderUserAvatar = () => {
    const currentUser = user.current;
    if (!currentUser || !user.userDataLoaded) {
      return (
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
      );
    }

    let imageUrl = null;

    // Custom uploaded profile picture
    if (currentUser.prefs?.profilePictureId) {
      try {
        imageUrl = user.getProfilePictureUrl(
          currentUser.prefs.profilePictureId
        );
      } catch (e) {
        console.warn("Failed to get profile picture URL:", e);
      }
    }

    // OAuth avatar URL (for GitHub, Google, Discord)
    if (!imageUrl && currentUser.avatarUrl) {
      imageUrl = currentUser.avatarUrl;
    }

    if (imageUrl) {
      return (
        <div className="relative w-8 h-8">
          <img
            src={imageUrl}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
            onLoad={(e) => {
              // Hide fallback when image loads successfully
              const fallback = e.target.nextElementSibling;
              if (fallback) fallback.style.display = "none";
            }}
            onError={(e) => {
              console.warn("Profile image failed to load:", imageUrl);
              e.target.style.display = "none";
              const fallback = e.target.nextElementSibling;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          {/* Fallback div - always present but hidden when image loads */}
          <div className="w-8 h-8 rounded-full bg-[#FD366E] flex items-center justify-center text-white font-medium text-sm absolute inset-0">
            {getAvatarContent()}
          </div>
        </div>
      );
    }

    // Fallback to initials only
    return (
      <div className="w-8 h-8 rounded-full bg-[#FD366E] flex items-center justify-center text-white font-medium text-sm">
        {getAvatarContent()}
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (user.loading) {
    return (
      <motion.nav
        className="bg-[#FFFFFF]/50 dark:bg-[#000000]/50 backdrop-blur-sm sticky top-0 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex flex-row sm:items-center justify-between gap-2 sm:gap-0 py-4 sm:py-0">
            <motion.button
              onClick={() => navigate("home")}
              className="flex items-center space-x-3 text-gray-900 dark:text-white font-medium text-xl"
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
              <span>Idea Tracker</span>
            </motion.button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </motion.nav>
    );
  }

  return (
    <>
      <AnnouncementBar />

      <motion.nav
        className="bg-[#FFFFFF]/50 dark:bg-[#000000]/50 backdrop-blur-sm sticky top-0 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0 }}
      >
        <div className="max-w-2xl mx-auto px-2 sm:px-4 py-1.5 sm:py-3">
          <div className="flex flex-row sm:items-center justify-between gap-2 sm:gap-0 py-2 sm:py-0">
            <motion.button
              onClick={() => navigate("home")}
              className="flex items-center space-x-3 text-gray-900 dark:text-white font-bold text-xl"
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
              <span className="hidden font-medium sm:inline">
                {!user?.current && "Idea Tracker"}
              </span>
            </motion.button>

            <div className="flex flex-wrap justify-end items-center space-x-1 sm:space-x-2">
              {user.current ? (
                <>
                  <NavButton
                    icon={Home}
                    label="Home"
                    isActive={currentPage === "home"}
                    onClick={() => navigate("home")}
                  />
                  <NavButton
                    icon={Compass}
                    label="Discover"
                    isActive={currentPage === "discover"}
                    onClick={() => navigate("discover")}
                  />
                  <NavButton
                    icon={User}
                    label="Profile"
                    isActive={currentPage === "profile"}
                    onClick={() => navigate("profile")}
                  />

                  <div className="pl-1.5">
                    <LanguageSwitcher />
                  </div>

                  <motion.a
                    href="https://github.com/AbhiVarde/Idea-tracker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative sm:hidden flex items-center justify-center text-gray-700 dark:text-white p-2 rounded-lg transition-all duration-300"
                    whileHover={{
                      scale: 1.15,
                      y: -2,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      },
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SiGithub className="w-5 h-5" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-10">
                      View Code
                    </div>
                  </motion.a>

                  <div
                    className="relative ml-2 sm:ml-4 pl-3 border-l border-gray-300 dark:border-gray-700"
                    ref={dropdownRef}
                  >
                    <motion.button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="relative select-none">
                        {renderUserAvatar()}
                      </div>
                      <motion.div
                        animate={{ rotate: showUserDropdown ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </motion.div>
                    </motion.button>

                    <AnimatePresence>
                      {showUserDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.98 }}
                          transition={{
                            duration: 0.25,
                            ease: [0.25, 0.1, 0.25, 1],
                          }}
                          className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#000000] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50"
                        >
                          <div className="p-2">
                            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800 mb-1">
                              <p className="text-sm text-gray-900 dark:text-white font-medium truncate">
                                {user.current.email}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Joined{" "}
                                {moment(user.current.$createdAt).format(
                                  "MMM D, YYYY"
                                )}
                              </p>
                            </div>

                            <ThemeSelector variant="dropdown" />

                            <motion.button
                              onClick={openNotifications}
                              className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60 rounded-lg transition-colors duration-200 ease-in-out"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Bell className="w-4 h-4" />
                              <span className="text-sm">Notifications</span>
                            </motion.button>

                            <motion.button
                              onClick={openSettings}
                              className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60 rounded-lg transition-colors duration-200 ease-in-out"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Settings className="w-4 h-4" />
                              <span className="text-sm">Settings</span>
                            </motion.button>

                            <motion.button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-3 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors duration-200 ease-in-out"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <LogOut className="w-4 h-4" />
                              <span className="text-sm">Sign Out</span>
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="pl-1.5">
                      <LanguageSwitcher />
                    </div>

                    <ThemeSelector variant="mobile-dropdown" />

                    <motion.a
                      href="https://github.com/AbhiVarde/Idea-tracker"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center text-gray-700 dark:text-white p-2 rounded-lg transition-all duration-300"
                      whileHover={{
                        scale: 1.15,
                        y: -2,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        },
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <SiGithub className="w-5 h-5" />
                    </motion.a>

                    <NavButton
                      icon={LogIn}
                      label="Login"
                      isActive={true}
                      onClick={() => navigate("login")}
                      forceActiveStyle
                      compact
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      <AccountSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <NotificationPreferences
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        user={user}
      />
    </>
  );
}

function NavButton({
  icon: Icon,
  label,
  isActive,
  onClick,
  forceActiveStyle = false,
  compact = false,
}) {
  const activeStyle = "bg-[#FD366E] text-white shadow-lg shadow-[#FD366E]/20";
  const defaultStyle =
    "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/80 dark:hover:bg-[#000000]/80";

  return (
    <motion.button
      onClick={onClick}
      className={`flex items-center space-x-2 ${
        compact ? "p-2" : "px-3 sm:px-4 py-2"
      } rounded-lg transition-all duration-300 ${
        isActive || forceActiveStyle ? activeStyle : defaultStyle
      }`}
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Icon className="w-4 h-4" />
      {!compact && (
        <span className="hidden sm:inline text-sm font-medium">{label}</span>
      )}
    </motion.button>
  );
}

export default Navbar;
