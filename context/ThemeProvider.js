"use client";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Sync with the theme that was already applied by the script
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    const newIsDark = !html.classList.contains("dark");

    if (newIsDark) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    }
  };

  // Prevent hydration mismatch by rendering children immediately
  // The theme is already applied by the blocking script
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
