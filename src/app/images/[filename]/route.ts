import { NextResponse } from "next/server";
import { getPreviewContext } from "@/lib/tina-preview-mode";
import {
  isAllowedRepoImagePath,
  isSafeGitBranch,
  pickRepoImagePath,
  safeImageFilename,
} from "@/lib/preview-images-serve";

export const dynamic = "force-dynamic";

const REPO = "GordonBeeming/xylem";
const TREE_TTL_MS = 60_000;
const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
};

type CachedTree = { paths: string[]; expiresAt: number };
const treeCache = new Map<string, CachedTree>();

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename: raw } = await context.params;
  const filename = safeImageFilename(raw);
  if (!filename) {
    return new NextResponse("Not found", { status: 404 });
  }

  const isDev = process.env.NODE_ENV === "development";
  const preview = await getPreviewContext();
  if (!isDev && !preview.enabled) {
    return new NextResponse("Not found", { status: 404 });
  }

  const fromDisk = await readLocalImage(filename);
  if (fromDisk) return imageResponse(filename, fromDisk);

  const branch = isSafeGitBranch(preview.branch) ? preview.branch : isDev ? null : "main";
  if (!branch) {
    return new NextResponse("Not found", { status: 404 });
  }

  const fromGitHub = await readGitHubImage(branch, filename);
  if (fromGitHub) return imageResponse(filename, fromGitHub);

  return new NextResponse("Not found", { status: 404 });
}

function imageResponse(filename: string, bytes: Uint8Array) {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "content-type": CONTENT_TYPES[ext] ?? "application/octet-stream",
      "cache-control": "private, no-cache, no-store, must-revalidate",
    },
  });
}

async function readLocalImage(filename: string): Promise<Uint8Array | null> {
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const publicPath = path.join(process.cwd(), "public", "images", filename);
    try {
      return await fs.readFile(publicPath);
    } catch {
      // Fall through to content/blog/**/images
    }
    const blogRoot = path.join(process.cwd(), "content", "blog");
    const stack = [blogRoot];
    while (stack.length > 0) {
      const dir = stack.pop();
      if (!dir) break;
      let entries;
      try {
        entries = await fs.readdir(dir, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        const rel = path.relative(process.cwd(), full).split(path.sep).join("/");
        if (entry.isDirectory()) {
          stack.push(full);
          continue;
        }
        if (entry.isFile() && entry.name === filename && rel.includes("/images/")) {
          if (rel === `public/images/${filename}` || rel.startsWith("content/blog/")) {
            if (isAllowedRepoImagePath(rel, filename)) {
              return await fs.readFile(full);
            }
          }
        }
      }
    }
  } catch {
    return null;
  }
  return null;
}

async function readGitHubImage(branch: string, filename: string): Promise<Uint8Array | null> {
  const publicPath = `public/images/${filename}`;
  const direct = await gitHubFile(branch, publicPath);
  if (direct) return direct;

  const paths = await gitHubTreePaths(branch);
  if (!paths) return null;
  const repoPath = pickRepoImagePath(paths, filename);
  if (!repoPath || repoPath === publicPath) return null;
  return gitHubFile(branch, repoPath);
}

async function gitHubFile(branch: string, repoPath: string): Promise<Uint8Array | null> {
  const filename = repoPath.split("/").pop() ?? "";
  if (!isAllowedRepoImagePath(repoPath, filename)) return null;
  const url = `https://api.github.com/repos/${REPO}/contents/${repoPath}?ref=${encodeURIComponent(branch)}`;
  const response = await gitHubFetch(url, { Accept: "application/vnd.github.raw" });
  if (!response || !response.ok) return null;
  const type = response.headers.get("content-type") ?? "";
  if (type.includes("application/json")) return null;
  return new Uint8Array(await response.arrayBuffer());
}

async function gitHubTreePaths(branch: string): Promise<string[] | null> {
  const cached = treeCache.get(branch);
  if (cached && cached.expiresAt > Date.now()) return cached.paths;
  const url = `https://api.github.com/repos/${REPO}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
  const response = await gitHubFetch(url, { Accept: "application/vnd.github+json" });
  if (!response || !response.ok) return null;
  const body = (await response.json()) as { tree?: Array<{ path?: string; type?: string }> };
  const paths = (body.tree ?? [])
    .filter((item) => item.type === "blob" && typeof item.path === "string")
    .map((item) => item.path as string);
  treeCache.set(branch, { paths, expiresAt: Date.now() + TREE_TTL_MS });
  return paths;
}

async function gitHubFetch(url: string, accept: Record<string, string>): Promise<Response | null> {
  const headers: Record<string, string> = {
    ...accept,
    "user-agent": "xylem-preview-images",
    "x-github-api-version": "2022-11-28",
  };
  const token = process.env.GITHUB_IMAGES_TOKEN || process.env.GITHUB_TOKEN;
  if (token) headers.authorization = `Bearer ${token}`;
  try {
    return await fetch(url, { headers });
  } catch {
    return null;
  }
}
