import type { Blog } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'

/**
 * Filters out future-dated posts to prevent them from showing in listings and search.
 * Only shows posts that are published (not draft) and have a date <= current date in the configured timezone.
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
  
  // Get current date in the configured timezone (defaults to Australia/Brisbane)
  const timezone = siteMetadata.timezone || 'Australia/Brisbane'
  
  // Get current date in Brisbane timezone as ISO date string (YYYY-MM-DD)
  const nowInBrisbane = new Date().toLocaleDateString('en-CA', { timeZone: timezone })
  
  return posts.filter(post => {
    // Skip draft posts
    if (post.draft === true) {
      return false
    }
    
    // Get post date as ISO date string (YYYY-MM-DD)
    // Post dates from frontmatter are ISO strings like "2025-10-03T00:00:00.000Z"
    const postDateStr = post.date.substring(0, 10)
    
    // Compare date strings: show post if post date <= current date in Brisbane
    // String comparison works because ISO date format (YYYY-MM-DD) sorts correctly
    if (postDateStr > nowInBrisbane) {
      return false
    }
    
    return true
  })
}