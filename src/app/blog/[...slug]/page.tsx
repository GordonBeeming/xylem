import 'src/css/prism.css'
import 'katex/dist/katex.css'

import { components } from '@/components/MDXComponents'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { sortPosts, coreContent, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs, allAuthors } from 'contentlayer/generated'
import type { Authors, Blog } from 'contentlayer/generated'
import PostSimple from '@/layouts/PostSimple'
import PostLayout from '@/layouts/PostLayout'
import PostBanner from '@/layouts/PostBanner'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { notFound } from 'next/navigation'
import { genPageMetadata } from '@/app/seo'
import { filterPublishedPosts } from '@/utils/contentUtils'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'

// Icon for heading anchor links
const icon = fromHtmlIsomorphic(
  `
  <span class="content-header-link">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 linkicon">
  <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
  <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
  </svg>
  </span>
`,
  { fragment: true }
)

const defaultLayout = 'PostLayout'
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
  const resolvedParams = await params
  const slug = decodeURI(resolvedParams.slug.join('/'))
  const post = allBlogs.find((p) => p.slug === slug)
  const authorList = post?.authors || ['authors/gordon-beeming']
  const authorDetails = authorList.map((author) => {
    const authorResults = allAuthors.find((p) => p.slug === author)
    return coreContent(authorResults as Authors)
  })

  if (!post) {
    return
  }

  const publishedAt = new Date(post.date).toISOString()
  const modifiedAt = new Date(post.lastmod || post.date).toISOString()
  const authors = authorDetails.map((author) => author.name)

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(post.date))

  const searchParams = new URLSearchParams()
  searchParams.set('title', post.title)
  searchParams.set('publishDate', formattedDate)
  if (post.tags) {
    searchParams.set('tags', post.tags.join(','))
  }
  const dynamicOgImageUrl = `${siteMetadata.siteUrl}/api/og?${searchParams.toString()}`

  const imageList = [dynamicOgImageUrl]
  if (post.images) {
    post.images.forEach((img) => {
      imageList.push(img)
    })
  }

  const ogImages = imageList.map((img) => {
    return {
      url: img.includes('http') ? img : siteMetadata.siteUrl + img,
    }
  })

  const postUrl = `${siteMetadata.siteUrl}/${post.path}`
  const canonicalUrl = post.canonicalUrl || postUrl

  return genPageMetadata({
    title: post.title,
    description: post.summary,
    image: ogImages[0].url,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      authors: authors.length > 0 ? authors : [siteMetadata.author],
      url: postUrl,
      images: ogImages,
    },
    twitter: {
      images: ogImages.map((image) => image.url),
    },
  })
}

export const generateStaticParams = async () => {
  // Include ALL posts (including drafts) so they're accessible by direct URL
  return allBlogs.map((p) => ({ slug: p.slug.split('/').map((name) => decodeURI(name)) }))
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params
  const slug = decodeURI(resolvedParams.slug.join('/'))
  
  // Find the requested post (including drafts)
  const post = allBlogs.find((p) => p.slug === slug) as Blog
  if (!post) {
    return notFound()
  }
  
  // Filter out drafts and future-dated posts for navigation consistency
  const filteredBlogs = filterPublishedPosts(allBlogs)
  const sortedCoreContents = allCoreContent(sortPosts(filteredBlogs))
  const postIndex = sortedCoreContents.findIndex((p) => p.slug === slug)
  
  // Only provide prev/next navigation if this is a published post
  const prev = postIndex !== -1 ? sortedCoreContents[postIndex + 1] : undefined
  const next = postIndex !== -1 ? sortedCoreContents[postIndex - 1] : undefined
  const authorList = post?.authors || ['authors/gordon-beeming']
  const authorDetails = authorList.map((author) => {
    const authorResults = allAuthors.find((p) => p.slug === author)
    return coreContent(authorResults as Authors)
  })
  const mainContent = coreContent(post)
  const jsonLd = post.structuredData
  jsonLd['author'] = authorDetails.map((author) => {
    return {
      '@type': 'Person',
      name: author.name,
    }
  })

  const Layout = layouts[post.layout || defaultLayout]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Layout content={mainContent} authorDetails={authorDetails} next={next} prev={prev}>
        <MDXRemote 
          source={post.body.raw} 
          components={components}
          options={{
            mdxOptions: {
              rehypePlugins: [
                rehypeSlug,
                [
                  rehypeAutolinkHeadings,
                  {
                    behavior: 'prepend',
                    headingProperties: {
                      className: ['content-header'],
                    },
                    content: icon,
                  },
                ],
              ],
            },
          }}
        />
      </Layout>
    </>
  )
}