"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { Tag } from "@/components/ds/Tag";
import { Badge } from "@/components/ds/Badge";
import { StarCount } from "@/components/ds/StarCount";
import { SocialIcon } from "@/components/social-icons/SocialIcon";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { CommandPalette, type SearchableItem } from "@/components/ui/CommandPalette";
import type { SiteConfig } from "@/lib/tina-helpers";
import { groupFeedByYear, type FeedItem, type FeedItemType } from "@/lib/home-feed";
import styles from "./VesselHome.module.css";

interface VesselHomeProps {
  items: FeedItem[];
  siteConfig: SiteConfig;
}

type FilterKey = "all" | FeedItemType;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "all" },
  { key: "post", label: "posts" },
  { key: "project", label: "projects" },
  { key: "nugget", label: "nuggets" },
  { key: "book", label: "books" },
];

const TYPE_META: Record<FeedItemType, { label: string; dot: string }> = {
  post: { label: "post", dot: "var(--accent)" },
  nugget: { label: "nugget", dot: "var(--secondary)" },
  project: { label: "project", dot: "var(--text-subtle)" },
  book: { label: "book", dot: "var(--text-subtle)" },
};

type SocialKind =
  | "github"
  | "linkedin"
  | "bluesky"
  | "x"
  | "youtube"
  | "instagram"
  | "threads"
  | "mastodon";

const SOCIAL_LINKS: { key: SocialKind; configKey: keyof SiteConfig }[] = [
  { key: "github", configKey: "github" },
  { key: "linkedin", configKey: "linkedin" },
  { key: "bluesky", configKey: "bluesky" },
  { key: "x", configKey: "twitter" },
  { key: "youtube", configKey: "youtube" },
  { key: "instagram", configKey: "instagram" },
  { key: "threads", configKey: "threads" },
  { key: "mastodon", configKey: "mastodon" },
];

const mono = { fontFamily: "var(--font-mono)" };

function TypePill({ type }: { type: FeedItemType }) {
  return (
    <span
      style={mono}
      className="rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--surface-2)] px-[7px] py-[2px] text-[length:var(--text-2xs)] uppercase tracking-[var(--ls-wider)] text-[color:var(--text-muted)]"
    >
      {TYPE_META[type].label}
    </span>
  );
}

function Meta({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={mono}
      className="text-[length:var(--text-xs)] uppercase tracking-[var(--ls-wide)] text-[color:var(--text-subtle)]"
    >
      {children}
    </span>
  );
}

function Node({ item }: { item: FeedItem }) {
  const inner = (
    <>
      <div className="flex flex-wrap items-center gap-[var(--space-3)]">
        <TypePill type={item.type} />
        <Meta>{item.dateDisplay}</Meta>
        {item.readingTime && (
          <>
            <span className="text-[color:var(--text-subtle)] opacity-50">·</span>
            <Meta>{item.readingTime}</Meta>
          </>
        )}
        {typeof item.stars === "number" && <StarCount n={item.stars} />}
        {item.status && <Badge tone="accent">{item.status}</Badge>}
      </div>
      <h3
        className={`${styles.nodeTitle} mt-[10px] text-[length:var(--text-xl)] font-[var(--fw-semibold)] tracking-[var(--ls-tight)] leading-[var(--lh-snug)] text-[color:var(--text)]`}
      >
        {item.title}
      </h3>
      {item.summary && (
        <p className="mt-2 max-w-[var(--width-prose)] text-[length:var(--text-base)] leading-[var(--lh-relaxed)] text-[color:var(--text-muted)]">
          {item.summary}
        </p>
      )}
      {item.tags && item.tags.length > 0 && (
        <div className="mt-[var(--space-4)] flex flex-wrap gap-1.5">
          {item.tags.map((t) => (
            <Tag key={t} size="sm">
              {t}
            </Tag>
          ))}
        </div>
      )}
    </>
  );

  const className = `${styles.node} relative block pb-[var(--space-8)] no-underline`;
  const dotStyle: React.CSSProperties = {
    position: "absolute",
    left: "calc(-1 * var(--space-6) - 5px)",
    top: 6,
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: TYPE_META[item.type].dot,
    boxShadow: "0 0 0 4px var(--bg)",
    transition: "var(--transition-transform)",
  };

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
        <span className={styles.nodeDot} style={dotStyle} aria-hidden="true" />
        {inner}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className}>
      <span className={styles.nodeDot} style={dotStyle} aria-hidden="true" />
      {inner}
    </Link>
  );
}

function YearBlock({ year, items, idx }: { year: number; items: FeedItem[]; idx: number }) {
  const fade = Math.max(0.32, 1 - Math.min(idx, 5) * ((1 - 0.32) / 5));
  return (
    <div
      className="grid gap-[var(--space-8)]"
      style={{ gridTemplateColumns: "var(--year-col) 1fr" }}
    >
      <div
        className={styles.yearNum}
        style={{
          fontSize: "var(--text-3xl)",
          fontWeight: "var(--fw-bold)",
          letterSpacing: "var(--ls-tighter)",
          color: "var(--text)",
          opacity: fade,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}
      >
        {year}
      </div>
      <div className="border-l-2 border-[var(--border)] pt-0.5 pl-[var(--space-6)]">
        {items.map((item) => (
          <Node key={item.key} item={item} />
        ))}
      </div>
    </div>
  );
}

function VesselSearchButton() {
  const { isOpen, open, close } = useCommandPalette();
  const [items, setItems] = useState<SearchableItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen || loaded) return;
    let cancelled = false;
    fetch("/search-index.json")
      .then((res) => res.json())
      .then((data: SearchableItem[]) => {
        if (!cancelled) {
          setItems(data);
          setLoaded(true);
        }
      })
      .catch((err) => {
        console.error("Failed to load search index:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, loaded]);

  return (
    <>
      <button
        onClick={open}
        style={mono}
        className={`${styles.searchBtn} flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[length:var(--text-sm)] text-[color:var(--text-muted)] transition-[var(--transition-colors)]`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width={15}
          height={15}
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className={styles.searchBtnLabel}>Search everything</span>
        <kbd className="rounded-[var(--radius-xs)] border border-[var(--border-strong)] px-[6px] py-[1px] text-[length:var(--text-2xs)]">
          ⌘K
        </kbd>
      </button>
      <CommandPalette isOpen={isOpen} onClose={close} items={items} />
    </>
  );
}

export function VesselHome({ items, siteConfig }: VesselHomeProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [visibleYears, setVisibleYears] = useState(2);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = { all: items.length, post: 0, nugget: 0, project: 0, book: 0 };
    for (const item of items) c[item.type] += 1;
    return c;
  }, [items]);

  const groups = useMemo(() => {
    const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);
    return groupFeedByYear(filtered);
  }, [items, filter]);

  useEffect(() => {
    setVisibleYears(2);
  }, [filter]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleYears((n) => (n < groups.length ? n + 2 : n));
        }
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [groups.length]);

  const shown = groups.slice(0, visibleYears);
  const more = visibleYears < groups.length;
  const bio = siteConfig.description.replace(/^.*?-\s*/, "");
  const earliestYear = groups.length > 0 ? groups[groups.length - 1].year : null;

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <header className={styles.vhead}>
          <Link href="/about" className="flex items-center gap-[var(--space-5)] no-underline">
            <Avatar
              videoSrc="/static/videos/avatar.mp4"
              fallbackAnimatedWebP="/static/videos/avatar.webp"
              poster="/static/images/avatar.jpg"
              alt="Gordon Beeming"
              size={54}
              ring
            />
            <div>
              <div className="flex items-center gap-[var(--space-3)] text-[length:var(--text-lg)] font-[var(--fw-bold)] tracking-[var(--ls-tight)] text-[color:var(--text)]">
                <span style={{ color: "var(--accent)" }}>xylem</span>
                <span className="h-3.5 w-[1.5px] bg-[var(--border-strong)]" />
                <span className="font-[var(--fw-semibold)]">Gordon Beeming</span>
              </div>
              <div style={mono} className="mt-1 text-[length:var(--text-xs)] text-[color:var(--text-muted)]">
                {bio}
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-[var(--space-3)]">
            <VesselSearchButton />
          </div>
        </header>

        <div className={styles.vfilters}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  ...mono,
                  background: active ? "var(--accent)" : "transparent",
                  color: active ? "var(--text-on-accent)" : "var(--text-muted)",
                  border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
                }}
                className="cursor-pointer rounded-[var(--radius-md)] px-[13px] py-[6px] text-[length:var(--text-xs)] tracking-[var(--ls-wide)] transition-[var(--transition-colors)]"
              >
                {f.label}{" "}
                <span style={{ opacity: active ? 0.8 : 0.55, marginLeft: 2 }}>{counts[f.key]}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.vessel}>
          {shown.map((g, gi) => (
            <YearBlock key={g.year} year={g.year} items={g.items} idx={gi} />
          ))}
        </div>

        <div ref={sentinelRef} className="h-px" />
        <div className="grid gap-[var(--space-8)]" style={{ gridTemplateColumns: "var(--year-col) 1fr" }}>
          <div />
          <div className="border-l-2 border-transparent pl-[var(--space-6)]">
            {more ? (
              <div
                style={mono}
                className="py-2 pb-[var(--space-10)] text-[length:var(--text-xs)] tracking-[var(--ls-wide)] text-[color:var(--text-subtle)]"
              >
                <span className={styles.pulseDot} /> loading earlier years…
              </div>
            ) : (
              <div
                style={mono}
                className="flex items-center gap-[var(--space-4)] py-2 pb-[var(--space-10)] text-[length:var(--text-xs)] tracking-[var(--ls-wide)] text-[color:var(--text-subtle)]"
              >
                <span className="h-2.5 w-2.5 rounded-full border-2 border-[var(--border-strong)]" />
                {earliestYear ? `that's where it began — ${earliestYear}.` : "nothing here yet."}
              </div>
            )}
          </div>
        </div>

        <footer className={styles.vfoot}>
          <span style={mono} className="text-[11px] tracking-[0.03em] text-[color:var(--text-subtle)]">
            © {new Date().getUTCFullYear() >= 2026 ? new Date().getUTCFullYear() : 2026} Gordon Beeming · Opinions are my own.
          </span>
          <div className="flex items-center gap-[var(--space-4)]">
            {SOCIAL_LINKS.map(({ key, configKey }) => {
              const href = siteConfig[configKey] as string | undefined;
              if (!href) return null;
              return <SocialIcon key={key} kind={key} href={href} size={17} variant="muted" />;
            })}
          </div>
        </footer>
      </div>
    </div>
  );
}
