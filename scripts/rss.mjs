import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { slug } from 'github-slugger'
import { escape } from 'pliny/utils/htmlEscaper.js'
import siteMetadata from '../data/siteMetadata.js'
import tagData from '../src/app/tag-data.json' with { type: 'json' }
import yearData from '../src/app/year-data.json' with { type: 'json' }
import { allBlogs } from '../.contentlayer/generated/index.mjs'
import { sortPosts } from 'pliny/utils/contentlayer.js'

/**
 * Filters out future-dated posts to prevent them from showing in listings and RSS feeds.
 * Only shows posts that are published (not draft) and have a date <= current date in the configured timezone.
 * 
 * Note: This function duplicates the logic in src/utils/contentUtils.ts but is needed
 * for the post-build RSS generation script. Keep in sync with the TypeScript version.
 * 
 * @param posts - Array of blog posts to filter
 * @returns Filtered array containing only published posts from current date or earlier
 */
function filterPublishedPosts(posts) {
  // Get current date in the configured timezone (defaults to Australia/Brisbane)
  const timezone = siteMetadata.timezone || 'Australia/Brisbane'
  
  // Get current date in configured timezone as ISO date string (YYYY-MM-DD)
  const nowInTimezone = new Date().toLocaleDateString('en-CA', { timeZone: timezone })
  
  return posts.filter(post => {
    // Skip draft posts
    if (post.draft === true) {
      return false
    }
    
    // Get post date as ISO date string (YYYY-MM-DD)
    // Post dates from frontmatter are ISO strings like "2025-10-03T00:00:00.000Z"
    const postDateStr = post.date.substring(0, 10)
    
    // Compare date strings: show post if post date <= current date in timezone
    // String comparison works because ISO date format (YYYY-MM-DD) sorts correctly
    if (postDateStr > nowInTimezone) {
      return false
    }
    
    return true
  })
}

const outputFolder = process.env.EXPORT ? 'out' : 'public'

const generateRssItem = (config, post) => `
  <item>
    <guid>${config.siteUrl}/blog/${post.slug}</guid>
    <title>${escape(post.title)}</title>
    <link>${config.siteUrl}/blog/${post.slug}</link>
    ${post.summary && `<description>${escape(post.summary)}</description>`}
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <author>${config.email} (${config.author})</author>
    ${post.tags && post.tags.map((t) => `<category>${t}</category>`).join('')}
  </item>
`

const generateRss = (config, posts, page = 'feed.xml') => {
  const lastBuildDate = posts.length > 0 
    ? new Date(posts[0].date).toUTCString()
    : new Date().toUTCString()
    
  return `
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${escape(config.title)}</title>
      <link>${config.siteUrl}/blog</link>
      <description>${escape(config.description)}</description>
      <language>${config.language}</language>
      <managingEditor>${config.email} (${config.author})</managingEditor>
      <webMaster>${config.email} (${config.author})</webMaster>
      <lastBuildDate>${lastBuildDate}</lastBuildDate>
      <atom:link href="${config.siteUrl}/${page}" rel="self" type="application/rss+xml"/>
      ${posts.map((post) => generateRssItem(config, post)).join('')}
    </channel>
  </rss>
`
}

async function generateRSS(config, allBlogs, page = 'feed.xml') {
  const publishPosts = filterPublishedPosts(allBlogs)
  // RSS for blog post
  if (publishPosts.length > 0) {
    const rss = generateRss(config, sortPosts(publishPosts))
    writeFileSync(`./${outputFolder}/${page}`, rss)
  }

  if (publishPosts.length > 0) {
    for (const tag of Object.keys(tagData)) {
      const filteredPosts = publishPosts.filter((post) => post.tags.map((t) => slug(t).replace(/--+/g, '-')).includes(tag))
      if (filteredPosts.length > 0) {
        const rss = generateRss(config, filteredPosts, `tags/${tag}/${page}`)
        const rssPath = path.join(outputFolder, 'tags', tag)
        mkdirSync(rssPath, { recursive: true })
        writeFileSync(path.join(rssPath, page), rss)
      }
    }
  }

  if (publishPosts.length > 0) {
    for (const year of Object.keys(yearData)) {
      const filteredPosts = publishPosts.filter((post) => {
        const date = new Date(post.date)
        return date.getFullYear() === parseInt(year)
      })
      if (filteredPosts.length > 0) {
        const rss = generateRss(config, filteredPosts, `years/${year}/${page}`)
        const rssPath = path.join(outputFolder, 'years', year)
        mkdirSync(rssPath, { recursive: true })
        writeFileSync(path.join(rssPath, page), rss)
      }
    }
  }
}

const rss = () => {
  generateRSS(siteMetadata, allBlogs)
  console.log('RSS feed generated...')
}
export default rss
