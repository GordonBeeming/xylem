"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchButton } from "@/components/ui/SearchButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SkipLink } from "@/components/layout/SkipLink";
import { SITE_NAV_LINKS } from "@/lib/nav-links";
import type { SiteConfig } from "@/lib/tina-helpers";

interface HeaderProps {
  siteConfig: SiteConfig;
}

export function Header({ siteConfig }: HeaderProps) {
  const pathname = usePathname();
  const bio = siteConfig.description.replace(/^.*?-\s*/, "");

  return (
    <>
      <SkipLink />
      <header className="site-nav">
        <div className="site-nav-inner">
          <div className="site-nav-brand">
            <Link href="/" className="site-nav-name no-underline" style={{ fontSize: "var(--text-lg)" }}>
              {siteConfig.author}
            </Link>
            <p className="site-nav-bio" style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-2xs)", opacity: 0.72, margin: "4px 0 0" }}>
              {bio}
            </p>
          </div>

          <div className="flex items-center gap-[var(--space-2)]">
            <SearchButton />
            <ThemeToggle />
          </div>
        </div>

        <div className="site-nav-links-bar">
          <div className="site-nav-links-inner">
            <nav className="site-nav-links">
              {SITE_NAV_LINKS.map((link) => {
                const isActive =
                  link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="no-underline"
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "var(--text-xs)",
                      color: "inherit",
                      opacity: isActive ? 1 : 0.72,
                      borderBottom: isActive ? "2px solid currentColor" : "2px solid transparent",
                      paddingBottom: 2,
                      transition: "var(--transition-colors)",
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
