import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Authors } from 'contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import Image from '@/components/Image'
import Tag from '@/components/Tag'
import CodeBlockEnhancer from '@/components/CodeBlockEnhancer'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'

const editUrl = (path) => `${siteMetadata.siteRepo}/blob/main/data/${path}`
const discussUrl = (path) =>
  `https://mobile.twitter.com/search?q=${encodeURIComponent(`${siteMetadata.siteUrl}/${path}`)}`

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

interface LayoutProps {
  content: CoreContent<Blog>
  authorDetails: CoreContent<Authors>[]
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
  children: ReactNode
}

export default function PostLayout({ content, authorDetails, next, prev, children }: LayoutProps) {
  const { filePath, path, slug, date, title, tags } = content
  const basePath = path.split('/')[0]

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article role="article" aria-labelledby="post-title">
        <div className="mx-auto max-w-3xl">
          <header className="pt-6 pb-8">
            <div className="space-y-4 text-center">
              <div>
                <PageTitle id="post-title">{title}</PageTitle>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <dl className="flex items-center gap-3">
                  <dt className="sr-only">Authors</dt>
                  <dd>
                    <ul className="flex items-center gap-3">
                      {authorDetails.map((author) => (
                        <li key={`${author.name}`} className="flex items-center gap-2">
                          {author.avatar && (
                            <Image
                              src={author.avatar}
                              width={32}
                              height={32}
                              alt="avatar"
                              className="h-8 w-8 rounded-full"
                            />
                          )}
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {author.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </dl>
                <span aria-hidden="true">•</span>
                <dl>
                  <dt className="sr-only">Published on</dt>
                  <dd>
                    <time dateTime={date}>
                      {new Date(date).toLocaleDateString(siteMetadata.locale, postDateTemplate)}
                    </time>
                  </dd>
                </dl>
              </div>
              {tags && (
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {tags.map((tag) => (
                    <Tag key={tag} text={tag} />
                  ))}
                </div>
              )}
            </div>
          </header>
          <div className="prose dark:prose-invert max-w-none pb-8">
            {children}
            <CodeBlockEnhancer />
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 pb-6 text-sm text-gray-700 dark:text-gray-300">
            <Link href={discussUrl(path)} rel="nofollow">
              Discuss on Twitter
            </Link>
            {` • `}
            <Link href={editUrl(filePath)}>View on GitHub</Link>
          </div>
          {(next || prev) && (
            <nav aria-labelledby="post-navigation-heading" className="pt-8 pb-8">
              <h2 id="post-navigation-heading" className="sr-only">Post Navigation</h2>
              <div className="grid gap-8 md:grid-cols-2">
                {prev && prev.path && (
                  <div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow h-full">
                      <div className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400 mb-3 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous Article
                      </div>
                      <Link
                        href={`/${prev.path}`}
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold text-lg line-clamp-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 rounded-md"
                        aria-label={`Previous article: ${prev.title}`}
                      >
                        {prev.title}
                      </Link>
                    </div>
                  </div>
                )}
                {next && next.path && (
                  <div className={!prev ? "md:col-start-2" : ""}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow h-full">
                      <div className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400 mb-3 flex items-center gap-1 md:justify-end">
                        Next Article
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <Link
                        href={`/${next.path}`}
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold text-lg line-clamp-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 rounded-md md:text-right block"
                        aria-label={`Next article: ${next.title}`}
                      >
                        {next.title}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          )}
          {siteMetadata.comments && (
            <div
              className="border-t border-gray-200 dark:border-gray-700 pt-6 pb-6 text-center text-gray-700 dark:text-gray-300"
              id="comment"
            >
              <Comments slug={slug} />
            </div>
          )}
          <footer className="pt-8 pb-8 border-t border-gray-200 dark:border-gray-700 mt-8">
            <Link
              href={`/${basePath}`}
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              aria-label="Back to the blog"
            >
              &larr; Back to the blog
            </Link>
          </footer>
        </div>
      </article>
    </SectionContainer>
  )
}
