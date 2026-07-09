"use client";

import { useEffect, useState } from "react";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import {
  CommandPalette,
  type SearchableItem,
} from "@/components/ui/CommandPalette";

export function SearchButton() {
  const { isOpen, open, close } = useCommandPalette();
  const [items, setItems] = useState<SearchableItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen || loaded) return;
    let cancelled = false;
    fetch("/search-index.json")
      .then((res) => res.json())
      .then((data: SearchableItem[]) => {
        if (!cancelled) {
          setItems(data);
          setLoaded(true);
        }
      })
      .catch((err) => {
        console.error("Failed to load search index:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, loaded]);

  return (
    <>
      <button
        onClick={open}
        aria-label="Search (⌘K)"
        className="nav-search flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-[11px] py-[7px] text-[length:var(--text-sm)] text-[color:var(--text-muted)] transition-[var(--transition-colors)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width={15}
          height={15}
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="nav-search-kbd">
          <kbd className="rounded-[var(--radius-xs)] border border-[var(--border-strong)] px-[6px] py-[1px] text-[length:var(--text-2xs)]">
            ⌘K
          </kbd>
        </span>
      </button>
      <CommandPalette isOpen={isOpen} onClose={close} items={items} />
    </>
  );
}
