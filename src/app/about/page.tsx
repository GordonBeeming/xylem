import type { Metadata } from "next";
import { getAuthor, getSiteConfig } from "@/lib/tina-helpers";
import { fetchTina, tinaClient } from "@/components/tina/fetch";
import { AboutView } from "./AboutView";
import { ClientAuthor } from "./client-author";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Gordon Beeming - Solution Architect at SSW, Microsoft MVP, and triathlete.",
  openGraph: {
    title: "About | Gordon Beeming",
    description:
      "About Gordon Beeming - Solution Architect at SSW, Microsoft MVP, and triathlete.",
  },
};

export default async function AboutPage() {
  const author = getAuthor("Gordon Beeming");
  const siteConfig = getSiteConfig();

  if (!author) {
    return (
      <div className="page-narrow">
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--fw-bold)", color: "var(--text)" }}>About</h1>
        <p className="mt-4" style={{ color: "var(--text-muted)" }}>
          Author information not available.
        </p>
      </div>
    );
  }

  // Live editing data from the Tina client. Null on the static build and on a
  // plain `pnpm dev` (no Tina server on :4001) — the page then renders straight
  // from the filesystem with no client JS.
  const tinaData = await fetchTina(() =>
    tinaClient.queries.author({ relativePath: "gordon-beeming.mdx" }),
  );

  if (tinaData) {
    return (
      <ClientAuthor
        query={tinaData.query}
        variables={tinaData.variables}
        data={tinaData.data}
        fallbackAuthor={author}
        siteConfig={siteConfig}
      />
    );
  }

  return <AboutView author={author} siteConfig={siteConfig} />;
}
