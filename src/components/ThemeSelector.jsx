import { motion } from "framer-motion";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { useTheme } from "../lib/context/theme";
import { useState, useRef, useEffect } from "react";

const ThemeSelector = ({ variant = "dropdown" }) => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const themes = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (variant === "dropdown") {
    return (
      <div className="flex items-center justify-between px-2 py-1 mb-1 gap-2">
        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
          Theme
        </p>
        <div className="flex gap-1">
          {themes.map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              onClick={() => setTheme(id)}
              className={`flex items-center justify-center p-1.5 rounded-md transition-all duration-200 ${
                theme === id
                  ? "bg-[#FD366E] text-white shadow-md ring-2 ring-[#FD366E]/20"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={label}
            >
              <Icon className="w-4 h-4" />
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // For mobile devices
  if (variant === "mobile-dropdown") {
    const currentTheme = themes.find((t) => t.id === theme);

    return (
      <div className="relative" ref={dropdownRef}>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 p-2 rounded-lg bg-gray-100/80 dark:bg-gray-800/80"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {currentTheme && <currentTheme.icon className="w-4 h-4" />}
          <ChevronDown
            className="w-3 h-3 transition-transform duration-200"
            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </motion.button>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          >
            {themes.map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                onClick={() => {
                  setTheme(id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
                  theme === id
                    ? "bg-[#FD366E]/10 text-[#FD366E] dark:text-[#FD366E]"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="hidden sm:flex gap-1 p-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-lg backdrop-blur-sm">
      {themes.map(({ id, label, icon: Icon }) => (
        <motion.button
          key={id}
          onClick={() => setTheme(id)}
          className={`flex items-center justify-center p-1.5 rounded-md transition-all duration-200 ${
            theme === id
              ? "bg-[#FD366E] text-white shadow-md"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-gray-700/80"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={label}
        >
          <Icon className="w-4 h-4" />
        </motion.button>
      ))}
    </div>
  );
};

export default ThemeSelector;
