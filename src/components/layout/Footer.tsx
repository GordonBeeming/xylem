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
              and the occasional triathlon story. Built with Next.js.
            </p>
            <p className="mt-4 max-w-xs text-sm leading-7 text-white/55">
              Powered by
              curiosity and <a href="https://tina.io" target="_blank" rel="noopener noreferrer" className="text-white/80 underline decoration-white/30 hover:text-white hover:decoration-white/60 transition-colors">
                <svg width="160" height="45" viewBox="0 0 712 199" fill="none" class="flex items-center h-auto fill-orange-500"><path d="M669.255 187c-29.85 0-42.15-16.35-42.15-45s12.3-45 42.15-45c29.7 0 42 16.35 42 45s-12.3 45-42 45zm0-69c-11.25 0-16.05 6.9-16.05 24s4.8 24 16.05 24c11.1 0 15.9-6.9 15.9-24s-4.8-24-15.9-24zM577.424 67.9h29.4v21.9h-29.4V67.9zm-13.35 54.3V100h42.6v84h-27.3v-61.8h-15.3zM517.117 159.1h28.8V184h-28.8v-24.9zM464.954 171.25h-1.5c-4.35 8.1-14.7 14.85-27.45 14.85-18.75 0-28.35-9.3-28.35-23.85 0-14.4 8.55-22.8 24.45-25.35l23.7-3.75c5.25-.9 6.6-3.75 6.6-6.3v-1.65c0-3.75-2.7-8.4-11.7-8.4-7.65 0-12.15 3.45-12.6 9.3h-26.1c1.05-16.95 12.6-29.1 37.5-29.1 26.1 0 39 10.5 39 27.3v37.8h9.45V184h-33v-12.75zm-2.55-19.95v-7.05h-1.5c-1.5 1.65-3.6 2.85-6.9 3.6l-11.1 2.7c-4.95 1.2-7.35 4.05-7.35 8.7 0 5.55 3.6 8.4 10.8 8.4 10.65 0 16.05-7.35 16.05-16.35zM331.016 111.1h2.7c2.7-8.4 8.55-14.1 25.05-14.1 17.25 0 30.3 8.4 30.3 28.8V184h-27.3v-50.1c0-9.15-5.1-13.35-13.5-13.35-9.45 0-14.7 4.65-14.7 16.05V184h-27.3v-84h24.75v11.1zM251.936 67.9h29.4v21.9h-29.4V67.9zm-13.35 54.3V100h42.6v84h-27.3v-61.8h-15.3zM224.5 100v22.2h-21.3v31.5c0 7.05 2.55 9.75 11.7 9.75 3.15 0 7.05-.3 10.8-.6v21.9c-4.05.9-10.65 1.95-18.9 1.95-26.1 0-30.9-15-30.9-26.55V122.2h-13.5V100h13.5V86.65l25.8-11.85h1.5V100h21.3zM92.458 88.135c9.703-7.975 14.002-55.105 18.202-72.046C114.86-.85 132.23.007 132.23.007s-4.509 7.8-2.67 13.62c1.839 5.82 14.44 11.022 14.44 11.022l-2.718 7.12s-5.675-.721-9.052 5.992 4.231 72.5 4.231 72.5-22.357 40.467-22.357 57.264c0 16.797 8.001 30.875 8.001 30.875h-11.227s-16.47-19.477-19.847-29.211c-3.378-9.734-2.027-19.468-2.027-19.468s-17.901-1.007-33.775 0c-15.874 1.007-26.46 14.568-28.371 22.153-1.91 7.586-2.702 26.526-2.702 26.526h-8.877c-5.403-16.57-9.694-22.508-7.366-30.875 6.448-23.174 5.181-36.318 3.688-42.173C10.108 119.498 0 114.388 0 114.388c4.952-10.025 10.006-14.842 31.747-15.345 21.742-.502 51.009-2.933 60.711-10.908z" fill="#EC4815"></path><path d="M34.33 166.555s2.294 21.095 14.48 31.845h10.444c-10.443-11.757-11.582-42.403-11.582-42.403-5.312 1.719-12.666 7.872-13.341 10.558z" fill="#EC4815"></path></svg>
              </a>
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
