import { VesselHome } from "@/components/home/VesselHome";
import { buildHomeFeed } from "@/lib/home-feed";
import {
  getAllPosts,
  getAllProjects,
  getAllBooks,
  getSiteConfig,
} from "@/lib/tina-helpers";
import { getAllNuggets } from "@/lib/nuggets";
import { enrichProjectsWithStars } from "@/lib/github-stars";
import { fetchTina, tinaClient } from "@/components/tina/fetch";
import { ClientHome } from "./client-home";

export default async function Home() {
  const posts = getAllPosts();
  const nuggets = getAllNuggets();
  const projects = await enrichProjectsWithStars(getAllProjects());
  const books = getAllBooks();
  const siteConfig = getSiteConfig();

  const items = buildHomeFeed(posts, nuggets, projects, books);

  // Live editing data from the Tina client. Null on the static build and on a
  // plain `pnpm dev` (no Tina server on :4001) — the page then renders straight
  // from the filesystem with no client JS.
  const tinaData = await fetchTina(() =>
    tinaClient.queries.siteConfig({ relativePath: "site.json" }),
  );

  if (tinaData) {
    return (
      <ClientHome
        query={tinaData.query}
        variables={tinaData.variables}
        data={tinaData.data}
        items={items}
        fallbackSiteConfig={siteConfig}
      />
    );
  }

  return <VesselHome items={items} siteConfig={siteConfig} />;
}
