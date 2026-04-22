import { Main } from "./Main";
import {
  getAllPosts,
  getAllProjects,
  getAllBooks,
  getSiteConfig,
} from "@/lib/tina-helpers";
import { getAllNuggets } from "@/lib/nuggets";
import { enrichProjectsWithStars } from "@/lib/github-stars";

export default async function Home() {
  const posts = getAllPosts().slice(0, 10);
  const nuggets = getAllNuggets().slice(0, 4);
  const projects = await enrichProjectsWithStars(getAllProjects());
  const books = getAllBooks();
  const siteConfig = getSiteConfig();

  return (
    <Main
      posts={posts}
      nuggets={nuggets}
      projects={projects}
      books={books}
      siteConfig={siteConfig}
    />
  );
}
