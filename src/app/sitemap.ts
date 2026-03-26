import type { MetadataRoute } from 'next';
import { getAllPosts, getAllBooks, getSiteConfig } from '@/lib/tina-helpers';
import {
  filterPublishedPosts,
  sortPosts,
  getTagCounts,
  getYearCounts,
} from '@/lib/content';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const config = getSiteConfig();
  const siteUrl = config.siteUrl;
  const allPosts = getAllPosts();
  const publishedPosts = filterPublishedPosts(allPosts);
  const sorted = sortPosts(publishedPosts);

  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const todayStr = now.toISOString().split('T')[0];

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: todayStr,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: todayStr,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: todayStr,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/projects`,
      lastModified: todayStr,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/tags`,
      lastModified: todayStr,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/years`,
      lastModified: todayStr,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/color-palette`,
      lastModified: todayStr,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Blog posts
  const blogEntries: MetadataRoute.Sitemap = sorted.map((post) => {
    const postDate = new Date(post.date);
    const isRecent = postDate > oneYearAgo;
    return {
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.lastmod ?? post.date,
      changeFrequency: isRecent ? ('weekly' as const) : ('yearly' as const),
      priority: isRecent ? 0.8 : 0.6,
    };
  });

  // Tag pages
  const tagCounts = getTagCounts(publishedPosts);
  const tagEntries: MetadataRoute.Sitemap = Object.keys(tagCounts).map(
    (tag) => ({
      url: `${siteUrl}/tags/${tag}`,
      lastModified: todayStr,
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    })
  );

  // Year pages
  const yearCounts = getYearCounts(publishedPosts);
  const yearEntries: MetadataRoute.Sitemap = Object.keys(yearCounts).map(
    (year) => ({
      url: `${siteUrl}/years/${year}`,
      lastModified: todayStr,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    })
  );

  // Book pages
  const books = getAllBooks();
  const bookEntries: MetadataRoute.Sitemap = books.map((book) => ({
    url: `${siteUrl}/books/${book.slug}`,
    lastModified: todayStr,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...blogEntries,
    ...tagEntries,
    ...yearEntries,
    ...bookEntries,
  ];
}
