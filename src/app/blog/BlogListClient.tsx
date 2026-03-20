"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { TagPill } from "@/components/ui/TagPill";
import { YearPill } from "@/components/ui/YearPill";
import Link from "next/link";
import { slug } from "github-slugger";

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
  yearCounts: Record<string, number>;
}

const POSTS_PER_PAGE = 10;

function slugifyTag(tag: string): string {
  return slug(tag).replace(/--+/g, "-");
}

function BlogListInner({ allPosts, tagCounts, yearCounts }: BlogListClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Sync state from URL on mount
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const tag = searchParams.get("tag") ?? "";
    const year = searchParams.get("year") ?? "";
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    setSearchQuery(q);
    setSelectedTag(tag);
    setSelectedYear(year);
    setCurrentPage(isNaN(page) || page < 1 ? 1 : page);
    if (q && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchParams]);

  // Update URL when filters change
  const updateUrl = useCallback(
    (q: string, tag: string, year: string, page: number) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (tag) params.set("tag", tag);
      if (year) params.set("year", year);
      if (page > 1) params.set("page", String(page));
      const qs = params.toString();
      router.replace(`${pathname}${qs ? "?" + qs : ""}`, { scroll: false });
    },
    [router, pathname]
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    updateUrl(value, selectedTag, selectedYear, 1);
  };

  const handleTagChange = (tag: string) => {
    const newTag = selectedTag === tag ? "" : tag;
    setSelectedTag(newTag);
    setCurrentPage(1);
    updateUrl(searchQuery, newTag, selectedYear, 1);
  };

  const handleYearChange = (year: string) => {
    const newYear = selectedYear === year ? "" : year;
    setSelectedYear(newYear);
    setCurrentPage(1);
    updateUrl(searchQuery, selectedTag, newYear, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrl(searchQuery, selectedTag, selectedYear, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter posts
  const filteredPosts = allPosts.filter((post) => {
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

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  // Top tags (sorted by count, top 20)
  const sortedTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([tag]) => tag);

  // Years sorted descending
  const sortedYears = Object.keys(yearCounts).sort((a, b) => Number(b) - Number(a));

  const hasFilters = searchQuery || selectedTag || selectedYear;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          All Posts
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)]">
          Explore {allPosts.length} articles about development, technology, and more
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label htmlFor="blog-search" className="sr-only">
          Search blog posts
        </label>
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-tertiary)]"
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
            className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-secondary)] py-3 pl-12 pr-4 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
            autoComplete="off"
          />
        </div>
      </div>

      {/* Year pills */}
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by year">
        {sortedYears.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => handleYearChange(year)}
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              selectedYear === year
                ? "bg-[var(--color-brand-primary)] text-[var(--color-text-on-primary)]"
                : "bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)] text-[var(--color-brand-primary)] hover:brightness-95"
            }`}
            aria-pressed={selectedYear === year}
          >
            {year} ({yearCounts[year]})
          </button>
        ))}
      </div>

      {/* Tag pills */}
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
        {sortedTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleTagChange(tag)}
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide whitespace-nowrap transition-all duration-200 ${
              selectedTag.toLowerCase() === tag.toLowerCase()
                ? "bg-[var(--color-brand-primary)] text-[var(--color-text-on-primary)]"
                : "bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)] text-[var(--color-brand-primary)] hover:brightness-95"
            }`}
            aria-pressed={selectedTag.toLowerCase() === tag.toLowerCase()}
          >
            {tag} ({tagCounts[tag]})
          </button>
        ))}
        {Object.keys(tagCounts).length > 20 && (
          <Link
            href="/tags"
            className="inline-block rounded-full px-3 py-1 text-xs font-medium text-[var(--color-text-secondary)] underline transition-colors hover:text-[var(--color-brand-primary)]"
          >
            View all tags
          </Link>
        )}
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedTag("");
              setSelectedYear("");
              setCurrentPage(1);
              updateUrl("", "", "", 1);
            }}
            className="rounded-lg bg-[var(--color-surface-tertiary)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-border-default)]"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="mb-6" role="status" aria-live="polite">
        <p className="text-sm text-[var(--color-text-secondary)]">
          {filteredPosts.length === 0
            ? "No posts found"
            : `Showing ${startIndex + 1}–${Math.min(startIndex + POSTS_PER_PAGE, filteredPosts.length)} of ${filteredPosts.length} post${filteredPosts.length !== 1 ? "s" : ""}`}
          {selectedTag && ` tagged "${selectedTag}"`}
          {selectedYear && ` from ${selectedYear}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {/* Posts grid */}
      {paginatedPosts.length > 0 ? (
        <section aria-label="Blog posts">
          <div className="grid gap-6 md:grid-cols-2">
            {paginatedPosts.map((post) => (
              <BlogPostCard key={post.slug} post={post} headingLevel={2} />
            ))}
          </div>
        </section>
      ) : (
        <div className="py-12 text-center">
          <p className="text-[var(--color-text-tertiary)]">
            No posts match your criteria. Try adjusting your filters.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-4" aria-label="Blog posts pagination">
          <button
            type="button"
            onClick={() => handlePageChange(safePage - 1)}
            disabled={safePage <= 1}
            className="rounded-lg bg-[var(--color-surface-secondary)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-tertiary)] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="text-sm text-[var(--color-text-secondary)]" aria-current="page">
            Page {safePage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => handlePageChange(safePage + 1)}
            disabled={safePage >= totalPages}
            className="rounded-lg bg-[var(--color-surface-secondary)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-tertiary)] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}

export default function BlogListClient(props: BlogListClientProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
              All Posts
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)]">
              Explore {props.allPosts.length} articles about development, technology, and more
            </p>
          </div>
          <div className="py-12 text-center text-[var(--color-text-tertiary)]">Loading...</div>
        </div>
      }
    >
      <BlogListInner {...props} />
    </Suspense>
  );
}
