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

export default async function Home() {
  const posts = getAllPosts();
  const nuggets = getAllNuggets();
  const projects = await enrichProjectsWithStars(getAllProjects());
  const books = getAllBooks();
  const siteConfig = getSiteConfig();

  const items = buildHomeFeed(posts, nuggets, projects, books);

  return <VesselHome items={items} siteConfig={siteConfig} />;
}
