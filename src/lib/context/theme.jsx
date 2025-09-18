import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("app-theme");
      if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
        return savedTheme;
      }
    }
    return "system";
  });

  const getSystemTheme = () => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "dark";
  };

  const getEffectiveTheme = () => {
    if (theme === "system") {
      return getSystemTheme();
    }
    return theme;
  };

  const applyTheme = (effectiveTheme) => {
    const root = document.documentElement;
    const body = document.body;

    root.classList.remove("light", "dark");
    body.classList.remove("light-theme", "dark-theme");

    root.classList.add(effectiveTheme);
    body.classList.add(`${effectiveTheme}-theme`);

    if (effectiveTheme === "dark") {
      body.style.backgroundColor = "#000000";
      body.style.color = "#ffffff";
    } else {
      body.style.backgroundColor = "#f4f4f7";
      body.style.color = "#1f2937";
    }
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
