'use client'

import { useState } from 'react'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import yearData from 'src/app/year-data.json'

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
  const [searchValue, setSearchValue] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  
  // Get all unique tags from posts
  const allTags = [...new Set(posts.flatMap(post => post.tags || []))]
    .sort((a, b) => a.localeCompare(b))

  // Get all unique years from posts
  const yearCounts = yearData as Record<string, number>
  const yearKeys = Object.keys(yearCounts).reverse()

  // Filter posts based on search, tag, and year
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = searchValue === '' || 
      post.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      post.summary?.toLowerCase().includes(searchValue.toLowerCase())
    
    const matchesTag = selectedTag === '' || post.tags?.includes(selectedTag)
    
    const matchesYear = selectedYear === '' || new Date(post.date).getFullYear().toString() === selectedYear
    
    return matchesSearch && matchesTag && matchesYear
  })

  const displayPosts = initialDisplayPosts.length > 0 && searchValue === '' && selectedTag === '' && selectedYear === '' 
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
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            aria-label="Search articles"
            type="text"
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search articles..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-800 focus:border-primary-800 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-400 dark:focus:border-primary-400"
          />
        </div>

        {/* Tag Pills and Year Filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setSelectedTag('')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedTag === ''
                ? 'bg-primary-800 text-white dark:bg-primary-400 dark:text-gray-900'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All Posts
          </button>
          {allTags.slice(0, 15).map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedTag === tag
                  ? 'bg-primary-800 text-white dark:bg-primary-400 dark:text-gray-900'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {tag}
            </button>
          ))}
          {allTags.length > 15 && (
            <span className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">
              +{allTags.length - 15} more
            </span>
          )}
          
          {/* Year Filter Dropdown */}
          <div className="relative ml-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-gray-200 text-gray-700 px-4 py-2 pr-8 rounded-lg text-sm font-medium transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-800 dark:focus:ring-primary-400"
            >
              <option value="">All Years</option>
              {yearKeys.map((year) => (
                <option key={year} value={year}>
                  {year} ({yearCounts[year]})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {(searchValue || selectedTag || selectedYear) && (
        <div className="text-center text-gray-600 dark:text-gray-400">
          {displayPosts.length === 0 ? (
            <p>No posts found.</p>
          ) : (
            <p>
              Found {displayPosts.length} post{displayPosts.length !== 1 ? 's' : ''}
              {selectedTag && ` tagged with "${selectedTag}"`}
              {selectedYear && ` from ${selectedYear}`}
              {searchValue && ` matching "${searchValue}"`}
            </p>
          )}
        </div>
      )}

      {/* Posts Grid */}
      {displayPosts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2">
          {displayPosts.map((post) => {
            const { path, date, title, summary, tags } = post
            return (
              <article key={path} className="group">
                <div className="h-full rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 dark:bg-gray-800">
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
                        className="text-gray-900 group-hover:text-primary-800 dark:text-gray-100 dark:group-hover:text-primary-400 transition-colors"
                      >
                        {title}
                      </Link>
                    </h2>
                    
                    {/* Summary */}
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                      {summary}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {tags?.slice(0, 3).map((tag) => (
                        <Tag key={tag} text={tag} />
                      ))}
                      {tags && tags.length > 3 && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
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
      ) : searchValue === '' && selectedTag === '' && selectedYear === '' ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No posts found.</p>
        </div>
      ) : null}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && !searchValue && !selectedTag && !selectedYear && (
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
      )}
    </div>
  )
}