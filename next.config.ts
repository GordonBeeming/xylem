import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
// The GitHub Pages build stays a static export. The OpenNext preview Worker
// build sets XYLEM_PREVIEW=1 so the same app can use Route Handlers and
// Next.js draft mode (official Tina + Next preview flow).
const isPreviewWorker = process.env.XYLEM_PREVIEW === "1";

const nextConfig: NextConfig = {
  ...(!isDev && !isPreviewWorker ? { output: "export" } : {}),
  reactStrictMode: true,
  // Dev-only routes are named `page.dev.tsx` so they resolve as pages under
  // `next dev` and simply do not exist in a build. A static export cannot hold a
  // dynamic route that emits no paths — Next reads an empty generateStaticParams()
  // as a missing one and fails the build — so leaving the file out is the only way
  // to keep such a route off production without shipping a stub page.
  pageExtensions: [...(isDev ? ["dev.tsx"] : []), "tsx", "ts", "jsx", "js"],
  turbopack: {
    root: __dirname,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: true,
  },
};

export default nextConfig;
