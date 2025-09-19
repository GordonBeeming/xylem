import type { Blog } from 'contentlayer/generated'

/**
 * Filters out future-dated posts to prevent them from showing in listings and search.
 * Only shows posts that are published (not draft) and have a date <= current date.
 * 
 * @param posts - Array of blog posts to filter
 * @param options - Configuration options for filtering
 * @param options.includeAllInDev - If true, includes all posts (including drafts and future-dated) in development mode
 * @returns Filtered array containing only published posts from current date or earlier
 */
export function filterPublishedPosts(posts: Blog[], options: { includeAllInDev?: boolean } = {}): Blog[] {
  const { includeAllInDev = false } = options
  const isProduction = process.env.NODE_ENV === 'production'
  
  // In development mode with includeAllInDev flag, return all posts for preview
  if (!isProduction && includeAllInDev) {
    return posts
  }
  
  const now = new Date()
  now.setHours(23, 59, 59, 999) // Set to end of current day to include posts from today
  
  return posts.filter(post => {
    // Skip draft posts
    if (post.draft === true) {
      return false
    }
    
    // Skip future-dated posts
    const postDate = new Date(post.date)
    if (postDate > now) {
      return false
    }
    
    return true
  })
}