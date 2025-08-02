'use client'

import { useEffect } from 'react'
import Image from '@/components/Image'
import Link from '@/components/Link'

interface Book {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

interface BookModalProps {
  book: Book | null
  isOpen: boolean
  onClose: () => void
}

export default function BookModal({ book, isOpen, onClose }: BookModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen || !book) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close modal"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="grid gap-8 p-8 md:grid-cols-2">
          {/* Book Cover */}
          <div className="flex justify-center">
            {book.imgSrc && (
              <div className="aspect-[3/4] w-full max-w-xs overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
                <Image
                  src={book.imgSrc}
                  alt={book.title}
                  width={300}
                  height={400}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {book.title}
              </h2>
              
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 pt-4">
              {book.href && (
                <Link
                  href={book.href}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-800 px-6 py-3 text-white hover:bg-primary-700 dark:bg-primary-400 dark:text-gray-900 dark:hover:bg-primary-300 transition-colors"
                >
                  View Book
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              )}
              
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}