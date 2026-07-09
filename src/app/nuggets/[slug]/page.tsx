import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllNuggets, getNugget } from "@/lib/nuggets";
import { formatDateShort } from "@/lib/content";
import { Tag } from "@/components/ds/Tag";
import { NuggetStage } from "@/components/nugget/NuggetStage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllNuggets().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata(
  props: PageProps
): Promise<Metadata> {
  const { slug } = await props.params;
  const nugget = getNugget(slug);

  if (nugget === null) {
    return { title: "Nugget not found" };
  }

  const url = `https://gordonbeeming.com/nuggets/${nugget.slug}`;
  const description =
    nugget.summary ?? `A nugget by Gordon Beeming: ${nugget.title}`;

  return {
    title: nugget.title,
    description,
    openGraph: {
      title: nugget.title,
      description,
      url,
      type: "article",
      publishedTime: nugget.date,
      authors: ["Gordon Beeming"],
      tags: nugget.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: nugget.title,
      description,
      creator: "@GordonBeeming",
    },
    alternates: {
      canonical: url,
    },
  };
}

const mono = { fontFamily: "var(--font-mono)" };

export default async function NuggetPage(props: PageProps) {
  const { slug } = await props.params;
  const nugget = getNugget(slug);

  if (nugget === null) {
    notFound();
  }

  // Raw nugget HTML is at public/nuggets/_raw/<slug>/index.html — the directory
  // layout keeps it clear of Next's static-export output for /nuggets/<slug>
  // (out/nuggets/<slug>.html for the chromed page; same filename here would
  // cause infinite iframe nesting). We point the iframe at the explicit
  // /index.html path because Next's dev server doesn't auto-resolve a bare
  // directory URL to index.html — only static hosts do. Same URL works in both.
  const rawUrl = `/nuggets/_raw/${nugget.slug}/index.html`;

  return (
    <div>
      <div className="page-narrow">
        <Link
          href="/nuggets"
          className="no-underline"
          style={{ ...mono, fontSize: "var(--text-xs)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-muted)" }}
        >
          ← all nuggets
        </Link>
        <div className="mt-[18px] flex items-center gap-[var(--space-3)]">
          <span className="eyebrow" style={{ color: "var(--secondary)" }}>
            Nugget
          </span>
          <span style={{ ...mono, fontSize: "var(--text-2xs)", color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "var(--ls-wide)" }}>
            {formatDateShort(nugget.date)}
          </span>
        </div>
        <h1
          className="mt-2.5"
          style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tighter)", lineHeight: 1.08, color: "var(--text)" }}
        >
          {nugget.title}
        </h1>
        {nugget.summary && (
          <p
            className="mt-3 max-w-[var(--width-prose)]"
            style={{ fontSize: "var(--text-md)", lineHeight: "var(--lh-relaxed)", color: "var(--text-muted)" }}
          >
            {nugget.summary}
          </p>
        )}
        {nugget.tags.length > 0 && (
          <div className="mt-[var(--space-4)] flex flex-wrap gap-1.5">
            {nugget.tags.map((tag) => (
              <Tag key={tag} size="sm">
                {tag}
              </Tag>
            ))}
          </div>
        )}
      </div>

      <NuggetStage rawUrl={rawUrl} title={nugget.title} filename={`${nugget.slug}.html`} />
    </div>
  );
}
