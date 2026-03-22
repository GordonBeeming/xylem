import Link from "next/link";
import { SocialIcon } from "@/components/social-icons/SocialIcon";

const navigationLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/projects", label: "Projects" },
  { href: "/tags", label: "Tags" },
  { href: "/about", label: "About" },
  { href: "/color-palette", label: "Color Palette" },
  { href: "/flags", label: "Flags" },
];

const supportLinks = [
  {
    href: "https://www.buymeacoffee.com/gordonbeeming",
    label: "Buy Me a Coffee",
  },
  { href: "https://www.patreon.com/gordonbeeming", label: "Patreon" },
  {
    href: "https://github.com/sponsors/gordonbeeming",
    label: "GitHub Sponsors",
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A1A1A] text-[#E0E0E0]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-[2fr_1fr_1fr] md:gap-12">
          {/* Brand */}
          <div>
            <div className="mb-3 text-lg font-extrabold text-[var(--color-brand-highlight)]">
              xylem | Gordon Beeming
            </div>
            <p className="max-w-xs text-sm leading-7 text-white/55">
              A personal blog about software development, DevOps, open source,
              and the occasional triathlon story. Built with Next.js, powered by
              curiosity and <a href="https://tina.io" target="_blank" rel="noopener noreferrer" className="text-white/80 underline decoration-white/30 hover:text-white hover:decoration-white/60 transition-colors">TinaCMS</a>.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/70">
              Links
            </h3>
            <ul className="flex flex-col gap-2.5">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 transition-colors duration-200 hover:text-[var(--color-brand-highlight)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/70">
              Support
            </h3>
            <ul className="flex flex-col gap-2.5">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/55 transition-colors duration-200 hover:text-[var(--color-brand-highlight)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-6 md:flex-row">
          <span className="text-xs text-white/40">
            &copy; {currentYear} Gordon Beeming. All rights reserved.
          </span>
          <div className="flex gap-3">
            <SocialIcon
              kind="github"
              href="https://github.com/gordonbeeming"
              size={18}
            />
            <SocialIcon
              kind="linkedin"
              href="https://www.linkedin.com/in/gordonbeeming"
              size={18}
            />
            <SocialIcon
              kind="bluesky"
              href="https://bsky.app/profile/gordonbeeming.com"
              size={18}
            />
            <SocialIcon
              kind="x"
              href="https://x.com/GordonBeeming"
              size={18}
            />
            <SocialIcon
              kind="youtube"
              href="https://www.youtube.com/@GordonBeeming"
              size={18}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
