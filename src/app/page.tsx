import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { filterPublishedPosts } from '@/utils/contentUtils'
import Main from './Main'

// Force dynamic rendering to ensure date filtering happens at request time
export const dynamic = 'force-dynamic'

export default async function Page() {
  const filteredBlogs = filterPublishedPosts(allBlogs)
  const sortedPosts = sortPosts(filteredBlogs)
  const posts = allCoreContent(sortedPosts)
  return <Main posts={posts} />
}
