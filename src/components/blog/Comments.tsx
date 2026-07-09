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

  const giscusTheme = resolvedTheme === "dark" ? "dark_tritanopia" : "light_tritanopia";

  return (
    <section className="mt-[var(--space-12)]">
      <div className="mb-[var(--space-5)] flex items-center gap-[var(--space-3)]">
        <h2
          style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-tight)", color: "var(--text)" }}
        >
          Comments
        </h2>
        <span
          className="rounded-[var(--radius-xs)] border px-[7px] py-0.5"
          style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--text-subtle)", borderColor: "var(--border)" }}
        >
          via giscus
        </span>
      </div>
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
