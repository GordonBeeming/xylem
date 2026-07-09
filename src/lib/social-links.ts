import type { SiteConfig } from "@/lib/tina-helpers";
import type { SocialIconKind } from "@/components/social-icons/SocialIcon";

/** Single source of truth for the social icons shown on the About page,
 *  the site footer, and the Home page footer — keep these three in sync. */
export const SITE_SOCIAL_LINKS: { kind: SocialIconKind; configKey: keyof SiteConfig }[] = [
  { kind: "github", configKey: "github" },
  { kind: "linkedin", configKey: "linkedin" },
  { kind: "youtube", configKey: "youtube" },
];
