import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllPosts, getSiteConfig } from "@/lib/tina-helpers";
import { TinaPreviewPageClient } from "./tina-preview-client";

export const metadata: Metadata = {
  title: "Tina preview",
  robots: { index: false, follow: false },
};

export default function TinaPreviewPage() {
  const siteConfig = getSiteConfig();
  const recentPosts = getAllPosts().slice(0, 4);

  return (
    <Suspense fallback={null}>
      <TinaPreviewPageClient siteConfig={siteConfig} recentPosts={recentPosts} />
    </Suspense>
  );
}
