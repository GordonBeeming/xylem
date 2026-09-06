import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { getDraft, getDrafts, getDraftSlugs } from "@/lib/drafts";
import { mdxComponents, mdxOptions } from "@/lib/mdx";
import styles from "./drafts.module.css";

export const metadata: Metadata = {
  title: "Drafts",
  robots: { index: false, follow: false },
};

const ui = { fontFamily: "var(--font-ui)" };

export function generateStaticParams() {
  return [{ slug: [] }, ...getDraftSlugs().map((slug) => ({ slug: [slug] }))];
}

export default async function DraftsPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;

  // One segment means a single draft; none means the index.
  if (slug !== undefined && slug.length > 0) {
    const draft = getDraft(slug[0]);
    if (draft === null) notFound();
    return (
      <PageShell>
        <p className={styles.backLink} style={ui}>
          <Link href="/drafts">&laquo; all drafts</Link>
        </p>
        <div className={styles.meta} style={ui}>
          {draft.meta.queuePosition !== null && (
            <span className={styles.queueBadge}>Queue {draft.meta.queuePosition}</span>
          )}
          {draft.meta.date !== null && <span>{draft.meta.date}</span>}
          <span>{draft.meta.words.toLocaleString()} words</span>
        </div>
        <h1 style={{ fontSize: "34px", fontWeight: "var(--fw-regular)", lineHeight: 1.22, color: "var(--text)", margin: "6px 0 14px" }}>
          {draft.meta.title}
        </h1>
        {draft.meta.tags.length > 0 && (
          <div className={styles.tags}>
            {draft.meta.tags.map((tag) => (
              <span key={tag} className={styles.chip} style={ui}>{tag}</span>
            ))}
          </div>
        )}
        <div className={styles.path} style={ui}>content/blog-drafts/{draft.meta.slug}/post.mdx</div>
        {draft.meta.images > 0 && (
          <p className={styles.imageNote} style={ui}>
            This draft has {draft.meta.images} local {draft.meta.images === 1 ? "image" : "images"} under
            its images folder. Those paths only resolve once the post is published, so they render broken here.
          </p>
        )}
        <div style={{ height: 1, background: "var(--border-strong)", margin: "22px 0" }} />
        <div className="prose">
          <MDXRemote source={draft.content} components={mdxComponents} options={mdxOptions} />
        </div>
      </PageShell>
    );
  }

  const { drafts, queue } = getDrafts();

  return (
    <PageShell>
      <div className="eyebrow" style={{ letterSpacing: "var(--ls-wider)" }}>
        Local only
      </div>
      <h1 style={{ fontSize: "34px", fontWeight: "var(--fw-regular)", color: "var(--text)", marginTop: "var(--space-3)" }}>
        Drafts
      </h1>
      <p className={styles.lede}>
        Everything under <code>content/blog-drafts</code>, ordered by publish queue.
        This page is not built for production.
      </p>

      {(queue.nextPublishOn !== null || queue.publishEveryDays !== null) && (
        <p className={styles.queueLine} style={ui}>
          {queue.nextPublishOn !== null && <>Next publish {queue.nextPublishOn}</>}
          {queue.nextPublishOn !== null && queue.publishEveryDays !== null && " · "}
          {queue.publishEveryDays !== null && <>every {queue.publishEveryDays} days</>}
        </p>
      )}

      {queue.missing.length > 0 && (
        <div className={styles.warning}>
          <div className={styles.warningHead} style={ui}>
            {queue.missing.length} queued {queue.missing.length === 1 ? "entry has" : "entries have"} no file on disk
          </div>
          <ul className={styles.warningList} style={ui}>
            {queue.missing.map((slug) => (
              <li key={slug}>{slug}</li>
            ))}
          </ul>
        </div>
      )}

      {drafts.length === 0 ? (
        <p className={styles.empty}>No drafts in the folder.</p>
      ) : (
        <div className={styles.list}>
          {drafts.map((draft) => (
            <article key={draft.slug}>
              <div className={styles.meta} style={ui}>
                {draft.queuePosition !== null && (
                  <span className={styles.queueBadge}>Queue {draft.queuePosition}</span>
                )}
                {draft.date !== null && <span>{draft.date}</span>}
                <span>{draft.words.toLocaleString()} words</span>
                {draft.images > 0 && <span>{draft.images} {draft.images === 1 ? "image" : "images"}</span>}
              </div>
              <h2 className={styles.title}>
                <Link href={`/drafts/${draft.slug}`}>{draft.title}</Link>
              </h2>
              {draft.summary !== null && <p className={styles.summary}>{draft.summary}</p>}
              <div className={styles.path} style={ui}>content/blog-drafts/{draft.slug}/post.mdx</div>
              {draft.tags.length > 0 && (
                <div className={styles.tags}>
                  {draft.tags.map((tag) => (
                    <span key={tag} className={styles.chip} style={ui}>{tag}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
