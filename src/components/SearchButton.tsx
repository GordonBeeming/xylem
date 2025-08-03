"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from './Link'

const SearchButton = () => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/blog?focus-search=true&q=${encodeURIComponent(query.trim())}`)
      setOpen(false)
      setQuery('')
    }
  }

  return (
    <div className="relative inline-block">
      <button
        aria-label="Search"
        onClick={() => setOpen((v) => !v)}
        className="focus:outline-none"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="hover:text-primary-500 dark:hover:text-primary-400 h-6 w-6 text-gray-900 dark:text-gray-100"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </button>
      {open && (
        <form
          onSubmit={handleSubmit}
          className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 p-2 flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false)
            }}
          />
          <button
            type="submit"
            className="px-3 py-2 rounded bg-primary-800 text-white dark:bg-primary-400 dark:text-gray-900 hover:bg-primary-700 dark:hover:bg-primary-300 focus:outline-none"
          >
            Search
          </button>
        </form>
      )}
    </div>
  )
}

export default SearchButton
