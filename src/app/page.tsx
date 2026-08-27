import { SidebarHome, type HomeData } from "@/components/home/SidebarHome";
import {
  getAllPosts,
  getAllProjects,
  getAllBooks,
  getSiteConfig,
} from "@/lib/tina-helpers";
import { enrichProjectsWithStars } from "@/lib/github-stars";
import { getYearCounts, getTagCounts, getTagDisplayNames } from "@/lib/content";
import { fetchTina, tinaClient } from "@/components/tina/fetch";
import { ClientHome } from "./client-home";

// Matches the mockup's "Recent writing" section: the 5 most recent posts.
const RECENT_POST_COUNT = 5;
// Same pattern for Projects — 6 most recent, then an "All projects" link to
// the full /projects listing, instead of every project piling onto Home.
const RECENT_PROJECT_COUNT = 6;

export default async function Home() {
  const posts = getAllPosts();
  const projects = await enrichProjectsWithStars(getAllProjects());
  const recentProjects = [...projects]
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, RECENT_PROJECT_COUNT);
  const books = getAllBooks();
  const siteConfig = getSiteConfig();

  const homeData: HomeData = {
    totalPostCount: posts.length,
    // getAllPosts() is already sorted newest-first.
    recentPosts: posts.slice(0, RECENT_POST_COUNT),
    projects: recentProjects,
    books,
    yearCounts: getYearCounts(posts),
    tagCounts: getTagCounts(posts),
    tagDisplayNames: getTagDisplayNames(posts),
  };

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
        homeData={homeData}
        fallbackSiteConfig={siteConfig}
      />
    );
  }

  return <SidebarHome homeData={homeData} siteConfig={siteConfig} />;
}
