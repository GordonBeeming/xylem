"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  FEATURE_FLAGS,
  getFlagDefault,
  readFlagFromStorage,
  writeFlagToStorage,
} from "@/lib/feature-flags";

interface FeatureFlagContextValue {
  flags: Record<string, boolean>;
  setFlag: (key: string, value: boolean) => void;
  mounted: boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue>({
  flags: {},
  setFlag: () => {},
  mounted: false,
});

function getInitialFlags(): Record<string, boolean> {
  const flags: Record<string, boolean> = {};
  for (const flag of FEATURE_FLAGS) {
    flags[flag.key] = getFlagDefault(flag.key);
  }
  return flags;
}

function readAllFlags(): Record<string, boolean> {
  const flags: Record<string, boolean> = {};
  for (const flag of FEATURE_FLAGS) {
    const stored = readFlagFromStorage(flag.key);
    flags[flag.key] = stored ?? flag.defaultValue;
  }
  return flags;
}

function syncCssClasses(flags: Record<string, boolean>) {
  const el = document.documentElement;
  for (const flag of FEATURE_FLAGS) {
    if (flag.cssClass) {
      if (flags[flag.key]) {
        el.classList.add(flag.cssClass);
      } else {
        el.classList.remove(flag.cssClass);
      }
    }
  }
}

export function FeatureFlagProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [flags, setFlags] = useState<Record<string, boolean>>(getInitialFlags);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Flags remain settable via URL params (e.g. ?ssw-theme=true) now that
    // the dedicated /flags page is gone — this was previously handled there.
    const urlParams = new URLSearchParams(window.location.search);
    const stored = readAllFlags();
    for (const flag of FEATURE_FLAGS) {
      const paramValue = urlParams.get(flag.key);
      if (paramValue !== null) {
        const value = paramValue === "true";
        writeFlagToStorage(flag.key, value);
        stored[flag.key] = value;
      }
    }
    setFlags(stored);
    syncCssClasses(stored);
    setMounted(true);
  }, []);

  const setFlag = useCallback((key: string, value: boolean) => {
    writeFlagToStorage(key, value);
    setFlags((prev) => {
      const next = { ...prev, [key]: value };
      syncCssClasses(next);
      return next;
    });
  }, []);

  return (
    <FeatureFlagContext.Provider value={{ flags, setFlag, mounted }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagContext);
}
