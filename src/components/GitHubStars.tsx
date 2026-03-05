'use client'

import { useState, useEffect } from 'react'

const CACHE_TTL = 60 * 60 * 1000 // 1 hour

function getCacheKey(repo: string) {
  return `gh_stars_${repo}`
}

export default function GitHubStars({ repo }: { repo: string }) {
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    const cacheKey = getCacheKey(repo)
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      const { count, ts } = JSON.parse(cached)
      if (Date.now() - ts < CACHE_TTL) {
        setStars(count)
        return
      }
    }

    fetch(`https://api.github.com/repos/${repo}`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.stargazers_count === 'number') {
          setStars(data.stargazers_count)
          localStorage.setItem(cacheKey, JSON.stringify({ count: data.stargazers_count, ts: Date.now() }))
        }
      })
      .catch(() => {})
  }, [repo])

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      aria-label={`${stars ?? 0} stars on GitHub`}
    >
      {/* GitHub logo (Lucide) */}
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
      {/* Star icon (Lucide) */}
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      {stars !== null ? (
        <span>{stars}</span>
      ) : (
        <span className="inline-block h-4 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      )}
    </span>
  )
}
