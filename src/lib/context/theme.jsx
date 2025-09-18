import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Simplified initialization since CSS handles the styling
const initializeTheme = () => {
  if (typeof window === "undefined") return "light";

  const savedTheme = localStorage.getItem("app-theme");
  const validThemes = ["light", "dark", "system"];
  const theme = validThemes.includes(savedTheme) ? savedTheme : "light";

  const getSystemTheme = () => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const effectiveTheme = theme === "system" ? getSystemTheme() : theme;

  // Only apply the class, CSS handles the rest
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(effectiveTheme);

  return theme;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => initializeTheme());

  const getSystemTheme = () => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  };

  const getEffectiveTheme = () => {
    if (theme === "system") {
      return getSystemTheme();
    }
    return theme;
  };

  const applyTheme = (effectiveTheme) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(effectiveTheme);
  };

  useEffect(() => {
    const effectiveTheme = getEffectiveTheme();
    applyTheme(effectiveTheme);
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        const effectiveTheme = getEffectiveTheme();
        applyTheme(effectiveTheme);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const setThemeMode = (newTheme) => {
    if (["light", "dark", "system"].includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        effectiveTheme: getEffectiveTheme(),
        setTheme: setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
