"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, useCallback } from "react";

export type ThemeChoice = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: ThemeChoice;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeChoice) => void;
}

const STORAGE_KEY = "theme";
const LOCAL_CHANGE_EVENT = "theme-local-change";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function getStoredTheme(): ThemeChoice {
  try {
    return (localStorage.getItem(STORAGE_KEY) as ThemeChoice | null) ?? "system";
  } catch {
    return "system";
  }
}
const getStoredThemeServer = (): ThemeChoice => "system";

function subscribeToThemeChanges(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(LOCAL_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LOCAL_CHANGE_EVENT, callback);
  };
}

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
const getSystemThemeServer = (): "light" | "dark" => "light";

function subscribeToSystemChanges(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

/**
 * Hand-rolled replacement for `next-themes`, which injects a raw <script>
 * element into the React tree to avoid flash-of-wrong-theme — a pattern
 * React 19 now flags as an error (a known, unresolved upstream issue on an
 * unmaintained package). The same anti-flash behavior is reproduced here
 * via `next/script[strategy=beforeInteractive]` in the root layout, which
 * Next.js exempts from that check.
 *
 * Theme/system-preference reads go through useSyncExternalStore rather than
 * state-synced-in-an-effect, so a same-tab `setTheme` call re-broadcasts via
 * a custom event (localStorage writes don't fire `storage` in the writing
 * tab itself).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeToThemeChanges, getStoredTheme, getStoredThemeServer);
  const systemTheme = useSyncExternalStore(subscribeToSystemChanges, getSystemTheme, getSystemThemeServer);
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [resolvedTheme]);

  const setTheme = useCallback((next: ThemeChoice) => {
    localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
