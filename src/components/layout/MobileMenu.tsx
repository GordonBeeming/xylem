"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";
import { SocialIcon } from "@/components/social-icons/SocialIcon";
import type { SiteConfig } from "@/lib/tina-helpers";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: SiteConfig;
}

const navLinks = [
  { href: "/", label: "home" },
  { href: "/blog", label: "blog" },
  { href: "/nuggets", label: "nuggets" },
  { href: "/projects", label: "projects" },
  { href: "/tags", label: "tags" },
  { href: "/about", label: "about" },
];

type SocialKind = "github" | "linkedin" | "bluesky" | "x" | "youtube";

const socialLinks: { key: SocialKind; configKey: keyof SiteConfig }[] = [
  { key: "github", configKey: "github" },
  { key: "linkedin", configKey: "linkedin" },
  { key: "bluesky", configKey: "bluesky" },
  { key: "x", configKey: "twitter" },
  { key: "youtube", configKey: "youtube" },
];

const mono = { fontFamily: "var(--font-mono)" };

export function MobileMenu({ isOpen, onClose, siteConfig }: MobileMenuProps) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = menuRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  return (
    <div
      ref={menuRef}
      className="fixed inset-0 z-[200]"
      style={{
        pointerEvents: isOpen ? "auto" : "none",
        visibility: isOpen ? "visible" : "hidden",
        transitionProperty: "visibility",
        transitionDuration: "0.24s",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm transition-opacity duration-200"
        style={{ background: "var(--overlay)", opacity: isOpen ? 1 : 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <nav
        className="absolute right-0 top-0 flex h-full flex-col p-[var(--space-5)]"
        style={{
          width: "min(300px, 82vw)",
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.24s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div className="mb-[var(--space-6)] flex items-center justify-between">
          <span
            style={{ ...mono, fontSize: "var(--text-2xs)", letterSpacing: "var(--ls-wider)", textTransform: "uppercase", color: "var(--text-subtle)" }}
          >
            Menu
          </span>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] text-[color:var(--text-muted)] transition-[var(--transition-colors)] hover:text-[color:var(--text)]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {navLinks.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex items-center gap-[var(--space-3)] border-b py-[13px] no-underline"
              style={{
                ...mono,
                fontSize: "var(--text-md)",
                color: isActive ? "var(--accent)" : "var(--text)",
                borderColor: "var(--border)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--accent)", visibility: isActive ? "visible" : "hidden" }}
              />
              {link.label}
            </Link>
          );
        })}

        <div className="mt-[var(--space-6)] flex gap-0.5">
          {socialLinks.map(({ key, configKey }) => {
            const href = siteConfig[configKey] as string | undefined;
            if (!href) return null;
            return <SocialIcon key={key} kind={key} href={href} size={17} variant="muted" />;
          })}
        </div>
      </nav>
    </div>
  );
}
