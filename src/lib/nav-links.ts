export interface NavLink {
  href: string;
  label: string;
}

/** Single source of truth for the site's primary sections, in nav order.
 *  Header renders this list as-is; Footer appends its own extra entry
 *  (Color Palette) on top of it, so a new route never has to be added in
 *  more than one place. */
export const SITE_NAV_LINKS: NavLink[] = [
  { href: "/", label: "home" },
  { href: "/blog", label: "blog" },
  { href: "/nuggets", label: "nuggets" },
  { href: "/projects", label: "projects" },
  { href: "/tags", label: "tags" },
  { href: "/about", label: "about" },
  // Drafts are working notes. NODE_ENV is inlined at build time, so this entry
  // is compiled out of the production bundle rather than merely hidden.
  ...(process.env.NODE_ENV === "production" ? [] : [{ href: "/drafts", label: "drafts" }]),
];
