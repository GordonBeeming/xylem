import Link from '@/components/Link'
import Year from '@/components/Year'
import { slug } from 'github-slugger'
import yearData from 'src/app/year-data.json'
import { genPageMetadata } from 'src/app/seo'

export const metadata = genPageMetadata({ title: 'Years', description: 'Blogs across the years' })

export default async function Page() {
  const yearCounts = yearData as Record<string, number>
  const yearKeys = Object.keys(yearCounts)
  const sortedYears = yearKeys.reverse()
  return (
    <>
      <div className="flex flex-col items-start justify-start divide-y divide-gray-200 md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6 md:divide-y-0 dark:divide-gray-700">
        <div className="space-x-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:border-r-2 md:px-6 md:text-6xl md:leading-14 dark:text-gray-100">
            years
          </h1>
        </div>
        <div className="flex max-w-lg flex-wrap">
          {yearKeys.length === 0 && 'No years found.'}
          {sortedYears.map((t) => {
            return (
              <div key={t} className="mt-2 mr-5 mb-2">
                <Year text={t} />
                <Link
                  href={`/years/${slug(t)}`}
                  className="-ml-2 text-sm font-semibold text-gray-600 uppercase dark:text-gray-300"
                  aria-label={`View posts in year ${t}`}
                >
                  {` (${yearCounts[t]})`}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
