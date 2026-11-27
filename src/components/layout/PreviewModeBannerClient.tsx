"use client";

import { useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "./PreviewModeBanner.module.css";

function subscribe() {
  return () => {};
}

function isTopLevelWindow() {
  return window.self === window.top;
}

/**
 * Visible only on a top-level document. Hidden inside the TinaCMS /admin
 * iframe so visual editing stays uncluttered. Server render stays hidden
 * to avoid a flash in the iframe.
 */
export function PreviewModeBannerClient() {
  const visible = useSyncExternalStore(subscribe, isTopLevelWindow, () => false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!visible) return null;

  const search = searchParams.toString();
  const currentPath = `${pathname}${search ? `?${search}` : ""}`;
  const exitHref = `/api/preview/exit?redirect=${encodeURIComponent(currentPath)}`;

  return (
    <div className={styles.banner} role="status">
      <p className={styles.label}>Preview mode</p>
      <a className={styles.exit} href={exitHref}>
        Exit preview
      </a>
    </div>
  );
}
