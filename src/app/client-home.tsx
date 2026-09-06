"use client";

import { useTina, tinaField } from "tinacms/dist/react";
import { SidebarHome, type HomeData } from "@/components/home/SidebarHome";
import type { SiteConfig } from "@/lib/tina-helpers";
import type { SiteConfigQuery } from "../../tina/__generated__/types";

interface ClientHomeProps {
  query: string;
  variables: Record<string, unknown>;
  data: SiteConfigQuery;
  homeData: HomeData;
  fallbackSiteConfig: SiteConfig;
}

/**
 * Client wrapper that drives the home page's siteConfig-derived Elsewhere
 * links (GitHub/LinkedIn/YouTube) from TinaCMS's live `useTina` data, so the
 * preview updates as fields are edited in the admin.
 *
 * The aggregated post/project/book data (`homeData`) isn't a single Tina doc
 * and stays server-built — only the siteConfig fields SidebarHome actually
 * renders are threaded through as live/editable.
 */
export function ClientHome({ query, variables, data, homeData, fallbackSiteConfig }: ClientHomeProps) {
  const { data: live } = useTina({ query, variables, data });
  const siteConfig = live.siteConfig;

  const mergedSiteConfig: SiteConfig = {
    ...fallbackSiteConfig,
    github: siteConfig.github ?? fallbackSiteConfig.github,
    linkedin: siteConfig.linkedin ?? fallbackSiteConfig.linkedin,
    youtube: siteConfig.youtube ?? fallbackSiteConfig.youtube,
  };

  const tinaFields = {
    github: tinaField(siteConfig, "github"),
    linkedin: tinaField(siteConfig, "linkedin"),
    youtube: tinaField(siteConfig, "youtube"),
  };

  return <SidebarHome homeData={homeData} siteConfig={mergedSiteConfig} tinaFields={tinaFields} />;
}
