"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TinaPreviewClient } from "@/components/tina/TinaPreviewClient";
import { TinaPreviewMessage } from "@/components/tina/TinaPreviewMessage";
import {
  blogSlugFromPathname,
  blogSlugFromSearchParam,
} from "@/lib/tina-preview-path";
import type { PostMeta, SiteConfig } from "@/lib/tina-helpers";

interface TinaPreviewPageClientProps {
  siteConfig: SiteConfig;
  recentPosts: PostMeta[];
}

/**
 * Dedicated 200 page for the visual editor when a post is not in the static
 * export. If the post has already been published, hop to the real URL so
 * click-to-edit uses the normal blog page.
 */
export function TinaPreviewPageClient({
  siteConfig,
  recentPosts,
}: TinaPreviewPageClientProps) {
  const searchParams = useSearchParams();
  const slug =
    blogSlugFromSearchParam(searchParams.get("path")) ??
    (typeof window !== "undefined" ? blogSlugFromPathname(window.location.pathname) : null);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`/blog/${slug}`, { redirect: "manual" });
        if (!cancelled && response.ok) {
          setPublished(true);
          window.location.replace(`/blog/${slug}`);
        }
      } catch {
        // Stay on the preview page when the live post cannot be reached.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!slug) {
    return (
      <TinaPreviewMessage title="Missing post path">
        Open a post from the Tina admin, or visit{" "}
        <code>/tina-preview?path=YYYY-MM-DD/slug</code>.
      </TinaPreviewMessage>
    );
  }

  if (published) return null;

  return <TinaPreviewClient slug={slug} siteConfig={siteConfig} recentPosts={recentPosts} />;
}
