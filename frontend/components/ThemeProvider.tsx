"use client";

import { useSiteNavigation } from "./NavigationProvider";
import { lifeNotes } from "@/lib/life-notes";
import { notes } from "@/lib/site-content";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";

export type SiteMode = "life" | "work";

type ModeContextValue = { mode: SiteMode; setMode: (mode: SiteMode) => void };

const STORAGE_KEY = "selfsite-4175-mode";
const ModeContext = createContext<ModeContextValue>({ mode: "life", setMode: () => undefined });

function applyMode(mode: SiteMode) {
  const root = document.documentElement;
  root.dataset.mode = mode;
  root.dataset.theme = mode === "work" ? "dark" : "light";
  root.style.colorScheme = mode === "work" ? "dark" : "light";
}

function readSavedMode(): SiteMode {
  const mode = document.documentElement.dataset.mode;
  if (mode === "life" || mode === "work") return mode;

  try {
    const savedMode = window.localStorage.getItem(STORAGE_KEY);
    if (savedMode === "life" || savedMode === "work") return savedMode;
    return window.localStorage.getItem("selfsite-4175-theme") === "dark" ? "work" : "life";
  } catch {
    return "life";
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<SiteMode>("life");

  useLayoutEffect(() => {
    const savedMode = readSavedMode();
    setModeState(savedMode);
    applyMode(savedMode);
  }, []);

  const setMode = useCallback((nextMode: SiteMode) => {
    setModeState(nextMode);
    applyMode(nextMode);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextMode);
    } catch {
      // The selected mode still applies for this session when storage is unavailable.
    }
  }, []);

  useEffect(() => {
    const restore = (event: Event) => {
      const nextMode = (event as CustomEvent).detail;
      if (nextMode === "life" || nextMode === "work") setMode(nextMode);
    };
    window.addEventListener("zfy:restore-mode", restore);
    return () => window.removeEventListener("zfy:restore-mode", restore);
  }, [setMode]);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);
  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useSiteMode() {
  return useContext(ModeContext);
}

export function ModeToggle({ className = "" }: { className?: string }) {
  const { mode, setMode } = useSiteMode();
  const { navigate } = useSiteNavigation();
  const chooseMode = (next: SiteMode) => {
    if (next === mode) return;
    if (window.location.pathname === "/notes") {
      const collection = next === "life" ? lifeNotes : notes;
      navigate(`/notes?note=${collection[0].slug}`);
    } else setMode(next);
  };
  return (
    <div aria-label="Life / Work 页面模式" className={`mode-toggle ${className}`.trim()} role="group">
      <button
        aria-pressed={mode === "life"}
        className="mode-toggle-option"
        onClick={() => chooseMode("life")}
        type="button"
      >
        Life
      </button>
      <button
        aria-pressed={mode === "work"}
        className="mode-toggle-option"
        onClick={() => chooseMode("work")}
        type="button"
      >
        Work
      </button>
    </div>
  );
}
