"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setThemeState("dark");
    document.documentElement.setAttribute("data-theme", "dark");
    try {
      localStorage.setItem("aicorn-theme", "dark");
    } catch {}
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState("dark");
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  const toggleTheme = useCallback(() => {
    // Keep consistent dark theme
    setThemeState("dark");
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
