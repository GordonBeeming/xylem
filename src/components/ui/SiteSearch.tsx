"use client";

import { useState } from "react";
import { useSiteSearch } from "@/components/ui/SiteSearchProvider";
import styles from "./SiteSearch.module.css";

/**
 * The sidebar search field, in the shape a blog of this era would have had.
 *
 * It hands whatever is typed here to the command palette via
 * `SiteSearchProvider`, which owns the index and the results. That palette
 * is also reachable through Cmd+K on every page, so this field is a second
 * entry point rather than the only one.
 */
export function SiteSearch() {
  const [query, setQuery] = useState("");
  const { openWith, preload } = useSiteSearch();

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
          onFocus={preload}
          onChange={(event) => {
            setQuery(event.target.value);
            openWith(event.target.value);
          }}
        />
        <button type="submit" className={styles.searchGo}>
          Go
        </button>
      </form>
      <p className={styles.searchHint}>Searches posts, projects and nuggets.</p>
    </>
  );
}
