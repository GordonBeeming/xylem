import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { PostLayout } from "@/layouts/PostLayout";
import { ClientPost } from "./client-post";
import { fetchTina, tinaClient } from "@/components/tina/fetch";
import {
  getAllPosts,
  getPost,
  getRelatedPosts,
  getAdjacentPosts,
  getSiteConfig,
} from "@/lib/tina-helpers";
import { extractHeadings } from "@/lib/content";
import { mdxComponents, mdxOptions } from "@/lib/mdx";
// rehype-code-meta no longer needed — shiki transformers handle meta
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug.split("/"),
  }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const result = getPost(slug);

  if (result === null) {
    return { title: "Post Not Found" };
  }

  const { meta } = result;
  const url = `https://gordonbeeming.com/blog/${meta.slug}`;

  return {
    title: meta.title,
    description: meta.summary ?? `Blog post by Gordon Beeming: ${meta.title}`,
    openGraph: {
      title: meta.title,
      description: meta.summary ?? `Blog post by Gordon Beeming: ${meta.title}`,
      url,
      type: "article",
      publishedTime: meta.date,
      modifiedTime: meta.lastmod ?? meta.date,
      authors: ["Gordon Beeming"],
      tags: meta.tags,
      images: [
        {
          url: `https://gordonbeeming.com/og/${meta.slug}.png`,
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.summary ?? `Blog post by Gordon Beeming: ${meta.title}`,
      creator: "@GordonBeeming",
    },
    alternates: {
      canonical: meta.canonicalUrl || url,
    },
  };
}

export default async function BlogPostPage(props: PageProps) {
  const { slug } = await props.params;
  const result = getPost(slug);

  if (result === null) {
    notFound();
  }

  const { meta, content } = result;

  const relatedPosts = getRelatedPosts(meta.slug, meta.tags, 3);
  const { prev, next } = getAdjacentPosts(meta.slug);
  // The sidebar's "Recent posts" list is site-wide and newest-first, unlike
  // relatedPosts, which is scored against this post's tags.
  const recentPosts = getAllPosts()
    .filter((post) => post.slug !== meta.slug)
    .slice(0, 4);
  const headings = extractHeadings(content);
  const siteConfig = getSiteConfig();

  const wordCount = content.split(/\s+/).length;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: meta.title,
    datePublished: meta.date,
    dateModified: meta.lastmod ?? meta.date,
    description: meta.summary ?? "",
    url: `https://gordonbeeming.com/blog/${meta.slug}`,
    author: {
      "@type": "Person",
      name: "Gordon Beeming",
      url: "https://gordonbeeming.com/about",
    },
    publisher: {
      "@type": "Organization",
      name: "xylem | Gordon Beeming",
      url: "https://gordonbeeming.com",
    },
    wordCount,
    keywords: meta.tags.join(", "),
  };

  // Live editing data from the Tina client. Null on the static build and on a
  // plain `pnpm dev` (no Tina server on :4001) — the page then renders straight
  // from the filesystem with no client JS.
  const tinaData = await fetchTina(() =>
    tinaClient.queries.post({ relativePath: `${meta.slug}.mdx` }),
  );

  const mdxBody = (
    <MDXRemote
      source={content}
      components={mdxComponents}
      options={mdxOptions}
    />
  );

  const layoutProps = {
    prevPost: prev,
    nextPost: next,
    relatedPosts,
    recentPosts,
    headings,
    siteConfig,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {tinaData ? (
        <ClientPost
          query={tinaData.query}
          variables={tinaData.variables}
          data={tinaData.data}
          meta={meta}
          layoutProps={layoutProps}
        >
          {mdxBody}
        </ClientPost>
      ) : (
        <PostLayout meta={meta} {...layoutProps}>
          {mdxBody}
        </PostLayout>
      )}
    </>
  );
}
