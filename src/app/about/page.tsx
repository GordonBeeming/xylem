import { Authors, allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'src/app/seo'
import { notFound } from 'next/navigation' // <-- 1. Import `notFound`

export const metadata = genPageMetadata({ title: 'About' })

export default function Page() {
  const author = allAuthors.find((p) => p.slug === 'default')

  // --- 2. ADD THIS CRITICAL CHECK ---
  // If the author isn't found for any reason, stop here and
  // render the standard 404 page instead of crashing.
  if (!author) {
    return notFound()
  }
  // ------------------------------------

  const mainContent = coreContent(author as Authors)

  return (
    <>
      <AuthorLayout content={mainContent}>
        <MDXLayoutRenderer code={author.body.code} />
      </AuthorLayout>
    </>
  )
}