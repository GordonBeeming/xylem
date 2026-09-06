"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CommandPalette, type SearchableItem } from "@/components/ui/CommandPalette";

interface SiteSearchContextValue {
  /** Warms the search index without opening the palette, e.g. on input focus. */
  preload: () => void;
  /** Opens the palette carrying the given query, fetching the index first if needed. */
  openWith: (value: string) => void;
}

const SiteSearchContext = createContext<SiteSearchContextValue | null>(null);

/**
 * Mounted once in the root layout so the command palette and its Cmd+K
 * shortcut exist on every page, including ones with no search field in the
 * rail (rail={false} pages, /about's under-rail layout).
 */
export function SiteSearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchableItem[]>([]);
  const loadedRef = useRef(false);

  // The index is only worth fetching once somebody actually reaches for search.
  const loadIndex = useCallback(async () => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    try {
      const response = await fetch("/search-index.json");
      if (!response.ok) {
        throw new Error(`search index returned ${response.status}`);
      }
      setItems((await response.json()) as SearchableItem[]);
    } catch (error) {
      loadedRef.current = false;
      console.error("Failed to load the search index:", error);
    }
  }, []);

  const openWith = useCallback(
    (value: string) => {
      setQuery(value);
      setIsOpen(true);
      void loadIndex();
    },
    [loadIndex]
  );

  const preload = useCallback(() => {
    void loadIndex();
  }, [loadIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openWith("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openWith]);

  const value = useMemo(() => ({ preload, openWith }), [preload, openWith]);

  return (
    <SiteSearchContext.Provider value={value}>
      {children}
      <CommandPalette
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={items}
        query={query}
        onQueryChange={setQuery}
      />
    </SiteSearchContext.Provider>
  );
}

export function useSiteSearch(): SiteSearchContextValue {
  const context = useContext(SiteSearchContext);
  if (!context) {
    throw new Error("useSiteSearch must be used within a SiteSearchProvider");
  }
  return context;
}
