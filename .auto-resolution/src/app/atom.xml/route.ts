import { NextResponse } from 'next/server';
import { getPublishedPosts, generateAtomXml } from '@/lib/feed-helpers';

export const dynamic = 'force-static';

export async function GET() {
  const posts = getPublishedPosts(50);
  const xml = generateAtomXml(posts, { feedPath: 'atom.xml' });

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
