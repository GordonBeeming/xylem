import { Authors, allAuthors } from 'contentlayer/generated'
import { MDXRemote } from 'next-mdx-remote/rsc'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'src/app/seo'
import { notFound } from 'next/navigation' // <-- Import notFound

export const metadata = genPageMetadata({ title: 'About' })

export default function Page() {
  const author = allAuthors.find((p) => p.slug === 'gordon-beeming')

  if (!author) {
    console.error('RUNTIME ERROR: Could not find author with slug "gordon-beeming".')
    return notFound()
  }

  const mainContent = coreContent(author as Authors)

  return (
    <>
      <AuthorLayout content={mainContent}>
        <MDXRemote source={author.body.raw} />
      </AuthorLayout>
    </>
  )
}
