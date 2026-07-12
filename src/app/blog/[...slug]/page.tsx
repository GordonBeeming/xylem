import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import rehypeShiki from "@shikijs/rehype";
import { PostLayout } from "@/layouts/PostLayout";
import {
  getAllPosts,
  getPost,
  getRelatedPosts,
  getAdjacentPosts,
  getSiteConfig,
} from "@/lib/tina-helpers";
import { extractHeadings } from "@/lib/content";
import { Figure } from "@/components/prose/Figure";
import { YouTubeEmbed } from "@/components/prose/YouTubeEmbed";
import { Walkthrough, Step } from "@/components/prose/Walkthrough";
import { Callout } from "@/components/prose/Callout";
import { proseComponents } from "@/components/prose/prose-components";
// rehype-code-meta no longer needed — shiki transformers handle meta
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

// MDX-only components (used via JSX in .mdx source, not by rendered README
// HTML) layered on top of the shared prose tag handlers.
const mdxComponents = {
  ...proseComponents,
  Figure,
  YouTubeEmbed,
  Walkthrough,
  Step,
  Callout,
};

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

// Try to fetch from TinaCMS client for visual editing support
async function fetchTinaData(slugParts: string[]) {
  try {
    const client = (await import("../../../../tina/__generated__/client")).default;
    const relativePath = `${slugParts.join("/")}.mdx`;
    const result = await client.queries.post({ relativePath });
    return {
      query: result.query,
      variables: result.variables as Record<string, unknown>,
      data: result.data as Record<string, unknown>,
    };
  } catch {
    return null;
  }
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

  // Fetch TinaCMS data for visual editing sidebar
  const tinaData = await fetchTinaData(slug);

  const pageContent = (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PostLayout
        meta={meta}
        prevPost={prev}
        nextPost={next}
        relatedPosts={relatedPosts}
        headings={headings}
        siteConfig={siteConfig}
      >
        <MDXRemote
          source={content}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm, remarkMath],
              rehypePlugins: [
                rehypeSlug,
                rehypeKatex,
                [rehypeShiki, {
                  themes: {
                    light: "github-light",
                    dark: "github-dark",
                  },
                  defaultColor: false,
                  addLanguageClass: true,
                  parseMetaString: (metaString: string) => {
                    return { __raw: metaString };
                  },
                  transformers: [{
                    pre(node: { properties: Record<string, unknown> }) {
                      const meta = (this as unknown as { options: { meta?: { __raw?: string } } }).options?.meta?.__raw;
                      if (meta) {
                        node.properties["data-meta"] = meta;
                      }
                    },
                  }],
                }],
              ],
            },
          }}
        />
      </PostLayout>
    </>
  );

  // Wrap with TinaCMS client component for visual editing when available
  if (tinaData) {
    const { ClientPost } = await import("./client-post");
    return (
      <ClientPost
        query={tinaData.query}
        variables={tinaData.variables}
        data={tinaData.data}
      >
        {pageContent}
      </ClientPost>
    );
  }

  return pageContent;
}
