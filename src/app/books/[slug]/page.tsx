import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAllBooks, getBook } from "@/lib/tina-helpers";
import type { BookPerson } from "@/lib/tina-helpers";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const books = getAllBooks();
  return books.map((book) => ({
    slug: book.slug,
  }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const book = getBook(slug);

  if (!book) {
    return { title: "Book Not Found" };
  }

  const url = `https://gordonbeeming.com/books/${slug}`;

  return {
    title: `${book.title} - Gordon Beeming`,
    description: book.overview ?? book.description,
    openGraph: {
      title: book.title,
      description: book.overview ?? book.description,
      url,
      type: "website",
      images: book.imgSrc
        ? [
            {
              url: `https://gordonbeeming.com${book.imgSrc}`,
              alt: book.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary",
      title: book.title,
      description: book.overview ?? book.description,
      creator: "@GordonBeeming",
    },
    alternates: {
      canonical: url,
    },
  };
}

function PersonName({ person }: { person: BookPerson }) {
  if (person.url) {
    return (
      <a
        href={person.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--color-brand-primary)] underline decoration-[var(--color-brand-primary)]/30 transition-colors hover:decoration-[var(--color-brand-primary)]"
      >
        {person.name}
      </a>
    );
  }
  return <span className="text-[var(--color-text-primary)]">{person.name}</span>;
}


export default async function BookPage(props: PageProps) {
  const { slug } = await props.params;
  const book = getBook(slug);

  if (!book) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link
        href="/#books"
        className="mb-8 inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-brand-primary)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Books
      </Link>

      <div className="flex flex-col gap-10 md:flex-row">
        {/* Book cover */}
        {book.imgSrc && (
          <div className="shrink-0 self-start">
            <Image
              src={book.imgSrc}
              alt={book.title}
              width={280}
              height={362}
              className="h-auto w-[280px] rounded-lg shadow-lg"
              priority
            />
          </div>
        )}

        {/* Book info */}
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold leading-tight text-[var(--color-text-primary)]">
            {book.title}
          </h1>

          {/* Meta details */}
          <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {book.authors && book.authors.length > 0 && (
              <>
                <dt className="font-semibold text-[var(--color-text-secondary)]">
                  {book.authors.length === 1 ? "Author" : "Authors"}
                </dt>
                <dd>
                  {book.authors.map((person, i) => (
                    <span key={person.name}>
                      {i > 0 && ", "}
                      <PersonName person={person} />
                    </span>
                  ))}
                </dd>
              </>
            )}
            {book.reviewers && book.reviewers.length > 0 && (
              <>
                <dt className="font-semibold text-[var(--color-text-secondary)]">
                  Reviewers
                </dt>
                <dd>
                  {book.reviewers.map((person, i) => (
                    <span key={person.name}>
                      {i > 0 && ", "}
                      <PersonName person={person} />
                    </span>
                  ))}
                </dd>
              </>
            )}
            {book.publisher && (
              <>
                <dt className="font-semibold text-[var(--color-text-secondary)]">
                  Publisher
                </dt>
                <dd className="text-[var(--color-text-primary)]">
                  {book.publisher}
                </dd>
              </>
            )}
            {book.publishedDate && (
              <>
                <dt className="font-semibold text-[var(--color-text-secondary)]">
                  Published
                </dt>
                <dd className="text-[var(--color-text-primary)]">
                  {book.publishedDate}
                </dd>
              </>
            )}
            {book.isbn && (
              <>
                <dt className="font-semibold text-[var(--color-text-secondary)]">
                  ISBN
                </dt>
                <dd className="text-[var(--color-text-primary)]">
                  {book.isbn}
                </dd>
              </>
            )}
          </dl>

          {/* Overview */}
          {book.overview && (
            <p className="mt-6 leading-relaxed text-[var(--color-text-secondary)]">
              {book.overview}
            </p>
          )}

          {/* Purchase link */}
          {book.href && (
            <a
              href={book.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Get this book
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Table of Contents */}
      {book.tableOfContents && book.tableOfContents.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 border-l-[3px] border-l-[var(--color-brand-primary)] pl-4 text-2xl font-extrabold text-[var(--color-text-primary)]">
            Table of Contents
          </h2>
          <div className="space-y-4">
            {book.tableOfContents.map((chapter) => (
              <details
                key={chapter.title}
                className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <summary className="cursor-pointer font-semibold text-[var(--color-text-primary)] select-none">
                  {chapter.title}
                </summary>
                {chapter.sections.length > 0 && (
                  <ul className="mt-3 space-y-1 border-l-2 border-[var(--color-border)] pl-4">
                    {chapter.sections.map((section) => (
                      <li
                        key={section}
                        className="text-sm text-[var(--color-text-secondary)]"
                      >
                        {section}
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
