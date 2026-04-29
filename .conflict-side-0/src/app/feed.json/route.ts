import { NextResponse } from 'next/server';
import { getPublishedPosts, generateJsonFeed } from '@/lib/feed-helpers';

export const dynamic = 'force-static';

export async function GET() {
  const posts = getPublishedPosts(50);
  const json = generateJsonFeed(posts, { feedPath: 'feed.json' });

  return new NextResponse(json, {
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
