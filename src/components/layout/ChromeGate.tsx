"use client";

import { usePathname } from "next/navigation";

/**
 * Hides the global site chrome (Header/Footer) on the Home route — the vessel
 * timeline brings its own identity header and footer. Other routes render
 * their children (Header/Footer are Server Components, rendered on the
 * server and passed in as children; this just decides whether to include
 * them in the tree).
 */
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <>{children}</>;
}
