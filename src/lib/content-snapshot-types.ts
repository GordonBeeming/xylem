import type { AuthorData, BookData, PostMeta, ProjectData, ProjectReadme, SiteConfig } from "./tina-helpers";
import type { NuggetMeta } from "./nuggets";

export type SnapshotPost = {
  meta: PostMeta;
  content: string;
};

export type ContentSnapshot = {
  posts: SnapshotPost[];
  projects: ProjectData[];
  projectReadmes: Record<string, ProjectReadme>;
  books: BookData[];
  authors: Record<string, AuthorData>;
  siteConfig: SiteConfig | null;
  nuggets: NuggetMeta[];
};

export const EMPTY_CONTENT_SNAPSHOT: ContentSnapshot = {
  posts: [],
  projects: [],
  projectReadmes: {},
  books: [],
  authors: {},
  siteConfig: null,
  nuggets: [],
};
