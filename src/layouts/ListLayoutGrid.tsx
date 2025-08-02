'use client'

import { useState } from 'react'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import yearData from 'src/app/year-data.json'
import { KBarButton } from 'pliny/search/KBarButton'

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
    <div className="flex justify-between items-center pt-8">
      {!prevPage && (
        <button className="cursor-auto disabled:opacity-50 px-4 py-2 text-gray-500" disabled={!prevPage}>
          Previous
        </button>
      )}
      {prevPage && (
        <Link
          href={currentPage - 1 === 1 ? `/blog/` : `/blog/page/${currentPage - 1}`}
          rel="prev"
          className="px-4 py-2 bg-primary-800 text-white rounded-md hover:bg-primary-700 dark:bg-primary-400 dark:text-gray-900 dark:hover:bg-primary-300"
        >
          Previous
        </Link>
      )}
      <span className="text-gray-600 dark:text-gray-400">
        {currentPage} of {totalPages}
      </span>
      {!nextPage && (
        <button className="cursor-auto disabled:opacity-50 px-4 py-2 text-gray-500" disabled={!nextPage}>
          Next
        </button>
      )}
      {nextPage && (
        <Link 
          href={`/blog/page/${currentPage + 1}`} 
          rel="next"
          className="px-4 py-2 bg-primary-800 text-white rounded-md hover:bg-primary-700 dark:bg-primary-400 dark:text-gray-900 dark:hover:bg-primary-300"
        >
          Next
        </Link>
      )}
    </div>
  )
}

export default function ListLayoutGrid({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  
  // Get all unique tags from posts
  const allTags = [...new Set(posts.flatMap(post => post.tags || []))]
    .sort((a, b) => a.localeCompare(b))

  // Get all unique years from posts
  const yearCounts = yearData as Record<string, number>
  const yearKeys = Object.keys(yearCounts).reverse()

  // Filter posts based on tag and year
  const filteredPosts = posts.filter((post) => {
    const matchesTag = selectedTag === '' || post.tags?.includes(selectedTag)
    const matchesYear = selectedYear === '' || new Date(post.date).getFullYear().toString() === selectedYear
    
    return matchesTag && matchesYear
  })

  const displayPosts = initialDisplayPosts.length > 0 && selectedTag === '' && selectedYear === '' 
    ? initialDisplayPosts 
    : filteredPosts

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Explore {posts.length} articles about development, technology, and more
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-4">
        {/* Search Button */}
        <div className="relative">
          <KBarButton className="w-full">
            <div className="flex items-center w-full px-4 py-3 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary-800 dark:focus:ring-primary-400 focus:border-primary-800 dark:focus:border-primary-400">
              <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-gray-500 dark:text-gray-400">Search by title, tag, or content...</span>
            </div>
          </KBarButton>
        </div>

        {/* Tag Pills and Year Filter */}
        <div className="flex flex-wrap items-center">
          <div role="group" aria-labelledby="tag-filter-label" className="flex flex-wrap gap-2">
            <span id="tag-filter-label" className="sr-only">Filter by tags</span>
            <button
              onClick={() => setSelectedTag('')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 ${
                selectedTag === ''
                  ? 'bg-primary-800 text-white dark:bg-primary-400 dark:text-gray-900'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              aria-pressed={selectedTag === ''}
            >
              All Posts
            </button>
            {allTags.slice(0, 15).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 ${
                  selectedTag === tag
                    ? 'bg-primary-800 text-white dark:bg-primary-400 dark:text-gray-900'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                aria-pressed={selectedTag === tag}
              >
                {tag}
              </button>
            ))}
            {allTags.length > 15 && (
              <Link
                href="/tags"
                className="px-3 py-1 text-sm text-gray-500 hover:text-primary-800 dark:text-gray-400 dark:hover:text-primary-400 transition-colors underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 rounded-md"
                aria-label={`View all ${allTags.length} tags`}
              >
                +{allTags.length - 15} more
              </Link>
            )}
          </div>
          
          {/* Year Filter Pills */}
          <div role="group" aria-labelledby="year-filter-label" className="flex flex-wrap gap-2 ml-4">
            <span id="year-filter-label" className="sr-only">Filter by year</span>
            <button
              onClick={() => setSelectedYear('')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 ${
                selectedYear === ''
                  ? 'bg-primary-800 text-white dark:bg-primary-400 dark:text-gray-900'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              aria-pressed={selectedYear === ''}
            >
              All Years
            </button>
            {yearKeys.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(selectedYear === year ? '' : year)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 ${
                  selectedYear === year
                    ? 'bg-primary-800 text-white dark:bg-primary-400 dark:text-gray-900'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                aria-pressed={selectedYear === year}
              >
                {year} ({yearCounts[year]})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {(selectedTag || selectedYear) && (
        <div className="text-center text-gray-600 dark:text-gray-400">
          {displayPosts.length === 0 ? (
            <p>No posts found.</p>
          ) : (
            <p>
              Found {displayPosts.length} post{displayPosts.length !== 1 ? 's' : ''}
              {selectedTag && ` tagged with "${selectedTag}"`}
              {selectedYear && ` from ${selectedYear}`}
            </p>
          )}
        </div>
      )}

      {/* Posts Grid */}
      {displayPosts.length > 0 ? (
        <section role="main" aria-label="Blog posts">
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
                        className="text-sm font-medium text-gray-500 dark:text-gray-400"
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
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                        {summary}
                      </p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2" role="list" aria-label="Post tags">
                        {tags?.slice(0, 3).map((tag) => (
                          <Tag key={tag} text={tag} />
                        ))}
                        {tags && tags.length > 3 && (
                          <span className="text-sm text-gray-500 dark:text-gray-400" aria-label={`${tags.length - 3} more tags`}>
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
      ) : selectedTag === '' && selectedYear === '' ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No posts found.</p>
        </div>
      ) : null}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && !selectedTag && !selectedYear && (
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
      )}
    </div>
  )
}