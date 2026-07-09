"use client";

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PostListItem } from "@/components/ds/PostListItem";
import Link from "next/link";
import { slug } from "github-slugger";
import { formatDateShort } from "@/lib/content";

interface PostData {
  title: string;
  date: string;
  summary: string;
  tags: string[];
  slug: string;
  readingTime: { text: string; minutes: number };
}

interface BlogListClientProps {
  allPosts: PostData[];
  tagCounts: Record<string, number>;
  tagDisplayNames: Record<string, string>;
  yearCounts: Record<string, number>;
}

const mono = { fontFamily: "var(--font-mono)" };

function slugifyTag(tag: string): string {
  return slug(tag).replace(/--+/g, "-");
}

function groupByYear(posts: PostData[]): [number, PostData[]][] {
  const map = new Map<number, PostData[]>();
  for (const post of posts) {
    const year = new Date(post.date).getFullYear();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(post);
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0]);
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="cursor-pointer whitespace-nowrap rounded-[var(--radius-md)] px-3 py-[6px] text-[length:var(--text-xs)] tracking-[var(--ls-wide)] transition-[var(--transition-colors)]"
      style={{
        ...mono,
        background: active ? "var(--accent)" : "transparent",
        color: active ? "var(--text-on-accent)" : "var(--text-muted)",
        border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
      }}
    >
      {children}
    </button>
  );
}

function BlogListInner({ allPosts, tagCounts, tagDisplayNames, yearCounts }: BlogListClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [visibleYears, setVisibleYears] = useState(2);

  // Sync state from URL on mount
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const tag = searchParams.get("tag") ?? "";
    const year = searchParams.get("year") ?? "";
    setSearchQuery(q);
    setSelectedTag(tag);
    setSelectedYear(year);
    if (q && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchParams]);

  const updateUrl = useCallback(
    (q: string, tag: string, year: string) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (tag) params.set("tag", tag);
      if (year) params.set("year", year);
      const qs = params.toString();
      router.replace(`${pathname}${qs ? "?" + qs : ""}`, { scroll: false });
    },
    [router, pathname]
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateUrl(value, selectedTag, selectedYear);
  };

  const handleTagChange = (tag: string) => {
    const newTag = selectedTag === tag ? "" : tag;
    setSelectedTag(newTag);
    updateUrl(searchQuery, newTag, selectedYear);
  };

  const handleYearChange = (year: string) => {
    const newYear = selectedYear === year ? "" : year;
    setSelectedYear(newYear);
    updateUrl(searchQuery, selectedTag, newYear);
  };

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      if (selectedTag && !post.tags.some((t) => slugifyTag(t) === selectedTag.toLowerCase())) {
        return false;
      }
      if (selectedYear && !post.date.startsWith(selectedYear)) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(q);
        const matchesSummary = post.summary?.toLowerCase().includes(q);
        const matchesTags = post.tags.some((t) => t.toLowerCase().includes(q) || slugifyTag(t).includes(q));
        if (!matchesTitle && !matchesSummary && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [allPosts, selectedTag, selectedYear, searchQuery]);

  const groups = useMemo(() => groupByYear(filteredPosts), [filteredPosts]);

  useEffect(() => {
    setVisibleYears(2);
  }, [selectedTag, selectedYear, searchQuery]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleYears((n) => (n < groups.length ? n + 2 : n));
        }
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [groups.length]);

  const sortedTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([tag]) => tag);

  const sortedYears = Object.keys(yearCounts).sort((a, b) => Number(b) - Number(a));

  const hasFilters = Boolean(searchQuery || selectedTag || selectedYear);
  const shown = groups.slice(0, visibleYears);
  const more = visibleYears < groups.length;

  return (
    <div className="page-narrow">
      <div className="eyebrow">Writing</div>
      <h1
        className="mt-3"
        style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tighter)", color: "var(--text)" }}
      >
        All posts
      </h1>
      <p
        className="mt-2.5"
        style={{ fontSize: "var(--text-md)", color: "var(--text-muted)", lineHeight: "var(--lh-relaxed)" }}
      >
        {allPosts.length} posts on development, DevOps, AI, and the occasional triathlon —
        2013 to today.
      </p>

      {/* Search */}
      <div className="relative mt-[var(--space-6)]">
        <label htmlFor="blog-search" className="sr-only">
          Search blog posts
        </label>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: "var(--text-subtle)" }}
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          id="blog-search"
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by title, tag, or summary..."
          autoComplete="off"
          className="w-full rounded-[var(--radius-md)] py-[10px] pl-11 pr-4 outline-none"
          style={{
            ...mono,
            fontSize: "var(--text-sm)",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
        />
      </div>

      {/* Year filter */}
      <div className="mt-[var(--space-5)] flex flex-wrap gap-2" role="group" aria-label="Filter by year">
        {sortedYears.map((year) => (
          <FilterPill key={year} active={selectedYear === year} onClick={() => handleYearChange(year)}>
            {year} <span style={{ opacity: 0.6 }}>{yearCounts[year]}</span>
          </FilterPill>
        ))}
      </div>

      {/* Tag filter */}
      <div className="mt-2 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by tag">
        {sortedTags.map((tag) => (
          <FilterPill key={tag} active={selectedTag.toLowerCase() === tag.toLowerCase()} onClick={() => handleTagChange(tag)}>
            {(tagDisplayNames[tag] ?? tag).toLowerCase()} <span style={{ opacity: 0.6 }}>{tagCounts[tag]}</span>
          </FilterPill>
        ))}
        {Object.keys(tagCounts).length > 20 && (
          <Link
            href="/tags"
            className="text-[length:var(--text-xs)] underline"
            style={{ ...mono, color: "var(--text-muted)" }}
          >
            view all tags
          </Link>
        )}
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setSelectedTag("");
            setSelectedYear("");
            updateUrl("", "", "");
          }}
          className="mt-3 text-[length:var(--text-xs)] underline"
          style={{ ...mono, color: "var(--text-subtle)" }}
        >
          clear filters
        </button>
      )}

      <div className="mt-[var(--space-6)]" role="status" aria-live="polite">
        <p style={{ ...mono, fontSize: "var(--text-xs)", color: "var(--text-subtle)" }}>
          {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}
          {selectedTag && ` tagged "${tagDisplayNames[selectedTag] ?? selectedTag}"`}
          {selectedYear && ` from ${selectedYear}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {shown.length > 0 ? (
        shown.map(([year, posts]) => (
          <section key={year} className="mt-[var(--space-10)]">
            <div className="mb-2 flex items-baseline gap-[var(--space-4)]">
              <h2
                className="tabular-nums"
                style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tight)", color: "var(--text)" }}
              >
                {year}
              </h2>
              <span style={{ ...mono, fontSize: "var(--text-2xs)", color: "var(--text-subtle)" }}>
                {posts.length} post{posts.length > 1 ? "s" : ""}
              </span>
              <span className="h-px flex-1" style={{ background: "var(--border)" }} />
            </div>
            {posts.map((post) => (
              <PostListItem
                key={post.slug}
                href={`/blog/${post.slug}`}
                date={formatDateShort(post.date)}
                readingTime={post.readingTime.text}
                title={post.title}
                summary={post.summary}
                tags={post.tags.slice(0, 3)}
                extraTags={Math.max(0, post.tags.length - 3)}
              />
            ))}
          </section>
        ))
      ) : (
        <div className="py-12 text-center" style={{ color: "var(--text-subtle)" }}>
          No posts match your criteria. Try adjusting your filters.
        </div>
      )}

      <div ref={sentinelRef} className="h-px" />
      {more && (
        <div
          className="py-2 pb-[var(--space-10)]"
          style={{ ...mono, fontSize: "var(--text-xs)", color: "var(--text-subtle)", letterSpacing: "var(--ls-wide)" }}
        >
          loading earlier years…
        </div>
      )}
    </div>
  );
}

export default function BlogListClient(props: BlogListClientProps) {
  return (
    <Suspense
      fallback={
        <div className="page-narrow">
          <div className="eyebrow">Writing</div>
          <h1
            className="mt-3"
            style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tighter)", color: "var(--text)" }}
          >
            All posts
          </h1>
          <div className="py-12 text-center" style={{ color: "var(--text-subtle)" }}>
            Loading...
          </div>
        </div>
      }
    >
      <BlogListInner {...props} />
    </Suspense>
  );
}
