import Link from "next/link";
import { slug as slugifyTag } from "github-slugger";
import Avatar from "@/components/Avatar";
import { SiteSearch } from "@/components/ui/SiteSearch";
import { SocialIcon } from "@/components/social-icons/SocialIcon";
import { SITE_SOCIAL_LINKS } from "@/lib/social-links";
import { ABOUT_RAIL_BLURB } from "@/lib/site-copy";
import { getAllPosts, getSiteConfig } from "@/lib/tina-helpers";
import { getTagCounts, getTagDisplayNames, getYearCounts } from "@/lib/content";
import styles from "./PageShell.module.css";

// The rail is a curated set, not the full taxonomy: /tags and /years hold
// those. Capping keeps it from outgrowing the column beside it.
const MAX_TAG_PILLS = 11;
const MAX_ARCHIVE_YEARS = 5;

const ui = { fontFamily: "var(--font-ui)" };

function Heading({ children }: { children: React.ReactNode }) {
  return <div className={styles.sectionHeading}>{children}</div>;
}

/**
 * The right-hand rail, in the shape the Sidebar design gives it: About,
 * Archives, Search, Tags, Elsewhere. It reads its own counts from the
 * filesystem the same way the footer reads its own config, so no page has to
 * thread rail data through its props.
 */
export function SiteRail() {
  const posts = getAllPosts();
  const siteConfig = getSiteConfig();
  const yearCounts = getYearCounts(posts);
  const tagCounts = getTagCounts(posts);
  const tagDisplayNames = getTagDisplayNames(posts);

  const recentYears = Object.entries(yearCounts)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .slice(0, MAX_ARCHIVE_YEARS);

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_TAG_PILLS);

  return (
    <aside className={styles.aside}>
      <div className={styles.aboutCard}>
        <Heading>About</Heading>
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
        <Heading>Archives</Heading>
        <div className={styles.archiveList} style={ui}>
          {recentYears.map(([year, count]) => (
            <Link key={year} href={`/years/${year}`} className={styles.archiveRow}>
              <span>{year}</span>
              <span className={styles.archiveCount}>{count}</span>
            </Link>
          ))}
          <Link href="/blog" className={styles.archiveAll}>
            {`All ${posts.length} posts »`}
          </Link>
        </div>
      </div>

      <div>
        <Heading>Search</Heading>
        <SiteSearch />
      </div>

      {topTags.length > 0 && (
        <div>
          <Heading>Tags</Heading>
          <div className={styles.tagCloud}>
            {topTags.map(([tag]) => (
              <Link
                key={tag}
                href={`/tags/${slugifyTag(tag).replace(/--+/g, "-")}`}
                className={styles.chip}
              >
                {tagDisplayNames[tag] ?? tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <Heading>Elsewhere</Heading>
        <div className={styles.elsewhereList} style={ui}>
          {SITE_SOCIAL_LINKS.map(({ kind, configKey }) => {
            const href = siteConfig[configKey];
            if (typeof href !== "string" || href.length === 0) return null;
            return (
              <SocialIcon key={kind} kind={kind} href={href} size={16} variant="muted" />
            );
          })}
        </div>
      </div>
    </aside>
  );
}
