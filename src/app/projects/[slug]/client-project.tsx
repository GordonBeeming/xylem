"use client";

import { useTina, tinaField } from "tinacms/dist/react";
import { Tag } from "@/components/ds/Tag";
import { Badge } from "@/components/ds/Badge";
import { StarCount } from "@/components/ds/StarCount";
import { ProjectVideo } from "@/components/ui/ProjectVideo";
import type { ProjectQuery } from "../../../../tina/__generated__/types";

// Same icon-link markup as the /projects card grid and the server-rendered
// fallback in page.tsx — duplicated rather than shared, matching the
// existing project-detail convention.
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

interface ClientProjectProps {
  query: string;
  variables: Record<string, unknown>;
  data: ProjectQuery;
  githubStars?: number;
}

/**
 * Client wrapper that drives the project header from TinaCMS's live
 * `useTina` data so the preview updates as fields are edited in the admin,
 * and tags each editable element with `data-tina-field` for click-to-edit.
 *
 * `githubStars` isn't a Tina field (it's fetched live from the GitHub API by
 * the server component), so it stays a plain prop rather than coming from
 * `live.project`. The README block is mirrored markdown, not Tina content —
 * it stays outside this component entirely, rendered by page.tsx.
 */
export function ClientProject({ query, variables, data, githubStars }: ClientProjectProps) {
  const { data: live } = useTina({ query, variables, data });
  const project = live.project;
  const techStack = (project.techStack ?? []).filter((t): t is string => t !== null);

  return (
    <>
      <div className="mt-[var(--space-6)] flex items-start justify-between gap-4">
        <div>
          <div className="eyebrow">Project</div>
          <h1
            className="mt-3"
            style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tighter)", color: "var(--text)" }}
            data-tina-field={tinaField(project, "title")}
          >
            {project.title}
          </h1>
        </div>
        {typeof githubStars === "number" && <StarCount n={githubStars} />}
      </div>

      <p
        className="mt-[var(--space-4)] max-w-[var(--width-prose)]"
        style={{ fontSize: "var(--text-md)", lineHeight: "var(--lh-relaxed)", color: "var(--text-muted)" }}
        data-tina-field={tinaField(project, "description")}
      >
        {project.description}
      </p>

      {project.video && (
        <div className="mt-[var(--space-5)]" data-tina-field={tinaField(project, "video")}>
          <ProjectVideo url={project.video} title={project.title} />
        </div>
      )}

      <div className="mt-[var(--space-5)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {project.status && (
            <span data-tina-field={tinaField(project, "status")}>
              <Badge tone={project.status.trim().toLowerCase() === "deprecated" ? "warning" : "accent"}>
                {project.status}
              </Badge>
            </span>
          )}
          <span data-tina-field={tinaField(project, "techStack")} className="flex flex-wrap items-center gap-1.5">
            {techStack.map((tech) => (
              <Tag key={tech} size="sm">
                {tech}
              </Tag>
            ))}
          </span>
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
    </>
  );
}
