"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { SearchButton } from "@/components/ui/SearchButton";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SkipLink } from "@/components/layout/SkipLink";

const navLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/projects", label: "Projects" },
  { href: "/tags", label: "Tags" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  const scrollDirection = useScrollDirection();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHidden = scrollDirection === "down";

  return (
    <>
      <SkipLink />
      <header
        className={`fixed top-0 right-0 left-0 z-50 border-b border-[var(--color-border-default)] bg-[var(--color-surface-secondary)] backdrop-blur-md transition-transform duration-300 ease-[var(--ease-default)] ${
          isHidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-lg font-extrabold"
          >
            <svg
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-[var(--color-brand-primary)]"
              aria-hidden="true"
            >
              <rect
                width="28"
                height="28"
                rx="6"
                fill="currentColor"
              />
              <path
                d="M7 8L14 20L21 8"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 14V22"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <span>
              <span className="text-[var(--color-brand-primary)]">xylem</span>
              <span className="mx-2 font-normal text-[var(--color-border-strong)]">
                |
              </span>
              <span className="text-[var(--color-text-primary)]">
                Gordon Beeming
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <nav className="hidden md:block">
              <ul className="flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`inline-block rounded-t-sm border-b-2 px-3.5 py-2 text-[15px] font-medium transition-colors duration-200 ${
                          isActive
                            ? "border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]"
                            : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)]"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <SearchButton />
            <ThemeToggle />

            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors duration-200 hover:bg-[rgba(var(--color-brand-primary),0.1)] hover:text-[var(--color-brand-primary)] md:hidden"
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

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
