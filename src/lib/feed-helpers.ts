import { getAllPosts, getSiteConfig, type PostData } from './tina-helpers';
import { sortPosts } from './content';
import { slug } from 'github-slugger';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface FeedPost {
  title: string;
  date: string;
  summary: string;
  tags: string[];
  slug: string;
  link: string;
}

export function getPublishedPosts(limit: number = 50): FeedPost[] {
  const config = getSiteConfig();
  const sorted = sortPosts(getAllPosts());

  return sorted.slice(0, limit).map((post) => ({
    title: post.title,
    date: post.date,
    summary: post.summary ?? "",
    tags: post.tags,
    slug: post.slug,
    link: `${config.siteUrl}/blog/${post.slug}`,
  }));
}

export function getPostsByTag(tag: string, limit: number = 50): FeedPost[] {
  const config = getSiteConfig();
  const sorted = sortPosts(getAllPosts());

  const filtered = sorted.filter((post) =>
    post.tags.some(
      (t) => slug(t).replace(/--+/g, '-') === tag
    )
  );

  return filtered.slice(0, limit).map((post) => ({
    title: post.title,
    date: post.date,
    summary: post.summary ?? "",
    tags: post.tags,
    slug: post.slug,
    link: `${config.siteUrl}/blog/${post.slug}`,
  }));
}

export function getPostsByYear(year: string, limit: number = 50): FeedPost[] {
  const config = getSiteConfig();
  const sorted = sortPosts(getAllPosts());

  const filtered = sorted.filter((post) => {
    const postYear = new Date(post.date).getFullYear().toString();
    return postYear === year;
  });

  return filtered.slice(0, limit).map((post) => ({
    title: post.title,
    date: post.date,
    summary: post.summary ?? "",
    tags: post.tags,
    slug: post.slug,
    link: `${config.siteUrl}/blog/${post.slug}`,
  }));
}

export function generateRssXml(
  posts: FeedPost[],
  options?: { title?: string; feedPath?: string }
): string {
  const config = getSiteConfig();
  const feedTitle = options?.title ?? config.title;
  const feedPath = options?.feedPath ?? 'feed.xml';

  const lastBuildDate =
    posts.length > 0
      ? new Date(posts[0].date).toUTCString()
      : new Date().toUTCString();

  const items = posts
    .map(
      (post) => `    <item>
      <guid>${escapeXml(post.link)}</guid>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(post.link)}</link>
      ${post.summary ? `<description>${escapeXml(post.summary)}</description>` : ''}
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>${escapeXml(config.email ?? '')} (${escapeXml(config.author)})</author>
      ${post.tags.map((t) => `<category>${escapeXml(t)}</category>`).join('\n      ')}
    </item>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(feedTitle)}</title>
    <link>${config.siteUrl}/blog</link>
    <description>${escapeXml(config.description)}</description>
    <language>${config.language}</language>
    <managingEditor>${escapeXml(config.email ?? '')} (${escapeXml(config.author)})</managingEditor>
    <webMaster>${escapeXml(config.email ?? '')} (${escapeXml(config.author)})</webMaster>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${config.siteUrl}/${feedPath}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

export function generateAtomXml(
  posts: FeedPost[],
  options?: { title?: string; feedPath?: string }
): string {
  const config = getSiteConfig();
  const feedTitle = options?.title ?? config.title;
  const feedPath = options?.feedPath ?? 'atom.xml';

  const updated =
    posts.length > 0
      ? new Date(posts[0].date).toISOString()
      : new Date().toISOString();

  const entries = posts
    .map(
      (post) => `  <entry>
    <id>${escapeXml(post.link)}</id>
    <title>${escapeXml(post.title)}</title>
    <link href="${escapeXml(post.link)}" rel="alternate" type="text/html"/>
    <updated>${new Date(post.date).toISOString()}</updated>
    <published>${new Date(post.date).toISOString()}</published>
    ${post.summary ? `<summary>${escapeXml(post.summary)}</summary>` : ''}
    <author>
      <name>${escapeXml(config.author)}</name>
      ${config.email ? `<email>${escapeXml(config.email)}</email>` : ''}
    </author>
    ${post.tags.map((t) => `<category term="${escapeXml(t)}"/>`).join('\n    ')}
  </entry>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(feedTitle)}</title>
  <link href="${config.siteUrl}" rel="alternate" type="text/html"/>
  <link href="${config.siteUrl}/${feedPath}" rel="self" type="application/atom+xml"/>
  <id>${config.siteUrl}/</id>
  <updated>${updated}</updated>
  <subtitle>${escapeXml(config.description)}</subtitle>
  <author>
    <name>${escapeXml(config.author)}</name>
    ${config.email ? `<email>${escapeXml(config.email)}</email>` : ''}
  </author>
${entries}
</feed>`;
}

export function generateJsonFeed(
  posts: FeedPost[],
  options?: { title?: string; feedPath?: string }
): string {
  const config = getSiteConfig();
  const feedTitle = options?.title ?? config.title;
  const feedPath = options?.feedPath ?? 'feed.json';

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: feedTitle,
    home_page_url: config.siteUrl,
    feed_url: `${config.siteUrl}/${feedPath}`,
    description: config.description,
    language: config.language,
    authors: [
      {
        name: config.author,
        url: config.siteUrl,
      },
    ],
    items: posts.map((post) => ({
      id: post.link,
      url: post.link,
      title: post.title,
      summary: post.summary || undefined,
      date_published: new Date(post.date).toISOString(),
      tags: post.tags.length > 0 ? post.tags : undefined,
      authors: [
        {
          name: config.author,
        },
      ],
    })),
  };

  return JSON.stringify(feed, null, 2);
}
