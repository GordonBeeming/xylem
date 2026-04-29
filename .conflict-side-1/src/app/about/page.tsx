import type { Metadata } from "next";
import Image from "next/image";
import { getAuthor, getSiteConfig } from "@/lib/tina-helpers";
import { SocialIcon } from "@/components/social-icons/SocialIcon";
import Avatar from "@/components/Avatar";

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

type SocialKind =
  | "github"
  | "linkedin"
  | "x"
  | "bluesky"
  | "youtube"
  | "mail";

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

export default function AboutPage() {
  const author = getAuthor("Gordon Beeming");
  const siteConfig = getSiteConfig();

  if (!author) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="text-4xl font-extrabold text-[var(--color-text-primary)]">
          About
        </h1>
        <p className="mt-4 text-[var(--color-text-secondary)]">
          Author information not available.
        </p>
      </div>
    );
  }

  // Parse markdown body into simple HTML paragraphs
  const bodyParagraphs = author.body
    .split("\n\n")
    .filter((p) => p.trim().length > 0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[300px_1fr]">
        {/* Sidebar - Profile Card */}
        <aside className="flex flex-col items-center lg:items-start">
          <div className="w-full rounded-xl bg-[var(--color-surface-secondary)] p-6 shadow-[var(--shadow-card)]">
            {/* Avatar - video with static fallback */}
            <div className="mx-auto mb-4 w-[200px]">
              <Avatar
                videoSrc="/static/videos/avatar.mp4"
                fallbackAnimatedWebP="/static/videos/avatar.webp"
                poster={author.avatar || "/static/images/avatar.jpg"}
                alt={author.name}
                size={200}
              />
            </div>

            {/* Name and profile lines */}
            <h1 className="mb-1 text-center text-2xl font-extrabold text-[var(--color-text-primary)]">
              {author.name}
            </h1>
            {author.profile_line_1 && (
              <p className="text-center text-[15px] text-[var(--color-text-secondary)]">
                {author.profile_line_1}
              </p>
            )}
            {author.profile_line_2 && (
              <p className="mb-4 text-center text-[15px] text-[var(--color-text-tertiary)]">
                {author.profile_line_2}
              </p>
            )}

            {/* Company & MVP logos */}
            <div className="mb-5 flex w-full flex-col gap-4">
              {author.company_name && author.company_website && (
                <a
                  href={author.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full cursor-pointer transition-opacity hover:opacity-80"
                >
                  {author.company_logo_light && (
                    <Image
                      src={author.company_logo_light}
                      alt={author.company_name}
                      width={300}
                      height={80}
                      className="w-full dark:hidden"
                    />
                  )}
                  {author.company_logo_dark && (
                    <Image
                      src={author.company_logo_dark}
                      alt={author.company_name}
                      width={300}
                      height={80}
                      className="hidden w-full dark:block"
                    />
                  )}
                </a>
              )}
              {author.mvp_website && (
                <a
                  href={author.mvp_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full cursor-pointer transition-opacity hover:opacity-80"
                >
                  {author.mvp_logo_light && (
                    <Image
                      src={author.mvp_logo_light}
                      alt="Microsoft MVP"
                      width={300}
                      height={80}
                      className="w-full dark:hidden"
                    />
                  )}
                  {author.mvp_logo_dark && (
                    <Image
                      src={author.mvp_logo_dark}
                      alt="Microsoft MVP"
                      width={300}
                      height={80}
                      className="hidden w-full dark:block"
                    />
                  )}
                </a>
              )}
            </div>

            {/* Social links */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {socialLinks.map(({ kind, authorKey }) => {
                const href = author[authorKey as keyof typeof author] as
                  | string
                  | undefined;
                if (!href) return null;
                const socialHref =
                  kind === "mail" ? `mailto:${href}` : href;
                return (
                  <SocialIcon
                    key={kind}
                    kind={kind}
                    href={socialHref}
                    size={20}
                  />
                );
              })}
              {siteConfig.youtube && (
                <SocialIcon
                  kind="youtube"
                  href={siteConfig.youtube}
                  size={20}
                />
              )}
            </div>
          </div>
        </aside>

        {/* Main content - Bio */}
        <div className="prose prose-lg max-w-none">
          <h2 className="mb-6 border-l-[3px] border-l-[var(--color-brand-primary)] pl-4 text-[30px] font-extrabold leading-tight text-[var(--color-text-primary)]">
            About Me
          </h2>
          <div className="space-y-4 text-[var(--color-text-primary)]">
            {bodyParagraphs.map((paragraph, index) => {
              const trimmed = paragraph.trim();

              // Handle blockquotes
              if (trimmed.startsWith(">")) {
                const quoteText = trimmed.replace(/^>\s*/, "");
                return (
                  <blockquote
                    key={index}
                    className="border-l-4 border-[var(--color-brand-primary)] pl-4 italic text-[var(--color-text-secondary)]"
                  >
                    {quoteText}
                  </blockquote>
                );
              }

              // Handle headings
              if (trimmed.startsWith("## ")) {
                return (
                  <h3
                    key={index}
                    className="mt-8 text-xl font-bold text-[var(--color-text-primary)]"
                  >
                    {trimmed.replace(/^##\s+/, "")}
                  </h3>
                );
              }

              // Regular paragraph with basic markdown link support
              const withLinks = trimmed.replace(
                /\[([^\]]+)\]\(([^)]+)\)/g,
                '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[var(--color-brand-primary)] underline decoration-[var(--color-brand-primary)]/30 hover:decoration-[var(--color-brand-primary)]">$1</a>'
              );

              return (
                <p
                  key={index}
                  className="text-[17px] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: withLinks }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
