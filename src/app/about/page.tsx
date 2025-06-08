import { Authors, allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'src/app/seo'
import { notFound } from 'next/navigation'

export const metadata = genPageMetadata({ title: 'About' })

export default function Page() {
  const author = allAuthors.find((p) => p.slug === 'default')

  // This check is essential for debugging.
  // It will tell us if `author` is undefined at runtime.
  if (!author) {
    console.error('Could not find author with slug "default" at runtime.')
    return notFound()
  }

  const mainContent = coreContent(author as Authors)

  return (
    <>
      <AuthorLayout content={mainContent}>
        <MDXLayoutRenderer code={author.body.code} />
      </AuthorLayout>
    </>
  )
}