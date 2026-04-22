import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export interface NuggetMeta {
  title: string;
  date: string;
  summary?: string;
  tags: string[];
  slug: string;
}

const NUGGETS_DIR = path.join(process.cwd(), "content", "nuggets");

function parseNuggetSidecar(yamlPath: string, slug: string): NuggetMeta | null {
  try {
    const raw = fs.readFileSync(yamlPath, "utf-8");
    const data = yaml.load(raw) as Record<string, unknown> | null;

    if (!data || typeof data !== "object") {
      return null;
    }

    const title = typeof data.title === "string" ? data.title : null;
    const dateRaw = data.date;

    if (!title || !dateRaw) {
      return null;
    }

    const date =
      dateRaw instanceof Date
        ? dateRaw.toISOString()
        : String(dateRaw);

    return {
      title,
      date,
      summary: typeof data.summary === "string" ? data.summary : undefined,
      tags: Array.isArray(data.tags)
        ? data.tags.filter((t): t is string => typeof t === "string")
        : [],
      slug,
    };
  } catch (error) {
    console.error(`Error parsing nugget sidecar ${yamlPath}:`, error);
    return null;
  }
}

let cachedAllNuggets: NuggetMeta[] | null = null;

export function getAllNuggets(): NuggetMeta[] {
  if (cachedAllNuggets !== null) {
    return cachedAllNuggets;
  }

  if (!fs.existsSync(NUGGETS_DIR)) {
    cachedAllNuggets = [];
    return cachedAllNuggets;
  }

  const entries = fs.readdirSync(NUGGETS_DIR, { withFileTypes: true });
  const nuggets: NuggetMeta[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".html")) {
      continue;
    }

    const slug = entry.name.replace(/\.html$/, "");
    const yamlPath = path.join(NUGGETS_DIR, `${slug}.yaml`);

    // Nuggets without a sidecar are silently skipped — /update-nuggets is
    // expected to generate the sidecar before commit. A missing sidecar means
    // the nugget isn't ready to publish yet.
    if (!fs.existsSync(yamlPath)) {
      continue;
    }

    const meta = parseNuggetSidecar(yamlPath, slug);
    if (meta !== null) {
      nuggets.push(meta);
    }
  }

  nuggets.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  cachedAllNuggets = nuggets;
  return nuggets;
}

export function getNugget(slug: string): NuggetMeta | null {
  return getAllNuggets().find((n) => n.slug === slug) ?? null;
}
