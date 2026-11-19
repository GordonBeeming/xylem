"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import {
  blogSlugFromPathname,
  blogSlugFromSearchParam,
} from "@/lib/tina-preview-path";
import type { PostMeta, SiteConfig } from "@/lib/tina-helpers";
import type { TinaPreviewClient } from "./TinaPreviewClient";

interface TinaPreviewGateProps {
  children: ReactNode;
  siteConfig: SiteConfig;
  recentPosts: PostMeta[];
}

type PreviewComponent = ComponentType<Parameters<typeof TinaPreviewClient>[0]>;

/**
 * On the 404 page, swap in the Tina preview when this tab is the visual-editor
 * iframe for a `/blog/...` path. Ordinary visitors still see the 404.
 */
export function TinaPreviewGate({ children, siteConfig, recentPosts }: TinaPreviewGateProps) {
  const [preview, setPreview] = useState<{
    Component: PreviewComponent;
    slug: string;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug =
      blogSlugFromPathname(window.location.pathname) ??
      blogSlugFromSearchParam(params.get("path"));
    const inEditor = window.self !== window.top;
    if (!slug || !inEditor) return;

    let cancelled = false;
    void import("./TinaPreviewClient").then((mod) => {
      if (!cancelled) {
        setPreview({ Component: mod.TinaPreviewClient, slug });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (preview) {
    const { Component, slug } = preview;
    return <Component slug={slug} siteConfig={siteConfig} recentPosts={recentPosts} />;
  }
  return children;
}
