import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SocialIcon } from "@/components/social-icons/SocialIcon";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";
import { ProjectStarsBadge } from "@/components/ui/ProjectStarsBadge";
import Avatar from "@/components/Avatar";
import type {
  PostMeta,
  ProjectData,
  BookData,
  SiteConfig,
} from "@/lib/tina-helpers";

interface MainProps {
  posts: PostMeta[];
  projects: ProjectData[];
  books: BookData[];
  siteConfig: SiteConfig;
}

const bookColors = [
  "linear-gradient(135deg, var(--color-hero-gradient-start) 0%, var(--color-hero-gradient-mid) 100%)",
  "linear-gradient(135deg, var(--color-brand-accent) 0%, var(--color-hero-gradient-mid) 100%)",
  "linear-gradient(135deg, var(--color-hero-gradient-end) 0%, var(--color-hero-gradient-end) 100%)",
];

type SocialKind =
  | "github"
  | "linkedin"
  | "bluesky"
  | "x"
  | "youtube"
  | "instagram"
  | "threads"
  | "mastodon";

const heroSocialLinks: { key: SocialKind; configKey: keyof SiteConfig }[] = [
  { key: "github", configKey: "github" },
  { key: "linkedin", configKey: "linkedin" },
  { key: "bluesky", configKey: "bluesky" },
  { key: "x", configKey: "twitter" },
  { key: "youtube", configKey: "youtube" },
  { key: "instagram", configKey: "instagram" },
  { key: "threads", configKey: "threads" },
  { key: "mastodon", configKey: "mastodon" },
];

export function Main({ posts, projects, books, siteConfig }: MainProps) {
  return (
    <>
      {/* Hero Section */}
      <section
        className="hero-section relative overflow-hidden px-6 pt-24 pb-32 text-center"
        style={{
          background: "linear-gradient(135deg, var(--color-hero-gradient-start) 0%, var(--color-hero-gradient-mid) 50%, var(--color-hero-gradient-end) 100%)",
        }}
      >
        {/* Radial glow overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, var(--color-hero-radial) 0%, transparent 70%)",
          }}
        />
        {/* Dot pattern */}
        <div
          className="hero-dots pointer-events-none absolute inset-0"
          aria-hidden="true"
        />
        {/* Bottom fade to surface */}
        <div className="absolute right-0 bottom-0 left-0 z-[2] h-12 bg-[linear-gradient(to_bottom,transparent,var(--color-surface-primary))]" />

        <div className="relative z-[3] mx-auto max-w-[720px]">
          {/* Avatar - video with static fallback */}
          <div className="hero-avatar-ring relative mx-auto mb-7 h-[150px] w-[150px]">
            <Avatar
              videoSrc="/static/videos/avatar.mp4"
              fallbackAnimatedWebP="/static/videos/avatar.webp"
              poster="/static/images/avatar.jpg"
              alt="Gordon Beeming"
              size={150}
              className="border-2 border-[var(--color-hero-glow)] shadow-xl"
            />
          </div>

          {/* Name */}
          <h1 className="mb-2 text-5xl font-extrabold tracking-tight text-white max-md:text-[2rem]">
            Gordon Beeming
          </h1>

          {/* Tagline */}
          <p className="mb-7 text-xl text-white/70 max-md:text-base">
            {siteConfig.description.replace(
              /^.*?-\s*/,
              ""
            )}
          </p>

          {/* Social icons */}
          <div className="mb-9 flex items-center justify-center gap-4">
            {heroSocialLinks.map(({ key, configKey }) => {
              const href = siteConfig[configKey] as string | undefined;
              if (!href) return null;
              return (
                <SocialIcon key={key} kind={key} href={href} size={22} />
              );
            })}
          </div>

          {/* Terminal */}
          <div
            className="mx-auto inline-block w-full max-w-[520px] rounded-lg bg-black/25 px-6 py-4 text-left font-mono text-sm"
            style={{
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "var(--color-hero-terminal-border)",
              color: "var(--color-hero-terminal-text)",
            }}
            aria-hidden="true"
          >
            <div>
              <span className="text-white/50">~/gordonbeeming $</span>{" "}
              <span style={{ color: "var(--color-hero-terminal-text)" }}>cat status.txt</span>
            </div>
            <div className="mt-1">
              <span className="hero-typing-text">
                &gt; Currently building awesome things at SSW
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <AnimateOnScroll>
          <h2 className="mb-2 border-l-[3px] border-l-[var(--color-brand-primary)] pl-4 text-[30px] font-extrabold leading-tight text-[var(--color-text-primary)]">
            Latest Posts
          </h2>
          <p className="mb-9 pl-[19px] text-[15px] text-[var(--color-text-secondary)]">
            Thoughts on development, DevOps, and the occasional triathlon
            adventure.
          </p>
        </AnimateOnScroll>

        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {posts.map((post, index) => (
            <AnimateOnScroll key={post.slug} delay={index * 100}>
              <BlogPostCard
                post={{
                  title: post.title,
                  date: post.date,
                  summary: post.summary ?? "",
                  tags: post.tags,
                  slug: post.slug,
                }}
              />
            </AnimateOnScroll>
          ))}
        </div>

        <div className="text-center">
          <Button href="/blog">View All Posts &rarr;</Button>
        </div>
      </section>

      {/* Projects Section */}
      <div className="bg-[var(--color-surface-tertiary)]">
        <section className="mx-auto max-w-7xl px-6 py-16">
          <AnimateOnScroll>
            <h2 className="mb-2 border-l-[3px] border-l-[var(--color-brand-primary)] pl-4 text-[30px] font-extrabold leading-tight text-[var(--color-text-primary)]">
              Projects
            </h2>
            <p className="mb-9 pl-[19px] text-[15px] text-[var(--color-text-secondary)]">
              Open-source tools and side projects I&apos;m working on.
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <AnimateOnScroll key={project.title} delay={index * 100}>
              <Card className="flex flex-col p-6">
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
                    {project.title}
                  </h3>
                  {typeof project.githubStars === "number" && (
                    <ProjectStarsBadge stars={project.githubStars} />
                  )}
                </div>
                <p className="mb-4 grow text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
                  {project.description}
                </p>
                {project.techStack && project.techStack.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="inline-block rounded-full bg-[color-mix(in_srgb,var(--color-brand-accent)_8%,transparent)] px-3 py-1 text-xs font-medium text-[var(--color-brand-accent)]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2.5">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border-default)] px-3.5 py-1.5 text-[13px] font-semibold text-[var(--color-brand-primary)] transition-colors duration-200 hover:border-[var(--color-brand-primary)] hover:bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)]"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      >
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      GitHub
                    </a>
                  )}
                  {project.href && (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border-default)] px-3.5 py-1.5 text-[13px] font-semibold text-[var(--color-brand-primary)] transition-colors duration-200 hover:border-[var(--color-brand-primary)] hover:bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)]"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      >
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      Website
                    </a>
                  )}
                </div>
              </Card>
              </AnimateOnScroll>
            ))}
          </div>
        </section>
      </div>

      {/* Books Section */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <AnimateOnScroll>
          <h2 className="mb-2 border-l-[3px] border-l-[var(--color-brand-primary)] pl-4 text-[30px] font-extrabold leading-tight text-[var(--color-text-primary)]">
            Books I&apos;ve Written
          </h2>
          <p className="mb-9 pl-[19px] text-[15px] text-[var(--color-text-secondary)]">
            Technical books on Microsoft development tools and practices.
          </p>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book, index) => {
            const bgGradient = bookColors[index % bookColors.length];
            return (
              <AnimateOnScroll key={book.title} delay={index * 150}>
              <div className="flex flex-col items-center text-center">
                {book.href ? (
                  <a
                    href={book.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group transition-transform duration-200 hover:scale-[1.02]"
                  >
                    <BookCover title={book.title} bgGradient={bgGradient} />
                  </a>
                ) : (
                  <BookCover title={book.title} bgGradient={bgGradient} />
                )}
                <p className="mt-4 max-w-[240px] text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {book.description}
                </p>
              </div>
              </AnimateOnScroll>
            );
          })}
        </div>
      </section>
    </>
  );
}

function BookCover({
  title,
  bgGradient,
}: {
  title: string;
  bgGradient: string;
}) {
  return (
    <div
      className="relative flex h-[280px] w-[200px] flex-col items-center justify-center rounded-r-xl rounded-l-sm p-6 max-md:h-[250px] max-md:w-[180px]"
      style={{
        background: bgGradient,
        boxShadow: "6px 6px 20px rgba(0,0,0,0.2), 2px 0 0 rgba(0,0,0,0.05) inset",
      }}
    >
      {/* Spine effect */}
      <div className="absolute top-1 bottom-1 left-0 w-1 rounded-r-sm bg-black/10" />
      <div className="text-center text-lg font-extrabold leading-snug text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
        {title}
      </div>
      <div className="mt-3 text-xs text-white/75">Gordon Beeming</div>
    </div>
  );
}
