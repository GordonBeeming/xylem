import { NextResponse } from 'next/server';
import { getPublishedPosts, generateRssXml } from '@/lib/feed-helpers';

export const dynamic = 'force-static';

export async function GET() {
  const posts = getPublishedPosts(50);
  const xml = generateRssXml(posts, { feedPath: 'feed.xml' });

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
