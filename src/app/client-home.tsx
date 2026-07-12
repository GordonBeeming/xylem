"use client";

import { useTina, tinaField } from "tinacms/dist/react";
import { VesselHome } from "@/components/home/VesselHome";
import type { FeedItem } from "@/lib/home-feed";
import type { SiteConfig } from "@/lib/tina-helpers";
import type { SiteConfigQuery } from "../../tina/__generated__/types";

interface ClientHomeProps {
  query: string;
  variables: Record<string, unknown>;
  data: SiteConfigQuery;
  items: FeedItem[];
  fallbackSiteConfig: SiteConfig;
}

/**
 * Client wrapper that drives the home page's siteConfig-derived content
 * (the header bio line, the footer social icons) from TinaCMS's live
 * `useTina` data, so the preview updates as fields are edited in the admin.
 *
 * The aggregated post/project/book feed (`items`) isn't a single Tina doc
 * and stays server-built — only the siteConfig fields VesselHome actually
 * renders are threaded through as live/editable.
 */
export function ClientHome({ query, variables, data, items, fallbackSiteConfig }: ClientHomeProps) {
  const { data: live } = useTina({ query, variables, data });
  const siteConfig = live.siteConfig;

  const mergedSiteConfig: SiteConfig = {
    ...fallbackSiteConfig,
    description: siteConfig.description ?? fallbackSiteConfig.description,
    github: siteConfig.github ?? fallbackSiteConfig.github,
    linkedin: siteConfig.linkedin ?? fallbackSiteConfig.linkedin,
    youtube: siteConfig.youtube ?? fallbackSiteConfig.youtube,
  };

  const tinaFields = {
    description: tinaField(siteConfig, "description"),
    github: tinaField(siteConfig, "github"),
    linkedin: tinaField(siteConfig, "linkedin"),
    youtube: tinaField(siteConfig, "youtube"),
  };

  return <VesselHome items={items} siteConfig={mergedSiteConfig} tinaFields={tinaFields} />;
}
