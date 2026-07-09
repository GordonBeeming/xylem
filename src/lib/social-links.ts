import type { SiteConfig } from "@/lib/tina-helpers";
import type { SocialIconKind } from "@/components/social-icons/SocialIcon";

/** Single source of truth for the social icons shown across the site
 *  (About page, site footer, Home page footer, mobile nav drawer, and
 *  the post author bio card) — every consumer should read from here
 *  instead of hand-rolling its own list. */
export const SITE_SOCIAL_LINKS: { kind: SocialIconKind; configKey: keyof SiteConfig }[] = [
  { kind: "github", configKey: "github" },
  { kind: "linkedin", configKey: "linkedin" },
  { kind: "youtube", configKey: "youtube" },
];
