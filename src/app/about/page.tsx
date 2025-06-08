import { Authors, allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components' // Or MDXRemote if you swapped it
// import AuthorLayout from '@/layouts/AuthorLayout' // <-- Comment out the layout
import { coreContent } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'src/app/seo'
import { notFound } from 'next/navigation'

export const metadata = genPageMetadata({ title: 'About' })

export default function Page() {
  const author = allAuthors.find((p) => p.slug === 'default')

  if (!author) {
    console.error('RUNTIME ERROR: Could not find author with slug "default".')
    return notFound()
  }

  const mainContent = coreContent(author as Authors)

  // --- TEMPORARY DEBUGGING RENDER ---
  // We are bypassing the AuthorLayout to see if it's the source of the error.
  return (
    <div style={{ maxWidth: '768px', margin: '0 auto', padding: '2rem' }}>
      <h1>Testing Render for: {mainContent.name}</h1>
      <p>Occupation: {mainContent.occupation}</p>
      <hr />
      <article>
        <MDXLayoutRenderer code={author.body.code} />
      </article>
    </div>
  )
}