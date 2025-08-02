import { slug } from 'github-slugger'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import siteMetadata from '@/data/siteMetadata'
import ListLayoutGrid from '@/layouts/ListLayoutGrid'
import { allBlogs } from 'contentlayer/generated'
import yearData from 'src/app/year-data.json'
import { genPageMetadata } from 'src/app/seo'
import { Metadata } from 'next'

const POSTS_PER_PAGE = 10

export async function generateMetadata(props: {
  params: Promise<{ year: string }>
}): Promise<Metadata> {
  const params = await props.params
  const year = decodeURI(params.year)
  return genPageMetadata({
    title: year,
    description: `${siteMetadata.title} ${year} year content`,
    alternates: {
      canonical: './',
      types: {
        'application/rss+xml': `${siteMetadata.siteUrl}/years/${year}/feed.xml`,
      },
    },
  })
}

export const generateStaticParams = async () => {
  const yearCounts = yearData as Record<string, number>
  const yearKeys = Object.keys(yearCounts)
  return yearKeys.map((year) => ({
    year: encodeURI(year),
  }))
}

export default async function yearPage(props: { params: Promise<{ year: string }> }) {
  const params = await props.params
  const year = parseInt(params.year)
  const title = `Posts from ${year}`
  const filteredPosts = allCoreContent(
    sortPosts(allBlogs.filter((post) => {
      let date = new Date(post.date)
      return date.getFullYear() === year
    }))
  )
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const initialDisplayPosts = filteredPosts.slice(0, POSTS_PER_PAGE)
  const pagination = {
    currentPage: 1,
    totalPages: totalPages,
  }

  return (
    <ListLayoutGrid
      posts={filteredPosts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title={title}
    />
  )
}
