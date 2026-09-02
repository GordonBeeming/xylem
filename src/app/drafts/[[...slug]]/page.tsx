import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { getDrafts } from "@/lib/drafts";
import styles from "./drafts.module.css";

export const metadata: Metadata = {
  title: "Drafts",
  robots: { index: false, follow: false },
};

const ui = { fontFamily: "var(--font-ui)" };

/** Returning no params in a production build means the export emits nothing at
 *  all for this route, so /drafts is a real 404 rather than a page that answers
 *  200 with 404 content. NODE_ENV is inlined at build time. */
export function generateStaticParams() {
  return process.env.NODE_ENV === "production" ? [] : [{ slug: [] }];
}

export default function DraftsPage() {
  // Belt and braces: the route emits nothing in production, and refuses to
  // render even if it somehow did.
  if (process.env.NODE_ENV === "production") {
    notFound();
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
              <h2 className={styles.title}>{draft.title}</h2>
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
