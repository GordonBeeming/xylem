"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SearchButton } from "@/components/ui/SearchButton";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SkipLink } from "@/components/layout/SkipLink";
import type { SiteConfig } from "@/lib/tina-helpers";

const navLinks = [
  { href: "/blog", label: "blog" },
  { href: "/nuggets", label: "nuggets" },
  { href: "/projects", label: "projects" },
  { href: "/tags", label: "tags" },
  { href: "/about", label: "about" },
];

interface HeaderProps {
  siteConfig: SiteConfig;
}

export function Header({ siteConfig }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <SkipLink />
      <header className="site-nav">
        <div className="site-nav-inner">
          <Link
            href="/"
            className="wordmark flex items-center gap-[var(--space-3)] no-underline"
            style={{ fontWeight: "var(--fw-bold)", fontSize: "var(--text-md)", letterSpacing: "var(--ls-tight)", color: "var(--text)" }}
          >
            <span style={{ color: "var(--accent)" }}>xylem</span>
            <span className="h-[15px] w-[1.5px]" style={{ background: "var(--border-strong)" }} />
            <span style={{ fontWeight: "var(--fw-semibold)" }}>Gordon Beeming</span>
          </Link>

          <nav className="site-nav-links">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="no-underline"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-sm)",
                    color: isActive ? "var(--accent)" : "var(--text-muted)",
                    transition: "var(--transition-colors)",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-[var(--space-2)]">
            <SearchButton />

            <button
              className="nav-hamburger hidden h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--text-muted)] transition-[var(--transition-colors)] hover:bg-[var(--surface-2)] hover:text-[color:var(--accent)]"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} siteConfig={siteConfig} />
    </>
  );
}
