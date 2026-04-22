import { NextResponse } from 'next/server';
import { getPostsByTag, generateRssXml } from '@/lib/feed-helpers';
import { getAllPosts } from '@/lib/tina-helpers';
import { getTagCounts } from '@/lib/content';

export const dynamic = 'force-static';

export function generateStaticParams() {
  const posts = getAllPosts();
  const tagCounts = getTagCounts(posts);
  return Object.keys(tagCounts).map((tag) => ({ tag }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tag: string }> }
) {
  const { tag } = await params;
  const posts = getPostsByTag(tag, 50);

  if (posts.length === 0) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const xml = generateRssXml(posts, {
    title: `Posts tagged "${tag}" - Gordon Beeming`,
    feedPath: `tags/${tag}/feed.xml`,
  });

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
