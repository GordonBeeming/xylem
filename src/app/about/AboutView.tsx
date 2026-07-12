import Image from "next/image";
import { SocialIcon } from "@/components/social-icons/SocialIcon";
import { SITE_SOCIAL_LINKS } from "@/lib/social-links";
import Avatar from "@/components/Avatar";
import { Card } from "@/components/ds/Card";
import { Button } from "@/components/ds/Button";
import type { AuthorData, SiteConfig } from "@/lib/tina-helpers";

const mono = { fontFamily: "var(--font-mono)" };

/** `data-tina-field` values for the author-doc fields rendered here. Only
 *  present when the live Tina client wrapper (`ClientAuthor`) is rendering —
 *  the plain filesystem render passes no `tinaFields` and gets no attrs. */
export interface AboutTinaFields {
  name?: string;
  avatar?: string;
  profile_line_1?: string;
  profile_line_2?: string;
  company_logo_light?: string;
  company_logo_dark?: string;
  mvp_logo_light?: string;
  mvp_logo_dark?: string;
}

function LogoSlot({
  label,
  lightSrc,
  darkSrc,
  href,
  ratio,
  lightTinaField,
  darkTinaField,
}: {
  label: string;
  lightSrc?: string;
  darkSrc?: string;
  href?: string;
  ratio: number;
  lightTinaField?: string;
  darkTinaField?: string;
}) {
  if (!lightSrc && !darkSrc) return null;
  const inner = (
    <div className="w-full" style={{ aspectRatio: ratio }}>
      {lightSrc && (
        <div className={`relative h-full w-full ${darkSrc ? "dark:hidden" : ""}`} data-tina-field={lightTinaField}>
          <Image src={lightSrc} alt={label} fill className="object-contain" />
        </div>
      )}
      {darkSrc && (
        <div className={`relative h-full w-full ${lightSrc ? "hidden dark:block" : ""}`} data-tina-field={darkTinaField}>
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

/**
 * The /about page body. Shared by the plain filesystem render (`page.tsx`,
 * no Tina server) and the live client wrapper (`client-author.tsx`) so the
 * two paths can't drift — only `tinaFields` differs between them.
 *
 * `author.body` (the bio prose) is rendered from the filesystem markdown
 * string in both paths and is not live-editable: Tina's schema types it as
 * rich-text, and turning that into a live preview needs the same
 * TinaMarkdown template work the blog post body deferred (see
 * `client-post.tsx`). Header/profile fields are simple strings and images,
 * so those are live.
 */
export function AboutView({
  author,
  siteConfig,
  tinaFields,
}: {
  author: AuthorData;
  siteConfig: SiteConfig;
  tinaFields?: AboutTinaFields;
}) {
  const bodyParagraphs = author.body.split("\n\n").filter((p) => p.trim().length > 0);

  return (
    <div className="about-wrap">
      <aside className="about-card">
        <Card padding="lg" className="flex flex-col items-center text-center">
          <div data-tina-field={tinaFields?.avatar}>
            <Avatar
              videoSrc="/static/videos/avatar.mp4"
              fallbackAnimatedWebP="/static/videos/avatar.webp"
              poster={author.avatar || "/static/images/avatar.jpg"}
              alt={author.name}
              size={132}
              ring
            />
          </div>
          <h1
            className="mt-[18px]"
            style={{ fontSize: "var(--text-xl)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tight)", color: "var(--text)" }}
            data-tina-field={tinaFields?.name}
          >
            {author.name}
          </h1>
          {author.profile_line_1 && (
            <div className="mt-1.5" style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }} data-tina-field={tinaFields?.profile_line_1}>
              {author.profile_line_1}
            </div>
          )}
          {author.profile_line_2 && (
            <div
              className="mt-[3px]"
              style={{ ...mono, fontSize: "var(--text-2xs)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-subtle)" }}
              data-tina-field={tinaFields?.profile_line_2}
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
                lightTinaField={tinaFields?.company_logo_light}
                darkTinaField={tinaFields?.company_logo_dark}
              />
              <LogoSlot
                label="Microsoft MVP"
                lightSrc={author.mvp_logo_light}
                darkSrc={author.mvp_logo_dark}
                href={author.mvp_website}
                ratio={751 / 303}
                lightTinaField={tinaFields?.mvp_logo_light}
                darkTinaField={tinaFields?.mvp_logo_dark}
              />
            </div>
          )}

          <div className="h-px w-full" style={{ background: "var(--border)" }} />
          <div className="mt-[var(--space-4)] flex flex-wrap justify-center gap-0.5">
            {SITE_SOCIAL_LINKS.map(({ kind, configKey }) => {
              const href = siteConfig[configKey] as string | undefined;
              if (!href) return null;
              return <SocialIcon key={kind} kind={kind} href={href} size={17} variant="muted" />;
            })}
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
