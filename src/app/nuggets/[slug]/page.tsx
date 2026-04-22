import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllNuggets, getNugget } from "@/lib/nuggets";
import { NuggetFrame } from "@/components/NuggetFrame";
import { formatDate } from "@/lib/content";

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

export default async function NuggetPage(props: PageProps) {
  const { slug } = await props.params;
  const nugget = getNugget(slug);

  if (nugget === null) {
    notFound();
  }

  const rawUrl = `/nuggets/${nugget.slug}.html`;

  return (
    <article className="pb-12">
      <header className="mx-auto max-w-3xl px-4 pb-6 pt-10 sm:px-6">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-[13px] uppercase tracking-wide text-[var(--color-text-secondary)]">
          <Link
            href="/nuggets"
            className="text-[var(--color-brand-primary)] no-underline hover:underline"
          >
            ← All nuggets
          </Link>
          <span aria-hidden="true">·</span>
          <time dateTime={nugget.date} style={{ fontFamily: "var(--font-mono)" }}>
            {formatDate(nugget.date)}
          </time>
          <span aria-hidden="true">·</span>
          <a
            href={rawUrl}
            className="text-[var(--color-brand-primary)] no-underline hover:underline"
            target="_blank"
            rel="noopener"
          >
            Open raw ↗
          </a>
        </div>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
          {nugget.title}
        </h1>
        {nugget.summary && (
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
            {nugget.summary}
          </p>
        )}
      </header>
      <div className="border-y border-[var(--color-border)]">
        <NuggetFrame src={rawUrl} title={nugget.title} />
      </div>
    </article>
  );
}
