"use client";

import Image from "next/image";
import { useTina, tinaField } from "tinacms/dist/react";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import type { BookQuery } from "../../../../tina/__generated__/types";

const mono = { fontFamily: "var(--font-mono)" };

type LivePerson = { name: string; url?: string | null };

// Same helpers as the server-rendered fallback in page.tsx — duplicated
// rather than shared, matching the existing book-detail convention.
function PersonName({ person }: { person: LivePerson }) {
  if (person.url) {
    return (
      <a href={person.url} target="_blank" rel="noopener noreferrer">
        {person.name}
      </a>
    );
  }
  return <span style={{ color: "var(--text)" }}>{person.name}</span>;
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </>
  );
}

interface ClientBookProps {
  query: string;
  variables: Record<string, unknown>;
  data: BookQuery;
}

/**
 * Client wrapper that drives the book detail page from TinaCMS's live
 * `useTina` data so the preview updates as fields are edited in the admin,
 * and tags each editable element with `data-tina-field` for click-to-edit.
 * Unlike the blog post, this page has no RSC-only body — everything renders
 * from live data here.
 */
export function ClientBook({ query, variables, data }: ClientBookProps) {
  const { data: live } = useTina({ query, variables, data });
  const book = live.book;
  const authors = (book.authors ?? []).filter((a): a is NonNullable<typeof a> => a !== null);
  const reviewers = (book.reviewers ?? []).filter((r): r is NonNullable<typeof r> => r !== null);
  const tableOfContents = (book.tableOfContents ?? []).filter((c): c is NonNullable<typeof c> => c !== null);

  return (
    <>
      <div className="book-hero mt-[var(--space-6)]">
        {book.imgSrc ? (
          <div
            className="flex shrink-0 items-center justify-center self-start overflow-hidden rounded-[var(--radius-md)] shadow-[var(--shadow-lg)]"
            style={{ width: 220, height: 300, background: "#1a1a1a" }}
            data-tina-field={tinaField(book, "imgSrc")}
          >
            <Image
              src={book.imgSrc}
              alt={book.title}
              width={220}
              height={300}
              className="h-auto max-h-[300px] w-auto max-w-[220px] object-contain"
              priority
            />
          </div>
        ) : (
          <div
            className="flex shrink-0 flex-col justify-end box-border p-[22px] shadow-[var(--shadow-lg)]"
            style={{ width: 220, height: 300, borderRadius: "var(--radius-md)", background: "linear-gradient(155deg, var(--accent), var(--current-900))" }}
          >
            <div style={{ ...mono, fontSize: "var(--text-2xs)", letterSpacing: "var(--ls-wide)", color: "rgba(255,255,255,.7)", textTransform: "uppercase" }}>
              {book.publisher || "Book"}
            </div>
            <div className="mt-2" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--fw-bold)", color: "#fff", lineHeight: 1.15, letterSpacing: "var(--ls-tight)" }}>
              {book.title}
            </div>
            <div className="mt-2.5" style={{ ...mono, fontSize: "var(--text-2xs)", color: "rgba(255,255,255,.85)" }}>
              Gordon Beeming
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="eyebrow">Book</div>
          <h1
            className="mt-3"
            style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tighter)", lineHeight: 1.1, color: "var(--text)" }}
            data-tina-field={tinaField(book, "title")}
          >
            {book.title}
          </h1>

          <dl className="book-meta">
            {authors.length > 0 && (
              <MetaRow label={authors.length === 1 ? "Author" : "Authors"}>
                <span data-tina-field={tinaField(book, "authors")}>
                  {authors.map((person, i) => (
                    <span key={person.name}>
                      {i > 0 && ", "}
                      <PersonName person={person} />
                    </span>
                  ))}
                </span>
              </MetaRow>
            )}
            {book.publisher && (
              <MetaRow label="Publisher">
                <span data-tina-field={tinaField(book, "publisher")}>{book.publisher}</span>
              </MetaRow>
            )}
            {book.publishedDate && (
              <MetaRow label="Published">
                <span data-tina-field={tinaField(book, "publishedDate")}>{book.publishedDate}</span>
              </MetaRow>
            )}
            {book.isbn && (
              <MetaRow label="ISBN">
                <span data-tina-field={tinaField(book, "isbn")}>{book.isbn}</span>
              </MetaRow>
            )}
          </dl>

          {book.href && (
            <div className="mt-[var(--space-6)]">
              <Button variant="primary" as="a" href={book.href} data-tina-field={tinaField(book, "href")}>
                Get this book
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="book-body">
        <div>
          {book.overview && (
            <>
              <h2 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tight)", color: "var(--text)" }}>
                Overview
              </h2>
              <div className="prose mt-[var(--space-4)]">
                <p data-tina-field={tinaField(book, "overview")}>{book.overview}</p>
              </div>
            </>
          )}

          {reviewers.length > 0 && (
            <>
              <h2 className="mt-10" style={{ margin: "40px 0 0", fontSize: "var(--text-xl)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tight)", color: "var(--text)" }}>
                Reviewed by
              </h2>
              <div
                className="mt-[var(--space-4)] flex flex-wrap gap-[var(--space-3)]"
                data-tina-field={tinaField(book, "reviewers")}
              >
                {reviewers.map((r) => (
                  <span
                    key={r.name}
                    className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] py-1.5 pl-2 pr-3"
                    style={{ background: "var(--surface)" }}
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full"
                      style={{ ...mono, fontSize: "10px", fontWeight: "var(--fw-bold)", background: "var(--accent)", color: "var(--text-on-accent)" }}
                    >
                      {(r.name || "")
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                    <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                      <PersonName person={r} />
                    </span>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {tableOfContents.length > 0 && (
          <aside>
            <Card padding="lg">
              <div
                className="mb-[var(--space-4)]"
                style={{ ...mono, fontSize: "var(--text-2xs)", letterSpacing: "var(--ls-wider)", textTransform: "uppercase", color: "var(--text-subtle)" }}
              >
                Table of contents
              </div>
              <ol
                className="m-0 flex list-none flex-col gap-[var(--space-3)] p-0"
                style={{ counterReset: "ch" }}
                data-tina-field={tinaField(book, "tableOfContents")}
              >
                {tableOfContents.map((chapter) => (
                  <li key={chapter.title}>
                    <details>
                      <summary className="flex cursor-pointer list-none gap-[var(--space-3)]" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--lh-snug)", color: "var(--text)" }}>
                        <span className="toc-num w-5 shrink-0" style={{ ...mono, fontSize: "var(--text-xs)", color: "var(--accent)" }} />
                        <span style={{ color: "var(--text)", fontWeight: "var(--fw-medium)" }}>{chapter.title}</span>
                      </summary>
                      {chapter.sections && chapter.sections.length > 0 && (
                        <ul
                          className="ml-8 mt-2 flex list-none flex-col gap-1.5 border-l pl-3"
                          style={{ borderColor: "var(--border)" }}
                        >
                          {chapter.sections
                            .filter((s): s is string => typeof s === "string")
                            .map((section) => (
                              <li key={section} style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                                {section}
                              </li>
                            ))}
                        </ul>
                      )}
                    </details>
                  </li>
                ))}
              </ol>
            </Card>
          </aside>
        )}
      </div>
    </>
  );
}
