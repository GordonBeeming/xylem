import type { Metadata } from "next";
import { getAllProjects } from "@/lib/tina-helpers";
import { enrichProjectsWithStars } from "@/lib/github-stars";
import { Card } from "@/components/ui/Card";
import { ProjectStarsBadge } from "@/components/ui/ProjectStarsBadge";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Open-source tools and side projects by Gordon Beeming.",
  openGraph: {
    title: "Projects | Gordon Beeming",
    description: "Open-source tools and side projects by Gordon Beeming.",
  },
};

export default async function ProjectsPage() {
  const projects = await enrichProjectsWithStars(getAllProjects());

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      {/* Page hero */}
      <div className="mb-10">
        <h1 className="mb-2 border-l-[3px] border-l-[#0063B2] pl-4 text-[30px] font-extrabold leading-tight text-[var(--color-text-primary)] md:text-4xl">
          Projects
        </h1>
        <p className="pl-[19px] text-[15px] text-[var(--color-text-secondary)]">
          Open-source tools and side projects I&apos;m working on.
        </p>
      </div>

      {/* Projects grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.title} className="flex flex-col p-6" hoverable>
            <div className="mb-3 flex items-start justify-between">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                {project.title}
              </h2>
              {typeof project.githubStars === "number" && (
                <ProjectStarsBadge stars={project.githubStars} />
              )}
            </div>
            <p className="mb-4 grow text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
              {project.description}
            </p>

            {/* Tech stack pills */}
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

            {/* Links */}
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
        ))}
      </div>

      {projects.length === 0 && (
        <p className="text-center text-[var(--color-text-secondary)]">
          No projects found.
        </p>
      )}
    </div>
  );
}
