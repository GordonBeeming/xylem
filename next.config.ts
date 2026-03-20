import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : "standalone",
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // GitHub Pages static export can't use Next.js image optimization
    ...(isGitHubPages ? { unoptimized: true } : {}),
  },
  // Rewrites and redirects only work in server mode, not static export
  ...(!isGitHubPages
    ? {
        async rewrites() {
          return [
            {
              source: "/admin",
              destination: "/admin/index.html",
            },
          ];
        },
        async redirects() {
          const mod = await import("./config/redirects.mjs");
          return mod.default;
        },
      }
    : {}),
};

export default nextConfig;
