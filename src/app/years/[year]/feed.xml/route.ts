import { NextResponse } from 'next/server';
import { getPostsByYear, generateRssXml } from '@/lib/feed-helpers';
import { getAllPosts } from '@/lib/tina-helpers';
import { getYearCounts } from '@/lib/content';

export const dynamic = 'force-static';

export function generateStaticParams() {
  const posts = getAllPosts();
  const yearCounts = getYearCounts(posts);
  return Object.keys(yearCounts).map((year) => ({ year }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ year: string }> }
) {
  const { year } = await params;

  if (!/^\d{4}$/.test(year)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const posts = getPostsByYear(year, 50);

  if (posts.length === 0) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const xml = generateRssXml(posts, {
    title: `Posts from ${year} - Gordon Beeming`,
    feedPath: `years/${year}/feed.xml`,
  });

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
