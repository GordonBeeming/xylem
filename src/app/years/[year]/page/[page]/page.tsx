import { slug } from 'github-slugger'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { allBlogs } from 'contentlayer/generated'
import yearData from 'src/app/year-data.json'
import { notFound } from 'next/navigation'

const POSTS_PER_PAGE = 5

export const generateStaticParams = async () => {
  const yearCounts = yearData as Record<string, number>
  return Object.keys(yearCounts).flatMap((year) => {
    const postCount = yearCounts[year]
    const totalPages = Math.max(1, Math.ceil(postCount / POSTS_PER_PAGE))
    return Array.from({ length: totalPages }, (_, i) => ({
      year: year,
      page: (i + 1).toString(),
    }))
  })
}

export default async function YearPage(props: { params: Promise<{ year: string; page: string }> }) {
  const resolvedParams = await props.params
  const year = parseInt(resolvedParams.year)
  const title = resolvedParams.year.toString()
  const pageNumber = parseInt(resolvedParams.page)
  const filteredPosts = allCoreContent(
    sortPosts(allBlogs.filter((post) => {
      let date = new Date(post.date)
      return date.getFullYear() === year
    })
    ))
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)

  // Return 404 for invalid page numbers or empty pages
  if (pageNumber <= 0 || pageNumber > totalPages || isNaN(pageNumber)) {
    return notFound()
  }
  const initialDisplayPosts = filteredPosts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = {
    currentPage: pageNumber,
    totalPages: totalPages,
  }

  return (
    <ListLayout
      posts={filteredPosts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title={title}
    />
  )
}
