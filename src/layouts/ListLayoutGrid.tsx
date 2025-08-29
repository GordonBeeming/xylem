'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import yearData from 'src/app/year-data.json'
import tagData from 'src/app/tag-data.json'

interface PaginationProps {
  totalPages: number
  currentPage: number
}

interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: PaginationProps
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <nav className="flex justify-between items-center pt-8" aria-label="Blog posts pagination">
      {!prevPage && (
        <button 
          className="cursor-auto disabled:opacity-50 px-4 py-2 text-gray-500" 
          disabled={!prevPage}
          aria-label="Previous page (disabled)"
        >
          Previous
        </button>
      )}
      {prevPage && (
        <Link
          href={currentPage - 1 === 1 ? `/blog/` : `/blog/page/${currentPage - 1}`}
          rel="prev"
          className="px-4 py-2 bg-primary-800 text-white rounded-md hover:bg-primary-700 dark:bg-primary-400 dark:text-gray-900 dark:hover:bg-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900"
          aria-label={`Go to previous page (page ${currentPage - 1})`}
        >
          Previous
        </Link>
      )}
      <span className="text-gray-700 dark:text-gray-300" aria-current="page" aria-label={`Current page ${currentPage} of ${totalPages}`}>
        {currentPage} of {totalPages}
      </span>
      {!nextPage && (
        <button 
          className="cursor-auto disabled:opacity-50 px-4 py-2 text-gray-500" 
          disabled={!nextPage}
          aria-label="Next page (disabled)"
        >
          Next
        </button>
      )}
      {nextPage && (
        <Link
          href={`/blog/page/${currentPage + 1}`}
          rel="next"
          className="px-4 py-2 bg-primary-800 text-white rounded-md hover:bg-primary-700 dark:bg-primary-400 dark:text-gray-900 dark:hover:bg-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900"
          aria-label={`Go to next page (page ${currentPage + 1})`}
        >
          Next
        </Link>
      )}
    </nav>
  )
}

export default function ListLayoutGrid({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  return (
    <Suspense fallback={<ListLayoutGridFallback title={title} posts={posts} />}>
      <ListLayoutGridContent
        posts={posts}
        title={title}
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
      />
    </Suspense>
  )
}

// Fallback component for when search params are loading
function ListLayoutGridFallback({ posts, title }: { posts: CoreContent<Blog>[]; title: string }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Explore {posts.length} articles about development, technology, and more
        </p>
      </div>
      <div className="text-center">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}

// Main component that uses useSearchParams
function ListLayoutGridContent({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Populate searchQuery, tag, year from URL on mount and focus input if q is present
  useEffect(() => {
    const q = searchParams.get('q') || ''
    setSearchQuery(q)
    const tag = searchParams.get('tag') || ''
    setSelectedTag(tag)
    const year = searchParams.get('year') || ''
    setSelectedYear(year)
    if (q && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchParams])

  // Update query string when filters/search change
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedTag) params.set('tag', selectedTag)
    if (selectedYear) params.set('year', selectedYear)
    router.replace(`${pathname}${params.toString() ? '?' + params.toString() : ''}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedTag, selectedYear])

  // Get all unique tags from posts and sort by usage
  const allTags = [...new Set(posts.flatMap((post) => post.tags || []))].sort((a, b) => {
    const countA = posts.filter(post => post.tags?.includes(a)).length
    const countB = posts.filter(post => post.tags?.includes(b)).length
    return countB - countA // Sort by usage count (descending)
  })

  // Get all unique years from posts
  const yearCounts = yearData as Record<string, number>

  // Filter posts based on tag and year
  const filteredPosts = posts.filter((post) => {
    const matchesTag = selectedTag === '' || post.tags?.includes(selectedTag)
    const matchesYear =
      selectedYear === '' || new Date(post.date).getFullYear().toString() === selectedYear
    const matchesSearch =
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesTag && matchesYear && matchesSearch
  })

  const displayPosts =
    initialDisplayPosts.length > 0 && selectedTag === '' && selectedYear === '' && searchQuery === ''
      ? initialDisplayPosts
      : filteredPosts

  // Compute yearKeys, yearsWithDisplayPosts, and tagsWithDisplayPosts based on current displayPosts
  const yearKeys = Object.keys(yearCounts).reverse()

  // Only show years that have posts in the current displayPosts
  const yearsWithDisplayPosts = yearKeys.filter((year) =>
    filteredPosts.some((post) => post.date.startsWith(year))
  )

  // Only show tags that have posts in the current displayPosts
  const tagsWithDisplayPosts = allTags.filter((tag) =>
    filteredPosts.some((post) => post.tags?.includes(tag))
  )

  const tagShownLimit = selectedYear ? 30 : 15

  // Helper boolean to determine when to show year counts
  const showYearCounts = !searchQuery && !selectedTag && !selectedYear

  // Helper boolean to determine when to show tag counts  
  const showTagCounts = !searchQuery && !selectedTag && !selectedYear

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Explore {posts.length} articles about development, technology, and more
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-4">
        {/* Clear Filters Button */}
        {(searchQuery || selectedTag || selectedYear) && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedTag('')
                setSelectedYear('')
              }}
              className="px-4 py-2 mb-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
              aria-label="Clear search and filters"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Search Button */}
        <div className="relative">
          <label htmlFor="search-input" className="sr-only">
            Search blog posts by title, tag, or content
          </label>
          <input
            id="search-input"
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, tag, or content..."
            className="w-full px-4 py-3 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary-800 dark:focus:ring-primary-400 focus:border-primary-800 dark:focus:border-primary-400"
            aria-describedby="search-help"
          />
          <div id="search-help" className="sr-only">
            Type to search through all blog posts. Results will update automatically as you type.
          </div>
        </div>

        {/* Year Filter Pills */}
        <div role="group" aria-labelledby="year-filter-label" className="flex flex-wrap gap-2">
          <span id="year-filter-label" className="sr-only">Filter by year</span>
          <button
            onClick={() => setSelectedYear('')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 ${selectedYear === ''
              ? 'bg-primary-800 text-white dark:bg-primary-400 dark:text-gray-900'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            aria-pressed={selectedYear === ''}
          >
            All Years
          </button>
          {yearsWithDisplayPosts.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(selectedYear === year ? '' : year)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 ${selectedYear === year
                ? 'bg-primary-800 text-white dark:bg-primary-400 dark:text-gray-900'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              aria-pressed={selectedYear === year}
            >
              {year}{showYearCounts ? ` (${yearCounts[year]})` : ''}
            </button>
          ))}
        </div>

        {/* Tag Pills and Year Filter */}
        <div className="space-y-4">
          <div role="group" aria-labelledby="tag-filter-label" className="flex flex-wrap gap-2">
            <span id="tag-filter-label" className="sr-only">Filter by tags</span>
            <button
              onClick={() => setSelectedTag('')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 ${selectedTag === ''
                ? 'bg-primary-800 text-white dark:bg-primary-400 dark:text-gray-900'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              aria-pressed={selectedTag === ''}
            >
              All Posts
            </button>
            {tagsWithDisplayPosts.slice(0, tagShownLimit).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 ${selectedTag === tag
                  ? 'bg-primary-800 text-white dark:bg-primary-400 dark:text-gray-900'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                aria-pressed={selectedTag === tag}
              >
                {tag}{showTagCounts ? ` (${filteredPosts.filter(post => post.tags?.includes(tag)).length})` : ''}
              </button>
            ))}
            {tagsWithDisplayPosts.length > tagShownLimit && (
              <Link
                href="/tags"
                className="px-3 py-1 text-sm text-gray-600 hover:text-primary-800 dark:text-gray-300 dark:hover:text-primary-400 transition-colors underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 rounded-md"
                aria-label={`View all ${tagsWithDisplayPosts.length} tags`}
              >
                +{tagsWithDisplayPosts.length - tagShownLimit} more
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* Results Summary */}
      {(selectedTag || selectedYear || searchQuery) && (
        <div className="text-center text-gray-700 dark:text-gray-300" role="status" aria-live="polite">
          {displayPosts.length === 0 ? (
            <p>No posts found.</p>
          ) : (
            <p>
              Found {displayPosts.length} post{displayPosts.length !== 1 ? 's' : ''}
              {selectedTag && ` tagged with "${selectedTag}"`}
              {selectedYear && ` from ${selectedYear}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          )}
        </div>
      )}

      {/* Posts Grid */}
      {displayPosts.length > 0 ? (
        <section aria-label="Blog posts">
          <div className="grid gap-8 md:grid-cols-2">
            {displayPosts.map((post) => {
              const { path, date, title, summary, tags } = post
              return (
                <article key={path} className="group">
                  <div className="h-full rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 dark:bg-gray-800 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-50 dark:focus-within:ring-offset-gray-900">
                    <div className="space-y-4">
                      {/* Date */}
                      <time
                        dateTime={date}
                        className="text-sm font-medium text-gray-600 dark:text-gray-300"
                        suppressHydrationWarning
                      >
                        {formatDate(date, siteMetadata.locale)}
                      </time>

                      {/* Title */}
                      <h2 className="text-xl font-bold leading-tight">
                        <Link
                          href={`/${path}`}
                          className="text-gray-900 group-hover:text-primary-800 dark:text-gray-100 dark:group-hover:text-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 rounded-md"
                        >
                          {title}
                        </Link>
                      </h2>

                      {/* Summary */}
                      <Link
                        href={`/${path}`}
                        className="block focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 rounded-md"
                        aria-label={`Read full post: ${title}`}
                      >
                        <p className="text-gray-700 dark:text-gray-300 line-clamp-3 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                          {summary}
                        </p>
                      </Link>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {tags?.slice(0, 3).map((tag) => (
                          <Tag key={tag} text={tag} />
                        ))}
                        {tags && tags.length > 3 && (
                          <span
                            className="text-sm text-gray-600 dark:text-gray-300"
                            aria-label={`${tags.length - 3} more tags`}
                          >
                            +{tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ) : (selectedTag === '' && selectedYear === '' && searchQuery === '') ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No posts found.</p>
        </div>
      ) : null}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && !selectedTag && !selectedYear && !searchQuery && (
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
      )}
    </div>
  )
}