'use client'

import { useState } from 'react'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import booksData from '@/data/booksData'
import { formatDate } from 'pliny/utils/formatDate'
import Image from '@/components/Image'
import BookModal from '@/components/BookModal'

const MAX_DISPLAY = 4

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
      <section className="-mx-6 mb-16 bg-primary-800 px-6 py-20 text-white md:-mx-8 md:px-8">
        <div className="mx-auto max-w-3xl xl:max-w-5xl">
          <div className="mx-auto max-w-4xl text-center">
          {/* Profile Picture */}
          <div className="mb-6">
            <Image
              src="/static/images/avatar.jpg"
              alt="Gordon Beeming"
              width={150}
              height={150}
              className="mx-auto rounded-full shadow-lg"
            />
          </div>
          
          {/* Name and Tagline */}
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Gordon Beeming</h1>
          <p className="text-xl text-primary-100 md:text-2xl">
            Father • Husband • Triathlete • SSW Solution Architect
          </p>
        </div>
        </div>
      </section>

      {/* Content Hub */}
      <div className="space-y-16">
        {/* Latest Blog Posts Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Latest Blog Posts
            </h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Recent insights and technical deep-dives
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {posts.slice(0, MAX_DISPLAY).map((post) => {
              const { slug, date, title, summary, tags } = post
              return (
                <article key={slug} className="group">
                  <div className="h-full rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800">
                    <div className="space-y-4">
                      {/* Date */}
                      <time
                        dateTime={date}
                        className="text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        {formatDate(date, siteMetadata.locale)}
                      </time>
                      
                      {/* Title */}
                      <h3 className="text-xl font-bold leading-tight">
                        <Link
                          href={`/blog/${slug}`}
                          className="text-gray-900 group-hover:text-primary-800 dark:text-gray-100 dark:group-hover:text-primary-400"
                        >
                          {title}
                        </Link>
                      </h3>
                      
                      {/* Summary */}
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                        {summary}
                      </p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {tags.slice(0, 3).map((tag) => (
                          <Tag key={tag} text={tag} />
                        ))}
                        {tags.length > 3 && (
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
          
          {posts.length > MAX_DISPLAY && (
            <div className="mt-8 text-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-800 px-6 py-3 text-white hover:bg-primary-700 dark:bg-primary-400 dark:text-gray-900 dark:hover:bg-primary-300"
              >
                View All Posts
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </section>

        {/* My Books Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              My Books
            </h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Technical books and publications I've authored
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {booksData.map((book) => (
              <article key={book.title} className="group">
                <button
                  onClick={() => openBookModal(book)}
                  className="h-full w-full rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 text-left"
                >
                  <div className="space-y-4">
                    {/* Book Cover */}
                    {book.imgSrc && (
                      <div className="aspect-[3/4] overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
                        <Image
                          src={book.imgSrc}
                          alt={book.title}
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
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">
                      {book.description}
                    </p>
                    
                    {/* Click to learn more */}
                    <div className="inline-flex items-center gap-1 text-sm font-medium text-primary-800 group-hover:text-primary-400 dark:text-primary-400 dark:group-hover:text-primary-300">
                      Click to learn more
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
