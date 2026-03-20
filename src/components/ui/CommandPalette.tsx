"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogPanel,
  DialogBackdrop,
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";

interface Post {
  title: string;
  slug: string;
  summary?: string;
  tags?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
}

export function CommandPalette({ isOpen, onClose, posts }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const filteredPosts =
    debouncedQuery === ""
      ? posts.slice(0, 5)
      : posts.filter((post) => {
          const q = debouncedQuery.toLowerCase();
          return (
            post.title.toLowerCase().includes(q) ||
            (post.summary && post.summary.toLowerCase().includes(q)) ||
            (post.tags && post.tags.some((tag) => tag.toLowerCase().includes(q)))
          );
        });

  const handleSelect = useCallback(
    (post: Post | null) => {
      if (post) {
        router.push(`/blog/${post.slug}`);
        onClose();
        setQuery("");
      }
    },
    [router, onClose]
  );

  const handleClose = useCallback(() => {
    onClose();
    setQuery("");
  }, [onClose]);

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-[300]">
      <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

      <div className="fixed inset-0 overflow-y-auto p-4 pt-[15vh]">
        <DialogPanel className="mx-auto max-w-xl overflow-hidden rounded-xl bg-[var(--color-surface-secondary)] shadow-xl ring-1 ring-[var(--color-border-default)]">
          <Combobox onChange={handleSelect}>
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-[var(--color-text-tertiary)]"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <ComboboxInput
                className="w-full border-0 border-b border-[var(--color-border-default)] bg-transparent py-3 pl-12 pr-4 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-0"
                placeholder="Search posts..."
                onChange={(event) => setQuery(event.target.value)}
                autoComplete="off"
              />
            </div>

            <ComboboxOptions
              static
              className="max-h-80 overflow-y-auto py-2"
            >
              {filteredPosts.length === 0 && debouncedQuery !== "" ? (
                <div className="px-4 py-8 text-center text-sm text-[var(--color-text-tertiary)]">
                  No results found for &quot;{debouncedQuery}&quot;
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <ComboboxOption
                    key={post.slug}
                    value={post}
                    className="cursor-pointer px-4 py-3 transition-colors data-[focus]:bg-[var(--color-surface-tertiary)]"
                  >
                    <div className="text-sm font-medium text-[var(--color-text-primary)]">
                      {post.title}
                    </div>
                    {post.summary && (
                      <div className="mt-1 line-clamp-1 text-xs text-[var(--color-text-tertiary)]">
                        {post.summary}
                      </div>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-1.5 flex gap-1.5">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)] px-2 py-0.5 text-[10px] font-medium uppercase text-[var(--color-brand-primary)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </ComboboxOption>
                ))
              )}
            </ComboboxOptions>

            {debouncedQuery === "" && filteredPosts.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-[var(--color-text-tertiary)]">
                Start typing to search posts...
              </div>
            )}

            <div className="border-t border-[var(--color-border-default)] px-4 py-2.5">
              <div className="flex items-center justify-end gap-4 text-xs text-[var(--color-text-tertiary)]">
                <span>
                  <kbd className="rounded bg-[var(--color-surface-tertiary)] px-1.5 py-0.5 font-mono text-[10px]">
                    ↑↓
                  </kbd>{" "}
                  navigate
                </span>
                <span>
                  <kbd className="rounded bg-[var(--color-surface-tertiary)] px-1.5 py-0.5 font-mono text-[10px]">
                    ↵
                  </kbd>{" "}
                  select
                </span>
                <span>
                  <kbd className="rounded bg-[var(--color-surface-tertiary)] px-1.5 py-0.5 font-mono text-[10px]">
                    esc
                  </kbd>{" "}
                  close
                </span>
              </div>
            </div>
          </Combobox>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
