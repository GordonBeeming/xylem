import Image from "next/image";
import { ReadingProgressBar } from "@/components/blog/ReadingProgressBar";
import { PostNavigation } from "@/components/blog/PostNavigation";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { Comments } from "@/components/blog/Comments";
import { TagPill } from "@/components/ui/TagPill";
import { formatDate } from "@/lib/content";
import type { PostMeta } from "@/lib/tina-helpers";

interface PostLayoutProps {
  meta: PostMeta;
  prevPost: PostMeta | null;
  nextPost: PostMeta | null;
  relatedPosts: PostMeta[];
  children: React.ReactNode;
}

export function PostLayout({
  meta,
  prevPost,
  nextPost,
  relatedPosts,
  children,
}: PostLayoutProps) {
  const formattedDate = formatDate(meta.date);

  return (
    <>
      <ReadingProgressBar />

      <article role="article" aria-labelledby="post-title">
        {/* Article Header */}
        <header className="mx-auto max-w-3xl px-6 pt-16 text-center">
          <h1
            id="post-title"
            className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-[var(--color-text-primary)] md:text-5xl"
          >
            {meta.title}
          </h1>

          {/* Meta line */}
          <div className="mb-5 flex flex-wrap items-center justify-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <Image
              src="/static/images/avatar.jpg"
              alt="Gordon Beeming"
              width={32}
              height={32}
              className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
            />
            <span className="font-medium text-[var(--color-text-primary)]">
              Gordon Beeming
            </span>
            <span className="text-[var(--color-border-default)]" aria-hidden="true">
              &middot;
            </span>
            <time dateTime={meta.date}>{formattedDate}</time>
            <span className="text-[var(--color-border-default)]" aria-hidden="true">
              &middot;
            </span>
            <span>{meta.readingTime.text}</span>
          </div>

          {/* Tags */}
          {meta.tags.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {meta.tags.map((tag) => (
                <TagPill key={tag} tag={tag} />
              ))}
            </div>
          )}
        </header>

        {/* Article Body */}
        <div className="prose-article mx-auto max-w-3xl px-6 py-8">
          {children}
        </div>
      </article>

      {/* Related Posts */}
      <RelatedPosts
        posts={relatedPosts.map((p) => ({
          title: p.title,
          slug: p.slug,
          date: p.date,
        }))}
      />

      {/* Post Navigation */}
      <PostNavigation
        prevPost={prevPost ? { title: prevPost.title, slug: prevPost.slug } : undefined}
        nextPost={nextPost ? { title: nextPost.title, slug: nextPost.slug } : undefined}
      />

      {/* Comments */}
      <Comments />
    </>
  );
}
