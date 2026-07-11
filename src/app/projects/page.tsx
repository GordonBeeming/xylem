import type { Metadata } from "next";
import Link from "next/link";
import { getAllProjects, type ProjectData } from "@/lib/tina-helpers";
import { enrichProjectsWithStars } from "@/lib/github-stars";
import { Card } from "@/components/ds/Card";
import { Tag } from "@/components/ds/Tag";
import { Badge } from "@/components/ds/Badge";
import { StarCount } from "@/components/ds/StarCount";
import { ProjectVideo } from "@/components/ui/ProjectVideo";

export const metadata: Metadata = {
  title: "Projects",
  description: "Open-source tools and side projects by Gordon Beeming.",
  openGraph: {
    title: "Projects | Gordon Beeming",
    description: "Open-source tools and side projects by Gordon Beeming.",
  },
};

const mono = { fontFamily: "var(--font-mono)" };

// Group projects by lifecycle before ordering by popularity: live projects
// first, then private previews, then deprecated ones at the bottom.
function statusTier(status?: string): number {
  const normalized = status?.trim().toLowerCase();
  if (!normalized) return 0;
  return normalized === "deprecated" ? 2 : 1;
}

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--text-muted)] transition-[var(--transition-colors)] hover:bg-[var(--surface-2)] hover:text-[color:var(--accent)]"
    >
      {children}
    </a>
  );
}

function ProjectCard({ project }: { project: ProjectData }) {
  const featured = Boolean(project.featured);
  return (
    <Card padding="lg" className={`flex flex-col ${featured ? "lg:col-span-3" : "lg:col-span-2"}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-[var(--space-3)]">
          {/* Title is the card's primary link; IconLinks below stay as sibling anchors (no nesting). */}
          <Link
            href={`/projects/${project.slug}`}
            className="hover:underline"
            style={{ ...mono, fontSize: featured ? "var(--text-lg)" : "var(--text-base)", fontWeight: "var(--fw-semibold)", color: "var(--text)" }}
          >
            {project.title}
          </Link>
          {featured && <Badge tone="accent">Featured</Badge>}
        </div>
        {typeof project.githubStars === "number" && <StarCount n={project.githubStars} />}
      </div>

      <p
        className="mt-2.5 flex-1"
        style={{ fontSize: "var(--text-sm)", lineHeight: "var(--lh-relaxed)", color: "var(--text-muted)", maxWidth: featured ? "60ch" : "none" }}
      >
        {project.description}
      </p>

      {project.video && (
        <div className="mt-4">
          <ProjectVideo url={project.video} title={project.title} />
        </div>
      )}

      <div className="mt-[var(--space-5)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {project.status && (
            <Badge tone={project.status.trim().toLowerCase() === "deprecated" ? "warning" : "accent"}>
              {project.status}
            </Badge>
          )}
          {(project.techStack ?? []).map((tech) => (
            <Tag key={tech} size="sm">
              {tech}
            </Tag>
          ))}
        </div>
        <div className="-mr-2 flex items-center gap-0.5">
          {project.github && (
            <IconLink href={project.github} label="GitHub repository">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </IconLink>
          )}
          {project.href && project.href !== project.github && (
            <IconLink href={project.href} label="Website">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </IconLink>
          )}
          {project.appStore && (
            <IconLink href={project.appStore} label="App Store">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.1l.01-.02zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
            </IconLink>
          )}
        </div>
      </div>
    </Card>
  );
}

export default async function ProjectsPage() {
  const projects = (await enrichProjectsWithStars(getAllProjects())).sort((a, b) => {
    const featured = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    if (featured !== 0) return featured;
    const tier = statusTier(a.status) - statusTier(b.status);
    if (tier !== 0) return tier;
    const stars = (b.githubStars ?? 0) - (a.githubStars ?? 0);
    if (stars !== 0) return stars;
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="page">
      <div className="eyebrow">Projects</div>
      <h1
        className="mt-3"
        style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tighter)", color: "var(--text)" }}
      >
        Things I&apos;ve built
      </h1>
      <p
        className="mt-2.5 max-w-[var(--width-prose)]"
        style={{ fontSize: "var(--text-md)", color: "var(--text-muted)", lineHeight: "var(--lh-relaxed)" }}
      >
        Developer tools, macOS utilities, and open source — mostly born from scratching my
        own itch. Star counts are live from GitHub.
      </p>

      {projects.length === 0 ? (
        <p className="mt-10 text-center" style={{ color: "var(--text-subtle)" }}>
          No projects found.
        </p>
      ) : (
        <div className="projects-grid mt-[var(--space-10)] grid grid-cols-1 gap-[var(--space-5)] sm:grid-cols-2 lg:grid-cols-6">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
