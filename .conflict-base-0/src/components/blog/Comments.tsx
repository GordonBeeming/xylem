"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Comments() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const giscusTheme = resolvedTheme === "dark" ? "dark_dimmed" : "light";

  return (
    <section className="mx-auto max-w-3xl px-6 pb-16 pt-8">
      <h2 className="mb-6 text-2xl font-extrabold text-[var(--color-text-primary)]">
        Comments
      </h2>
      <div
        className="giscus-frame"
        ref={(el) => {
          if (el === null) return;
          // Clear existing iframe if theme changed
          el.innerHTML = "";

          const script = document.createElement("script");
          script.src = "https://giscus.app/client.js";
          script.setAttribute(
            "data-repo",
            process.env.NEXT_PUBLIC_GISCUS_REPO ?? "gordonbeeming/xylem"
          );
          script.setAttribute(
            "data-repo-id",
            process.env.NEXT_PUBLIC_GISCUS_REPO_ID ?? "R_kgDOO0_MBQ"
          );
          script.setAttribute(
            "data-category",
            process.env.NEXT_PUBLIC_GISCUS_CATEGORY ?? "Posts"
          );
          script.setAttribute(
            "data-category-id",
            process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? "DIC_kwDOO0_MBc4Cq9Ps"
          );
          script.setAttribute("data-mapping", "pathname");
          script.setAttribute("data-strict", "0");
          script.setAttribute("data-reactions-enabled", "1");
          script.setAttribute("data-emit-metadata", "0");
          script.setAttribute("data-input-position", "top");
          script.setAttribute("data-theme", giscusTheme);
          script.setAttribute("data-lang", "en");
          script.setAttribute("data-loading", "lazy");
          script.setAttribute("crossorigin", "anonymous");
          script.async = true;

          el.appendChild(script);
        }}
      />
    </section>
  );
}
