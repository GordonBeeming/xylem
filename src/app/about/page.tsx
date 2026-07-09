import type { Metadata } from "next";
import Image from "next/image";
import { getAuthor, getSiteConfig } from "@/lib/tina-helpers";
import { SocialIcon } from "@/components/social-icons/SocialIcon";
import Avatar from "@/components/Avatar";
import { Card } from "@/components/ds/Card";
import { Button } from "@/components/ds/Button";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Gordon Beeming - Solution Architect at SSW, Microsoft MVP, and triathlete.",
  openGraph: {
    title: "About | Gordon Beeming",
    description:
      "About Gordon Beeming - Solution Architect at SSW, Microsoft MVP, and triathlete.",
  },
};

type SocialKind = "github" | "linkedin" | "x" | "bluesky" | "youtube" | "mail";

interface SocialLinkConfig {
  kind: SocialKind;
  authorKey: string;
}

const socialLinks: SocialLinkConfig[] = [
  { kind: "github", authorKey: "github" },
  { kind: "linkedin", authorKey: "linkedin" },
  { kind: "x", authorKey: "twitter" },
  { kind: "bluesky", authorKey: "bluesky" },
  { kind: "mail", authorKey: "email" },
];

const mono = { fontFamily: "var(--font-mono)" };

function LogoSlot({ label, lightSrc, darkSrc, href, ratio }: { label: string; lightSrc?: string; darkSrc?: string; href?: string; ratio: number }) {
  if (!lightSrc && !darkSrc) return null;
  const inner = (
    <div className="w-full" style={{ aspectRatio: ratio }}>
      {lightSrc && (
        <div className="relative h-full w-full dark:hidden">
          <Image src={lightSrc} alt={label} fill className="object-contain" />
        </div>
      )}
      {darkSrc && (
        <div className="relative hidden h-full w-full dark:block">
          <Image src={darkSrc} alt={label} fill className="object-contain" />
        </div>
      )}
    </div>
  );
  if (!href) return inner;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block w-full transition-opacity hover:opacity-80">
      {inner}
    </a>
  );
}

export default function AboutPage() {
  const author = getAuthor("Gordon Beeming");
  const siteConfig = getSiteConfig();

  if (!author) {
    return (
      <div className="page-narrow">
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--fw-bold)", color: "var(--text)" }}>About</h1>
        <p className="mt-4" style={{ color: "var(--text-muted)" }}>
          Author information not available.
        </p>
      </div>
    );
  }

  const bodyParagraphs = author.body.split("\n\n").filter((p) => p.trim().length > 0);

  return (
    <div className="about-wrap">
      <aside className="about-card">
        <Card padding="lg" className="flex flex-col items-center text-center">
          <Avatar
            videoSrc="/static/videos/avatar.mp4"
            fallbackAnimatedWebP="/static/videos/avatar.webp"
            poster={author.avatar || "/static/images/avatar.jpg"}
            alt={author.name}
            size={132}
            ring
          />
          <h1
            className="mt-[18px]"
            style={{ fontSize: "var(--text-xl)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tight)", color: "var(--text)" }}
          >
            {author.name}
          </h1>
          {author.profile_line_1 && (
            <div className="mt-1.5" style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
              {author.profile_line_1}
            </div>
          )}
          {author.profile_line_2 && (
            <div
              className="mt-[3px]"
              style={{ ...mono, fontSize: "var(--text-2xs)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-subtle)" }}
            >
              {author.profile_line_2}
            </div>
          )}

          {(author.company_logo_light || author.mvp_logo_light) && (
            <div className="my-[var(--space-6)] flex w-full flex-col gap-[var(--space-6)]">
              <LogoSlot
                label={author.company_name || "Company"}
                lightSrc={author.company_logo_light}
                darkSrc={author.company_logo_dark}
                href={author.company_website}
                ratio={1000 / 600}
              />
              <LogoSlot
                label="Microsoft MVP"
                lightSrc={author.mvp_logo_light}
                darkSrc={author.mvp_logo_dark}
                href={author.mvp_website}
                ratio={751 / 303}
              />
            </div>
          )}

          <div className="h-px w-full" style={{ background: "var(--border)" }} />
          <div className="mt-[var(--space-4)] flex flex-wrap justify-center gap-0.5">
            {socialLinks.map(({ kind, authorKey }) => {
              const href = author[authorKey as keyof typeof author] as string | undefined;
              if (!href) return null;
              return <SocialIcon key={kind} kind={kind} href={kind === "mail" ? `mailto:${href}` : href} size={17} variant="muted" />;
            })}
            {siteConfig.youtube && <SocialIcon kind="youtube" href={siteConfig.youtube} size={17} variant="muted" />}
          </div>
        </Card>
      </aside>

      <main>
        <div className="eyebrow">About</div>
        <h2
          className="mt-3"
          style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tighter)", color: "var(--text)" }}
        >
          Hi, I&apos;m Gordon Beeming.
        </h2>
        <div className="prose mt-[var(--space-6)]">
          {bodyParagraphs.map((paragraph, index) => {
            const trimmed = paragraph.trim();

            if (trimmed.startsWith(">")) {
              return <blockquote key={index}>{trimmed.replace(/^>\s*/, "")}</blockquote>;
            }

            if (trimmed.startsWith("## ")) {
              return <h3 key={index}>{trimmed.replace(/^##\s+/, "")}</h3>;
            }

            const withLinks = trimmed.replace(
              /\[([^\]]+)\]\(([^)]+)\)/g,
              '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
            );
            return <p key={index} dangerouslySetInnerHTML={{ __html: withLinks }} />;
          })}
        </div>
        <div className="mt-[var(--space-8)] flex flex-wrap gap-[var(--space-3)]">
          {siteConfig.buymeacoffee && (
            <Button variant="secondary" as="a" href={siteConfig.buymeacoffee}>
              Buy me a coffee
            </Button>
          )}
          {siteConfig.githubsponsors && (
            <Button variant="ghost" as="a" href={siteConfig.githubsponsors}>
              Sponsor on GitHub →
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
