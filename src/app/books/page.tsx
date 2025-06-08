import booksData from '@/data/booksData'
import BookCard from '@/components/BookCard'
import { genPageMetadata } from 'src/app/seo'

export const metadata = genPageMetadata({ title: 'Books' })

export default function Books() {
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            Books
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Books I've authored, co-authored, showcasing my expertise and passion for writing 💪... sort of 😅😂
          </p>
        </div>
        <div className="container py-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {booksData.map((d) => (
              <BookCard
                key={d.title}
                title={d.title}
                description={d.description}
                imgSrc={d.imgSrc}
                href={d.href}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
