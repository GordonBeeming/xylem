import Link from '@/components/Link'
import Tag from '@/components/Tag'
import { slug } from 'github-slugger'
import tagData from 'src/app/tag-data.json'
import { genPageMetadata } from 'src/app/seo'

export const metadata = genPageMetadata({ title: 'Tags', description: 'Things I blog about' })

export default async function Page() {
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])
  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
            Tags
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Explore topics and technologies covered across all {tagKeys.length} tags
          </p>
        </div>

        {/* Tags Grid */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {tagKeys.length === 0 && (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
              No tags found.
            </div>
          )}
          {sortedTags.map((t) => {
            return (
              <Link
                key={t}
                href={`/tags/${slug(t).replace(/--+/g, '-')}`}
                className="group block"
                aria-label={`View ${tagCounts[t]} posts tagged ${t}`}
              >
                <div className="flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate pr-2">
                    {t}
                  </span>
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-800 bg-primary-100 dark:text-primary-200 dark:bg-primary-800 rounded-full flex-shrink-0">
                    {tagCounts[t]}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
