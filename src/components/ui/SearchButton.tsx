"use client";

import { useEffect, useState } from "react";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import {
  CommandPalette,
  type SearchableItem,
} from "@/components/ui/CommandPalette";

// The nav band is a solid dark strip in both themes, so this button cannot use
// the light surface tokens. Inheriting the band's own text colour and deriving
// the border from it keeps the chip readable wherever the button is placed.
const searchButtonStyle: React.CSSProperties = {
  fontFamily: "var(--font-ui)",
  color: "inherit",
  background: "transparent",
  border: "1px solid color-mix(in srgb, currentColor 35%, transparent)",
};

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
        className="nav-search flex min-h-11 items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[11px] text-[length:var(--text-sm)] opacity-80 transition-[var(--transition-colors)] hover:opacity-100"
        style={searchButtonStyle}
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
          <kbd
            className="rounded-[var(--radius-xs)] px-[6px] py-[1px] text-[length:var(--text-2xs)]"
            style={{ border: "1px solid color-mix(in srgb, currentColor 35%, transparent)" }}
          >
            ⌘K
          </kbd>
        </span>
      </button>
      <CommandPalette isOpen={isOpen} onClose={close} items={items} />
    </>
  );
}
