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
import { AnchorHeading } from "@/components/prose/AnchorHeading";
import { Figure } from "@/components/prose/Figure";
import { YouTubeEmbed } from "@/components/prose/YouTubeEmbed";
import { Walkthrough, Step } from "@/components/prose/Walkthrough";
import { TableWrapper } from "@/components/prose/TableWrapper";
import { CodeBlock } from "@/components/prose/CodeBlock";
import { MermaidDiagram } from "@/components/prose/MermaidDiagram";
import { Callout } from "@/components/prose/Callout";
// rehype-code-meta no longer needed — shiki transformers handle meta
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

const mdxComponents = {
  h2: (props: React.ComponentProps<"h2">) => {
    const id = props.id ?? "";
    return <AnchorHeading level={2} id={id}>{props.children}</AnchorHeading>;
  },
  h3: (props: React.ComponentProps<"h3">) => {
    const id = props.id ?? "";
    return <AnchorHeading level={3} id={id}>{props.children}</AnchorHeading>;
  },
  h4: (props: React.ComponentProps<"h4">) => {
    const id = props.id ?? "";
    return <AnchorHeading level={4} id={id}>{props.children}</AnchorHeading>;
  },
  table: (props: React.ComponentProps<"table">) => (
    <TableWrapper>{props.children}</TableWrapper>
  ),
  Figure,
  YouTubeEmbed,
  Walkthrough,
  Step,
  img: (props: React.ComponentProps<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      className="mx-auto max-w-full rounded-lg"
      loading="lazy"
      alt={props.alt ?? ""}
    />
  ),
  a: (props: React.ComponentProps<"a">) => {
    const isExternal =
      typeof props.href === "string" &&
      (props.href.startsWith("http://") || props.href.startsWith("https://"));
    return (
      <a
        {...props}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      />
    );
  },
  Callout,
  pre: (props: Record<string, unknown>) => {
    // Shiki + our rehype plugins set dataMeta and dataLanguage on <pre>
    const child = props.children as React.ReactElement<{
      className?: string;
      children?: React.ReactNode;
    }>;

    // Try multiple sources for language
    const codeClassName = child?.props?.className ?? "";
    const language =
      (props.dataLanguage as string) ??
      (props["data-language"] as string) ??
      (codeClassName.includes("language-")
        ? codeClassName.replace(/.*language-(\S+).*/, "$1")
        : undefined);

    // Extract title from the meta string: title="filename.go"
    const meta = (props.dataMeta as string) ?? (props["data-meta"] as string) ?? "";
    const titleMatch = meta.match(/title=["']([^"']+)["']/);
    const filename = titleMatch?.[1] ?? undefined;

    // Extract raw text from React children tree (for copy button)
    function extractText(node: React.ReactNode): string {
      if (node == null || typeof node === "boolean") return "";
      if (typeof node === "string") return node;
      if (typeof node === "number") return String(node);
      if (Array.isArray(node)) return node.map(extractText).join("");
      if (typeof node === "object" && node !== null) {
        const n = node as unknown as { props?: { children?: React.ReactNode; className?: string } };
        // Shiki uses <span class="line"> - add newline between lines
        if (n.props?.className === "line") {
          return extractText(n.props.children) + "\n";
        }
        if (n.props?.children != null) return extractText(n.props.children);
      }
      return "";
    }
    const code = extractText(child?.props?.children).replace(/\n$/, "");

    // Render mermaid code blocks as interactive diagrams instead of syntax-highlighted code
    if (language === "mermaid") {
      return <MermaidDiagram chart={code} title={filename} />;
    }

    return (
      <CodeBlock code={code} language={language} filename={filename}>
        {child}
      </CodeBlock>
    );
  },
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
