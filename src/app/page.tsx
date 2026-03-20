import { Main } from "./Main";
import {
  getPublishedPosts,
  getAllProjects,
  getAllBooks,
  getSiteConfig,
} from "@/lib/tina-helpers";
import { enrichProjectsWithStars } from "@/lib/github-stars";

export default async function Home() {
  const posts = getPublishedPosts().slice(0, 10);
  const projects = await enrichProjectsWithStars(getAllProjects());
  const books = getAllBooks();
  const siteConfig = getSiteConfig();

  return (
    <Main
      posts={posts}
      projects={projects}
      books={books}
      siteConfig={siteConfig}
    />
  );
}
