import Link from "next/link";
import { Tag } from "@/components/ds/Tag";

interface PostListItemProps {
  href: string;
  date: string;
  title: string;
  summary?: string;
  tags?: string[];
  readingTime?: string;
  extraTags?: number;
}

/** Xylem PostListItem — a post row for listing pages (year-grouped archive, tag/year pages). */
export function PostListItem({
  href,
  date,
  title,
  summary,
  tags = [],
  readingTime,
  extraTags = 0,
}: PostListItemProps) {
  return (
    <Link
      href={href}
      className="group block border-b border-[var(--border)] py-[var(--space-5)] text-[color:var(--text)] no-underline"
    >
      <div
        className="flex items-center gap-[var(--space-3)] text-[length:var(--text-xs)] uppercase tracking-[var(--ls-wide)] text-[color:var(--text-muted)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <span>{date}</span>
        {readingTime && (
          <>
            <span className="opacity-40">·</span>
            <span>{readingTime}</span>
          </>
        )}
      </div>
      <h3 className="mt-2 break-words text-[length:var(--text-lg)] font-[var(--fw-semibold)] leading-[var(--lh-snug)] tracking-[var(--ls-tight)] text-[color:var(--text)] transition-[var(--transition-colors)] group-hover:text-[color:var(--link)]">
        {title}
      </h3>
      {summary && (
        <p className="mt-2 max-w-[var(--width-prose)] break-words text-[length:var(--text-base)] leading-[var(--lh-relaxed)] text-[color:var(--text-muted)]">
          {summary}
        </p>
      )}
      {(tags.length > 0 || extraTags > 0) && (
        <div className="mt-[var(--space-4)] flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <Tag key={t} size="sm">
              {t}
            </Tag>
          ))}
          {extraTags > 0 && (
            <span
              className="self-center text-[length:var(--text-2xs)] tracking-[var(--ls-wide)] text-[color:var(--text-subtle)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              +{extraTags} more
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
