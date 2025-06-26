import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { slug } from 'github-slugger'
import { escape } from 'pliny/utils/htmlEscaper.js'
import siteMetadata from '../data/siteMetadata.js'
import tagData from '../src/app/tag-data.json' with { type: 'json' }
import { allBlogs } from '../.contentlayer/generated/index.mjs'
import { sortPosts } from 'pliny/utils/contentlayer.js'

const outputFolder = process.env.EXPORT ? 'out' : 'public'

function getBrisbaneMidnight(dateString) {
  // Create a new Date object from the input date string.
  // This will initially be in the local timezone of the machine running the code.
  const date = new Date(dateString);

  // Set the time to midnight (00:00:00.000).
  date.setHours(0, 0, 0, 0);

  // Get the current UTC offset for Brisbane (Australia/Brisbane).
  // We'll create a dummy date at the target time to get the correct offset,
  // as DST rules can change offsets.
  // Note: For 'Australia/Brisbane', there is no Daylight Saving Time,
  // so the offset is consistent, but this approach is robust for other timezones.
  const brisbaneTimezone = 'Australia/Brisbane';
  const brisbaneOffset = new Date(date.toLocaleString('en-US', { timeZone: brisbaneTimezone }))
    .getTime() - new Date(date.toLocaleString('en-US', { timeZone: 'UTC' })).getTime();

  // Adjust the date to Brisbane's midnight.
  // We subtract the local offset and add the Brisbane offset to get to Brisbane time.
  // The 'getTimezoneOffset()' method returns the difference in minutes between UTC and local time.
  // We convert it to milliseconds.
  const localOffsetMilliseconds = date.getTimezoneOffset() * 60 * 1000;
  date.setTime(date.getTime() + localOffsetMilliseconds + brisbaneOffset);

  return date;
}

const generateRssItem = (config, post) => `
  <item>
    <guid>${config.siteUrl}/blog/${post.slug}</guid>
    <title>${escape(post.title)}</title>
    <link>${config.siteUrl}/blog/${post.slug}</link>
    ${post.summary && `<description>${escape(post.summary)}</description>`}
    <pubDate>${getBrisbaneMidnight(post.date).toUTCString()}</pubDate>
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
      <lastBuildDate>${getBrisbaneMidnight(posts[0].date).toUTCString()}</lastBuildDate>
      <atom:link href="${config.siteUrl}/${page}" rel="self" type="application/rss+xml"/>
      ${posts.map((post) => generateRssItem(config, post)).join('')}
    </channel>
  </rss>
`

async function generateRSS(config, allBlogs, page = 'feed.xml') {
  const publishPosts = allBlogs.filter((post) => post.draft !== true)
  // RSS for blog post
  if (publishPosts.length > 0) {
    const rss = generateRss(config, sortPosts(publishPosts))
    writeFileSync(`./${outputFolder}/${page}`, rss)
  }

  if (publishPosts.length > 0) {
    for (const tag of Object.keys(tagData)) {
      const filteredPosts = allBlogs.filter((post) => post.tags.map((t) => slug(t).replace(/--+/g, '-')).includes(tag))
      const rss = generateRss(config, filteredPosts, `tags/${tag}/${page}`)
      const rssPath = path.join(outputFolder, 'tags', tag)
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
