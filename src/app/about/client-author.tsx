"use client";

import { useTina, tinaField } from "tinacms/dist/react";
import { AboutView, type AboutTinaFields } from "./AboutView";
import type { AuthorData, SiteConfig } from "@/lib/tina-helpers";
import type { AuthorQuery } from "../../../tina/__generated__/types";

interface ClientAuthorProps {
  query: string;
  variables: Record<string, unknown>;
  data: AuthorQuery;
  fallbackAuthor: AuthorData;
  siteConfig: SiteConfig;
}

/**
 * Client wrapper that drives the /about profile card from TinaCMS's live
 * `useTina` data, so the preview updates as fields are edited in the admin
 * and `data-tina-field` enables click-to-edit.
 *
 * The bio prose keeps coming from `fallbackAuthor.body` (the filesystem
 * string) — see the deferral note on `AboutView`. Everything else (name,
 * avatar, profile lines, company/MVP logos) is live.
 */
export function ClientAuthor({ query, variables, data, fallbackAuthor, siteConfig }: ClientAuthorProps) {
  const { data: live } = useTina({ query, variables, data });
  const author = live.author;

  const mergedAuthor: AuthorData = {
    ...fallbackAuthor,
    name: author.name,
    avatar: author.avatar ?? undefined,
    profile_line_1: author.profile_line_1 ?? undefined,
    profile_line_2: author.profile_line_2 ?? undefined,
    company_name: author.company_name ?? undefined,
    company_website: author.company_website ?? undefined,
    company_logo_dark: author.company_logo_dark ?? undefined,
    company_logo_light: author.company_logo_light ?? undefined,
    mvp_website: author.mvp_website ?? undefined,
    mvp_logo_dark: author.mvp_logo_dark ?? undefined,
    mvp_logo_light: author.mvp_logo_light ?? undefined,
  };

  const tinaFields: AboutTinaFields = {
    name: tinaField(author, "name"),
    avatar: tinaField(author, "avatar"),
    profile_line_1: tinaField(author, "profile_line_1"),
    profile_line_2: tinaField(author, "profile_line_2"),
    company_logo_light: tinaField(author, "company_logo_light"),
    company_logo_dark: tinaField(author, "company_logo_dark"),
    mvp_logo_light: tinaField(author, "mvp_logo_light"),
    mvp_logo_dark: tinaField(author, "mvp_logo_dark"),
  };

  return <AboutView author={mergedAuthor} siteConfig={siteConfig} tinaFields={tinaFields} />;
}
