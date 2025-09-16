import ListLayoutGrid from '@/layouts/ListLayoutGrid' // Reverted to ListLayoutGrid as per your original file
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { filterPublishedPosts } from '@/utils/contentUtils'
import { genPageMetadata } from '@/app/seo' // FIXED: Corrected the import path
import { notFound } from 'next/navigation'

const POSTS_PER_PAGE = 10

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }) {
  const resolvedParams = await params
  const page = parseInt(resolvedParams.page)
  const pageTitle = `All Posts - Page ${page}`
  const pageDescription = 'A list of all my technical articles and blog posts.'

  // By NOT passing an `image` prop here, it will automatically use the default
  // socialBanner from your siteMetadata, which points to your default OG card.
  return genPageMetadata({ title: pageTitle, description: pageDescription })
}

export const generateStaticParams = async () => {
  const filteredBlogs = filterPublishedPosts(allBlogs)
  const totalPages = Math.ceil(filteredBlogs.length / POSTS_PER_PAGE)
  const paths = Array.from({ length: totalPages }, (_, i) => ({ page: (i + 1).toString() }))

  return paths
}

export default async function Page({ params }: { params: Promise<{ page: string }> }) {
  const resolvedParams = await params
  const filteredBlogs = filterPublishedPosts(allBlogs)
  const posts = allCoreContent(sortPosts(filteredBlogs))
  const pageNumber = parseInt(resolvedParams.page as string)
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)

  if (pageNumber <= 0 || pageNumber > totalPages || isNaN(pageNumber)) {
    return notFound()
  }

  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = {
    currentPage: pageNumber,
    totalPages: totalPages,
  }

  return (
    <ListLayoutGrid
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title="All Posts"
    />
  )
}