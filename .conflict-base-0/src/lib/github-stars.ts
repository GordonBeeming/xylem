import type { ProjectData } from "./tina-helpers";

/**
 * Extract the GitHub owner/repo from a GitHub URL.
 * Returns null if the URL is not a valid GitHub repo URL.
 */
function parseGitHubRepo(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return null;
    // pathname like /GordonBeeming/copilot_here
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return `${parts[0]}/${parts[1]}`;
  } catch {
    return null;
  }
}

/**
 * Fetch the star count for a single GitHub repository.
 * Returns undefined if the fetch fails (network error, rate limit, etc.).
 */
async function fetchStarCount(repo: string): Promise<number | undefined> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "xylem-blog-build",
    };

    // Use GITHUB_TOKEN if available (avoids 60 req/hr unauthenticated rate limit)
    const token = process.env.GITHUB_TOKEN;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers,
      next: { revalidate: 3600 }, // cache for 1 hour during dev
    });

    if (!response.ok) {
      console.warn(
        `[github-stars] Failed to fetch stars for ${repo}: ${response.status} ${response.statusText}`
      );
      return undefined;
    }

    const data = (await response.json()) as { stargazers_count?: number };
    if (typeof data.stargazers_count === "number") {
      return data.stargazers_count;
    }
    return undefined;
  } catch (error) {
    console.warn(`[github-stars] Error fetching stars for ${repo}:`, error);
    return undefined;
  }
}

/**
 * Enrich an array of projects with live GitHub star counts.
 * Falls back to any `githubStars` value already present in the project data (from JSON).
 */
export async function enrichProjectsWithStars(
  projects: ProjectData[]
): Promise<ProjectData[]> {
  const enriched = await Promise.all(
    projects.map(async (project) => {
      if (!project.github) return project;

      const repo = parseGitHubRepo(project.github);
      if (!repo) return project;

      const stars = await fetchStarCount(repo);
      if (stars !== undefined) {
        return { ...project, githubStars: stars };
      }
      // Keep existing fallback value from JSON if live fetch failed
      return project;
    })
  );

  return enriched;
}
