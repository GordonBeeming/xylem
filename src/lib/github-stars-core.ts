/** Extract the GitHub owner/repo from a GitHub URL. */
export function parseGitHubRepo(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return `${parts[0]}/${parts[1]}`;
  } catch {
    return null;
  }
}

/** Copy build-time star counts onto projects that do not already have one. */
export function applySnapshotStarCounts<
  T extends { slug: string; githubStars?: number },
>(
  projects: T[],
  snapshotProjects: Array<{ slug: string; githubStars?: number }>,
): T[] {
  const starsBySlug = new Map<string, number>();
  for (const project of snapshotProjects) {
    if (typeof project.githubStars === "number") {
      starsBySlug.set(project.slug, project.githubStars);
    }
  }
  return projects.map((project) => {
    if (typeof project.githubStars === "number") return project;
    const stars = starsBySlug.get(project.slug);
    return stars !== undefined ? { ...project, githubStars: stars } : project;
  });
}
