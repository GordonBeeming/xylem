import Image from "next/image";
import Link from "next/link";
import { ReadingProgressBar } from "@/components/blog/ReadingProgressBar";
import { PostNavigation } from "@/components/blog/PostNavigation";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { Comments } from "@/components/blog/Comments";
import { Toc } from "@/components/blog/Toc";
import { MobileToc } from "@/components/blog/MobileToc";
import { Tag } from "@/components/ds/Tag";
import { Card } from "@/components/ds/Card";
import { SocialIcon } from "@/components/social-icons/SocialIcon";
import { formatDateShort, type HeadingEntry } from "@/lib/content";
import { EditInTinaButton } from "@/components/blog/EditInTinaButton";
import type { PostMeta, SiteConfig } from "@/lib/tina-helpers";
import { slug as slugifyTag } from "github-slugger";

interface PostLayoutProps {
  meta: PostMeta;
  prevPost: PostMeta | null;
  nextPost: PostMeta | null;
  relatedPosts: PostMeta[];
  headings: HeadingEntry[];
  siteConfig: SiteConfig;
  children: React.ReactNode;
}

const mono = { fontFamily: "var(--font-mono)" };

type SocialKind = "github" | "linkedin" | "bluesky" | "x" | "youtube";
const authorSocials: { key: SocialKind; configKey: keyof SiteConfig }[] = [
  { key: "github", configKey: "github" },
  { key: "linkedin", configKey: "linkedin" },
  { key: "bluesky", configKey: "bluesky" },
  { key: "x", configKey: "twitter" },
  { key: "youtube", configKey: "youtube" },
];

function AuthorBio({ siteConfig }: { siteConfig: SiteConfig }) {
  const bio = siteConfig.description.replace(/^.*?-\s*/, "");
  return (
    <Card padding="lg" className="mt-[var(--space-10)] flex items-start gap-[var(--space-5)]">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full" style={{ boxShadow: "0 0 0 2px var(--surface), 0 0 0 4px var(--accent)" }}>
        <Image src="/static/images/avatar.jpg" alt="Gordon Beeming" fill className="object-cover" />
      </div>
      <div className="flex-1">
        <div style={{ fontWeight: "var(--fw-semibold)", fontSize: "var(--text-md)", color: "var(--text)" }}>Gordon Beeming</div>
        <p className="mt-1.5" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--lh-relaxed)", color: "var(--text-muted)" }}>
          {bio}
        </p>
        <div className="-ml-2 mt-[var(--space-3)] flex gap-0.5">
          {authorSocials.map(({ key, configKey }) => {
            const href = siteConfig[configKey] as string | undefined;
            if (!href) return null;
            return <SocialIcon key={key} kind={key} href={href} size={16} variant="muted" />;
          })}
        </div>
      </div>
    </Card>
  );
}

export function PostLayout({
  meta,
  prevPost,
  nextPost,
  relatedPosts,
  headings,
  siteConfig,
  children,
}: PostLayoutProps) {
  return (
    <>
      <ReadingProgressBar />

      <div className="post-wrap">
        <article className="post-main" role="article" aria-labelledby="post-title">
          <Link
            href="/blog"
            className="no-underline"
            style={{ ...mono, fontSize: "var(--text-xs)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-muted)" }}
          >
            ← all posts
          </Link>

          <h1
            id="post-title"
            className="mt-5"
            style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tighter)", lineHeight: 1.05, color: "var(--text)" }}
          >
            {meta.title}
          </h1>

          <div className="mt-[var(--space-5)] flex flex-wrap items-center gap-[var(--space-3)]">
            <div className="relative h-[30px] w-[30px] shrink-0 overflow-hidden rounded-full">
              <Image src="/static/images/avatar.jpg" alt="Gordon Beeming" fill className="object-cover" />
            </div>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--fw-medium)", color: "var(--text)" }}>Gordon Beeming</span>
            <span style={{ color: "var(--text-subtle)" }}>·</span>
            <time
              dateTime={meta.date}
              style={{ ...mono, fontSize: "var(--text-xs)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-wide)" }}
            >
              {formatDateShort(meta.date)}
            </time>
            <span style={{ color: "var(--text-subtle)" }}>·</span>
            <span style={{ ...mono, fontSize: "var(--text-xs)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-wide)" }}>
              {meta.readingTime.text}
            </span>
            <EditInTinaButton relativePath={`${meta.slug}.mdx`} />
          </div>

          {meta.tags.length > 0 && (
            <div className="mt-[var(--space-5)] flex flex-wrap gap-1.5">
              {meta.tags.map((tag) => (
                <Tag key={tag} as="a" href={`/tags/${slugifyTag(tag).replace(/--+/g, "-")}`} size="sm">
                  {tag}
                </Tag>
              ))}
            </div>
          )}

          <div className="my-[var(--space-8)] h-px" style={{ background: "var(--border)" }} />

          <MobileToc headings={headings} />
          <div className="prose">{children}</div>

          <AuthorBio siteConfig={siteConfig} />

          <RelatedPosts
            posts={relatedPosts.map((p) => ({
              title: p.title,
              slug: p.slug,
              date: p.date,
            }))}
          />

          <PostNavigation
            prevPost={prevPost ? { title: prevPost.title, slug: prevPost.slug } : null}
            nextPost={nextPost ? { title: nextPost.title, slug: nextPost.slug } : null}
          />

          <Comments />
        </article>

        <aside className="post-aside">
          <div className="sticky" style={{ top: 100 }}>
            <Toc headings={headings} />
          </div>
        </aside>
      </div>
    </>
  );
}
