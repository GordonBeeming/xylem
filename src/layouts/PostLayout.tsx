import Link from "next/link";
import Avatar from "@/components/Avatar";
import { SiteSearch } from "@/components/ui/SiteSearch";
import { ReadingProgressBar } from "@/components/blog/ReadingProgressBar";
import { PostNavigation } from "@/components/blog/PostNavigation";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { Comments } from "@/components/blog/Comments";
import { Toc } from "@/components/blog/Toc";
import { MobileToc } from "@/components/blog/MobileToc";
import { Tag } from "@/components/ds/Tag";
import { Card } from "@/components/ds/Card";
import { SocialIcon } from "@/components/social-icons/SocialIcon";
import { SITE_SOCIAL_LINKS } from "@/lib/social-links";
import { formatDate, postHref, type HeadingEntry } from "@/lib/content";
import { EditInTinaButton } from "@/components/blog/EditInTinaButton";
import type { PostMeta, SiteConfig } from "@/lib/tina-helpers";
import { slug as slugifyTag } from "github-slugger";
import { ABOUT_RAIL_BLURB } from "@/lib/site-copy";
import styles from "./PostLayout.module.css";

interface PostLayoutProps {
  meta: PostMeta;
  prevPost: PostMeta | null;
  nextPost: PostMeta | null;
  relatedPosts: PostMeta[];
  headings: HeadingEntry[];
  siteConfig: SiteConfig;
  children: React.ReactNode;
  // The rail's "Recent posts" list. Optional because the current caller
  // (src/app/blog/[...slug]/page.tsx, outside this wave's file set) doesn't
  // compute it yet — see this team member's report for the one-line addition
  // needed there (getAllPosts().filter(...).slice(0, N)).
  recentPosts?: PostMeta[];
  // Present only when rendered inside the TinaCMS admin (via ClientPost): the
  // `data-tina-field` values that make each element click-to-edit. Undefined on
  // the static site, where the attributes are simply omitted.
  tinaFields?: { title?: string; date?: string; tags?: string };
}

const ui = { fontFamily: "var(--font-ui)" };

function AuthorBio({ siteConfig }: { siteConfig: SiteConfig }) {
  const bio = siteConfig.description.replace(/^.*?-\s*/, "");
  return (
    <Card padding="lg" className="mt-[var(--space-10)] flex items-start gap-[var(--space-5)]">
      <Avatar size={56} shape="square" alt="Gordon Beeming" className="border border-[var(--border)]" />
      <div className="flex-1">
        <div style={{ fontSize: "var(--text-md)", color: "var(--text)" }}>Gordon Beeming</div>
        <p className="mt-1.5" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--lh-relaxed)", color: "var(--text-muted)" }}>
          {bio}
        </p>
        <div className="-ml-2 mt-[var(--space-3)] flex gap-0.5">
          {SITE_SOCIAL_LINKS.map(({ kind, configKey }) => {
            const href = siteConfig[configKey] as string | undefined;
            if (!href) return null;
            return <SocialIcon key={kind} kind={kind} href={href} size={16} variant="muted" />;
          })}
        </div>
      </div>
    </Card>
  );
}

function AboutRailCard() {
  return (
    <div className={styles.aboutCard}>
      <div className={styles.sectionHeading}>About</div>
      <Avatar
        size={66}
        shape="square"
        alt="Gordon Beeming"
        className="mb-[11px] border border-[var(--border)]"
      />
      <p className={styles.aboutBlurb}>{ABOUT_RAIL_BLURB}</p>
      <Link href="/about" style={ui}>
        More about me &raquo;
      </Link>
    </div>
  );
}

function RecentPostsRail({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null;
  return (
    <div>
      <div className={styles.sectionHeading}>Recent posts</div>
      <div className={styles.recentList}>
        {posts.map((post) => (
          <Link key={post.slug} href={postHref(post.slug)} className={styles.recentLink}>
            {post.title}
          </Link>
        ))}
      </div>
    </div>
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
  recentPosts = [],
  tinaFields,
}: PostLayoutProps) {
  return (
    <>
      <ReadingProgressBar />

      <div className="post-wrap">
        <article className="post-main" role="article" aria-labelledby="post-title">
          <div className={styles.measure}>
            <Link
              href="/blog"
              className="no-underline"
              style={{ ...ui, fontSize: "var(--text-xs)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-muted)" }}
            >
              ← all posts
            </Link>

            <h1
              id="post-title"
              className="mt-5"
              style={{ fontSize: "34px", fontWeight: "var(--fw-regular)", letterSpacing: "var(--ls-normal)", lineHeight: 1.22, color: "var(--text)" }}
              data-tina-field={tinaFields?.title}
            >
              {meta.title}
            </h1>

            <div className="mt-[var(--space-5)] flex flex-wrap items-center gap-[var(--space-3)]">
              <Avatar size={30} shape="square" alt="Gordon Beeming" className="border border-[var(--border)]" />
              <span style={{ fontSize: "14px", color: "var(--text)" }}>Gordon Beeming</span>
              <time
                dateTime={meta.date}
                style={{ ...ui, fontSize: "11px", color: "var(--text-muted)" }}
                data-tina-field={tinaFields?.date}
              >
                {`\u00B7 ${formatDate(meta.date, "en-GB")} \u00B7 ${meta.readingTime.text}`}
              </time>
              <EditInTinaButton relativePath={`${meta.slug}.mdx`} />
            </div>

            {meta.tags.length > 0 && (
              <div className="mt-[var(--space-5)] flex flex-wrap gap-1.5" data-tina-field={tinaFields?.tags}>
                {meta.tags.map((tag) => (
                  <Tag key={tag} as="a" href={`/tags/${slugifyTag(tag).replace(/--+/g, "-")}`} size="sm">
                    {tag}
                  </Tag>
                ))}
              </div>
            )}

            <div className="my-[var(--space-8)] h-px" style={{ background: "var(--border-strong)" }} />

            <MobileToc headings={headings} />
            <div className="prose">{children}</div>
          </div>

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

        <aside className={`post-aside ${styles.railStack}`}>
          <div className="sticky" style={{ top: 100 }}>
            <Toc headings={headings} />
          </div>
          <AboutRailCard />
          <div>
            <div className={styles.sectionHeading}>Search</div>
            <SiteSearch />
          </div>
          <RecentPostsRail posts={recentPosts} />
        </aside>
      </div>
    </>
  );
}
