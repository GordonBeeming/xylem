'use client'

import { useState } from 'react'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import booksData from '@/data/booksData'
import { formatDate } from 'pliny/utils/formatDate'
import Image from '@/components/Image'
import Avatar from '@/components/Avatar'
import BookModal from '@/components/BookModal'

const MAX_DISPLAY = 10

export default function Home({ posts }) {
  const [selectedBook, setSelectedBook] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openBookModal = (book) => {
    setSelectedBook(book)
    setIsModalOpen(true)
  }

  const closeBookModal = () => {
    setIsModalOpen(false)
    setSelectedBook(null)
  }
  return (
    <>
      {/* Hero Section */}
      <section className="mb-8 bg-primary-800 px-6 py-20 text-gray-100 md:px-8" aria-labelledby="hero-heading">
        <div className="mx-auto max-w-4xl text-center">
          {/* Profile Picture */}
          <div className="mb-6">
            <Avatar
              videoSrc="/static/videos/avatar.mp4"
              fallbackAnimatedWebP="/static/videos/avatar.webp"
              poster="/static/images/avatar.jpg"
              alt="Gordon Beeming - Profile video avatar"
              size={150}
            />
          </div>

          {/* Name and Tagline */}
          <h1 id="hero-heading" className="mb-4 text-4xl font-bold md:text-5xl">Gordon Beeming</h1>
          <p className="text-xl text-gray-100 md:text-2xl">
            Father • Husband • Triathlete • SSW Solution Architect
          </p>
        </div>
      </section>

      {/* Content Hub */}
      <div className="space-y-16">
        {/* Why Xylem Quote */}
        <section aria-labelledby="why-xylem-heading" className="mb-0">
          <h2 id="why-xylem-heading" className="sr-only">Why Xylem</h2>
          <div className="prose dark:prose-invert max-w-none">
            <blockquote>
              <p title='Xylem: In plants, xylem is the vascular tissue that transports water and nutrients from roots to the rest of the plant. This is a great metaphor for a blog that disseminates foundational knowledge and supports growth.'>
                Xylem: Transporting foundational knowledge from root concepts to growing ideas
              </p>
            </blockquote>
          </div>
        </section>

        {/* Latest Blog Posts Section */}
        <section aria-labelledby="blog-posts-heading">
          <div className="mb-8">
            <h2 id="blog-posts-heading" className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Latest Blog Posts
            </h2>
            <p className="mt-2 text-lg text-gray-700 dark:text-gray-300">
              Recent insights and technical deep-dives
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {posts.slice(0, MAX_DISPLAY).map((post) => {
              const { slug, date, title, summary, tags } = post
              return (
                <article key={slug} className="group">
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
                      <h3 className="text-xl font-bold leading-tight">
                        <Link
                          href={`/blog/${slug}`}
                          className="text-gray-900 group-hover:text-primary-800 dark:text-gray-100 dark:group-hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 rounded-md"
                          aria-describedby={`post-summary-${slug}`}
                        >
                          {title}
                        </Link>
                      </h3>

                      {/* Summary */}
                      <Link
                        href={`/blog/${slug}`}
                        className="block focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 rounded-md"
                        aria-label={`Read full post: ${title}`}
                      >
                        <p id={`post-summary-${slug}`} className="text-gray-700 dark:text-gray-300 line-clamp-3 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                          {summary}
                        </p>
                      </Link>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {tags.slice(0, 3).map((tag) => (
                          <Tag key={tag} text={tag} />
                        ))}
                        {tags.length > 3 && (
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

          {posts.length > MAX_DISPLAY && (
            <div className="mt-8 text-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-800 px-6 py-3 text-white hover:bg-primary-700 dark:bg-primary-400 dark:text-gray-900 dark:hover:bg-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900"
                aria-label="View all blog posts"
              >
                View All Posts
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </section>

        {/* My Books Section */}
        <section aria-labelledby="books-heading">
          <div className="mb-8">
            <h2 id="books-heading" className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              My Books
            </h2>
            <p className="mt-2 text-lg text-gray-700 dark:text-gray-300">
              Technical books and publications I've authored
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {booksData.map((book) => (
              <article key={book.title} className="group">
                <button
                  onClick={() => openBookModal(book)}
                  className="h-full w-full rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900"
                  aria-label={`Learn more about ${book.title}`}
                  aria-describedby={`book-description-${book.title.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  <div className="space-y-4">
                    {/* Book Cover */}
                    {book.imgSrc && (
                      <div className="aspect-[3/4] overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
                        <Image
                          src={book.imgSrc}
                          alt={`Cover of ${book.title}`}
                          width={200}
                          height={267}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-lg font-bold leading-tight text-gray-900 group-hover:text-primary-800 dark:text-gray-100 dark:group-hover:text-primary-400">
                      {book.title}
                    </h3>

                    {/* Description Preview */}
                    <p id={`book-description-${book.title.replace(/\s+/g, '-').toLowerCase()}`} className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">
                      {book.description}
                    </p>

                    {/* Click to learn more */}
                    <div className="inline-flex items-center gap-1 text-sm font-medium text-primary-800 group-hover:text-primary-400 dark:text-primary-400 dark:group-hover:text-primary-300">
                      Click to learn more
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* Book Modal */}
      <BookModal
        book={selectedBook}
        isOpen={isModalOpen}
        onClose={closeBookModal}
      />
    </>
  )
}
