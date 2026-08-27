import Link from "next/link";
import type { PostMeta, ProjectData, BookData, SiteConfig } from "@/lib/tina-helpers";
import { formatDateShort, postHref } from "@/lib/content";
import { PostListItem } from "@/components/ds/PostListItem";
import { Tag } from "@/components/ds/Tag";
import { Badge } from "@/components/ds/Badge";
import Avatar from "@/components/Avatar";
import { SITE_SOCIAL_LINKS } from "@/lib/social-links";
import { HOME_INTRO_PARAGRAPH, ABOUT_RAIL_BLURB } from "@/lib/site-copy";
import styles from "./SidebarHome.module.css";

/** Everything the home page needs, computed once on the server from the
 *  filesystem (`getAllPosts`/`getAllProjects`/`getAllBooks`/`getYearCounts`/
 *  `getTagCounts`) so this component never has to guess at a count. */
export interface HomeData {
  totalPostCount: number;
  recentPosts: PostMeta[];
  /** Already capped to the "recent" subset shown here (see page.tsx) — the
   *  full list lives at /projects, linked below the grid. */
  projects: ProjectData[];
  books: BookData[];
  yearCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  tagDisplayNames: Record<string, string>;
}

/** `data-tina-field` values for the siteConfig fields rendered here. Only
 *  present when the live Tina client wrapper (`client-home.tsx`) is
 *  rendering — the plain filesystem render passes none and gets no attrs. */
interface HomeTinaFields {
  github?: string;
  linkedin?: string;
  youtube?: string;
}

interface SidebarHomeProps {
  homeData: HomeData;
  siteConfig: SiteConfig;
  tinaFields?: HomeTinaFields;
}

const ui = { fontFamily: "var(--font-ui)" };

// The Tags rail is a curated cloud, not the full taxonomy (that's /tags) —
// capped so a long-tail tag doesn't push the rail past the main column.
const MAX_TAG_PILLS = 20;
// Archives shows the most recent years inline; older years are one click
// away via the "All N posts" link rather than listed exhaustively.
const MAX_ARCHIVE_YEARS = 5;

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <div className={styles.sectionHeading}>{children}</div>;
}

function ProjectCell({ project }: { project: ProjectData }) {
  return (
    <div className={styles.projectCell}>
      <div className={styles.projectHead}>
        <Link href={`/projects/${project.slug}`} className={styles.projectTitle}>
          {project.title}
        </Link>
        {project.techStack && project.techStack.length > 0 && (
          <span className={styles.projectMeta} style={ui}>
            {project.techStack.join(" · ")}
          </span>
        )}
        {project.status && <Badge tone="neutral">{project.status}</Badge>}
      </div>
      <p className={styles.projectDesc}>{project.description}</p>
    </div>
  );
}

function BookRow({ book }: { book: BookData }) {
  const metaLine = [book.publishedDate, book.publisher].filter(Boolean).join(" · ");
  return (
    <div>
      {metaLine && (
        <div className={styles.bookMeta} style={ui}>
          {metaLine}
        </div>
      )}
      {book.href ? (
        <a href={book.href} target="_blank" rel="noopener noreferrer" className={styles.bookTitle}>
          {book.title}
        </a>
      ) : (
        <span className={styles.bookTitle}>{book.title}</span>
      )}
    </div>
  );
}

export function SidebarHome({ homeData, siteConfig, tinaFields }: SidebarHomeProps) {
  const { totalPostCount, recentPosts, projects, books, yearCounts, tagCounts, tagDisplayNames } = homeData;

  const years = Object.entries(yearCounts).sort(([a], [b]) => Number(b) - Number(a));
  const recentYears = years.slice(0, MAX_ARCHIVE_YEARS);

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, MAX_TAG_PILLS);

  return (
    <div className={styles.wrap}>
      <div className={styles.well}>
        <div className={styles.shell}>
          <div className={styles.main}>
            <p className={styles.intro}>{HOME_INTRO_PARAGRAPH}</p>
            <div className={styles.rule} />

            <SectionHeading>Recent writing</SectionHeading>
            <div className={styles.postList}>
              {recentPosts.map((post) => (
                <PostListItem
                  key={post.slug}
                  href={postHref(post.slug)}
                  date={formatDateShort(post.date)}
                  readingTime={post.readingTime.text}
                  title={post.title}
                  summary={post.summary ?? ""}
                  tags={post.tags.slice(0, 3)}
                  extraTags={Math.max(0, post.tags.length - 3)}
                />
              ))}
            </div>
            <p className={styles.olderLink} style={ui}>
              <Link href="/blog">Older posts &raquo;</Link>
            </p>

            {projects.length > 0 && (
              <>
                <div className={styles.rule} />
                <SectionHeading>Projects</SectionHeading>
                <div className={styles.projectGrid}>
                  {projects.map((project) => (
                    <ProjectCell key={project.slug} project={project} />
                  ))}
                </div>
                <p className={styles.olderLink} style={ui}>
                  <Link href="/projects">All projects &raquo;</Link>
                </p>
              </>
            )}

            {books.length > 0 && (
              <>
                <div className={styles.rule} />
                <SectionHeading>Books</SectionHeading>
                <div className={styles.bookList}>
                  {books.map((book) => (
                    <BookRow key={book.slug} book={book} />
                  ))}
                </div>
              </>
            )}
          </div>

          <aside className={styles.aside}>
            <div className={styles.aboutCard}>
              <SectionHeading>About</SectionHeading>
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

            <div>
              <SectionHeading>Archives</SectionHeading>
              <div className={styles.archiveList} style={ui}>
                {recentYears.map(([year, count]) => (
                  <Link key={year} href={`/years/${year}`} className={styles.archiveRow}>
                    <span>{year}</span>
                    <span className={styles.archiveCount}>{count}</span>
                  </Link>
                ))}
                <Link href="/blog" className={styles.archiveAll}>
                  {`All ${totalPostCount} posts \u00BB`}
                </Link>
              </div>
            </div>

            {topTags.length > 0 && (
              <div>
                <SectionHeading>Tags</SectionHeading>
                <div className={styles.tagCloud}>
                  {topTags.map(([tag]) => (
                    <Tag key={tag} as="a" href={`/tags/${tag}`} size="sm">
                      {tagDisplayNames[tag] ?? tag}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            <div>
              <SectionHeading>Elsewhere</SectionHeading>
              <div className={styles.elsewhereList} style={ui}>
                {SITE_SOCIAL_LINKS.map(({ kind, configKey }) => {
                  const href = siteConfig[configKey] as string | undefined;
                  if (!href) return null;
                  const field = tinaFields?.[configKey as keyof HomeTinaFields];
                  const label = kind === "github" ? "GitHub" : kind === "linkedin" ? "LinkedIn" : "YouTube";
                  return (
                    <a
                      key={kind}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.elsewhereLink}
                      data-tina-field={field}
                    >
                      {label}
                    </a>
                  );
                })}
                <a href="/feed.xml" className={styles.elsewhereLink}>
                  RSS feed
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
