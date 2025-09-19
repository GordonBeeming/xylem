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
 * Only shows posts that are published (not draft) and have a date <= current date.
 * 
 * Note: This function duplicates the logic in src/utils/contentUtils.ts but is needed
 * for the post-build RSS generation script. Keep in sync with the TypeScript version.
 * 
 * @param posts - Array of blog posts to filter
 * @returns Filtered array containing only published posts from current date or earlier
 */
function filterPublishedPosts(posts) {
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

const generateRss = (config, posts, page = 'feed.xml') => `
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${escape(config.title)}</title>
      <link>${config.siteUrl}/blog</link>
      <description>${escape(config.description)}</description>
      <language>${config.language}</language>
      <managingEditor>${config.email} (${config.author})</managingEditor>
      <webMaster>${config.email} (${config.author})</webMaster>
      <lastBuildDate>${new Date(posts[0].date).toUTCString()}</lastBuildDate>
      <atom:link href="${config.siteUrl}/${page}" rel="self" type="application/rss+xml"/>
      ${posts.map((post) => generateRssItem(config, post)).join('')}
    </channel>
  </rss>
`

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
      const rss = generateRss(config, filteredPosts, `tags/${tag}/${page}`)
      const rssPath = path.join(outputFolder, 'tags', tag)
      mkdirSync(rssPath, { recursive: true })
      writeFileSync(path.join(rssPath, page), rss)
    }
  }

  if (publishPosts.length > 0) {
    for (const year of Object.keys(yearData)) {
      const filteredPosts = publishPosts.filter((post) => {
        const date = new Date(post.date)
        return date.getFullYear() === parseInt(year)
      })
      const rss = generateRss(config, filteredPosts, `years/${year}/${page}`)
      const rssPath = path.join(outputFolder, 'years', year)
      mkdirSync(rssPath, { recursive: true })
      writeFileSync(path.join(rssPath, page), rss)
    }
  }
}

const rss = () => {
  generateRSS(siteMetadata, allBlogs)
  console.log('RSS feed generated...')
}
export default rss
