"use client";

import { useCallback, useRef, useState } from "react";
import { CommandPalette, type SearchableItem } from "@/components/ui/CommandPalette";
import styles from "./SidebarHome.module.css";

/**
 * The sidebar search field, in the shape a blog of this era would have had.
 *
 * It is an entry point rather than a second search: whatever is typed here is
 * handed to the command palette, which owns the index and the results. That
 * keeps one implementation and one set of behaviours.
 */
export function SidebarSearch() {
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

  return (
    <>
      <form
        className={styles.searchForm}
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          openWith(query);
        }}
      >
        <input
          type="search"
          value={query}
          aria-label="Search this site"
          placeholder="Search"
          className={styles.searchInput}
          onFocus={() => void loadIndex()}
          onChange={(event) => openWith(event.target.value)}
        />
        <button type="submit" className={styles.searchGo}>
          Go
        </button>
      </form>
      <p className={styles.searchHint}>Searches posts, projects and nuggets.</p>

      <CommandPalette
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={items}
        query={query}
        onQueryChange={setQuery}
      />
    </>
  );
}
