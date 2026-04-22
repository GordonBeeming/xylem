import { defineConfig, defineSchema } from "tinacms";

const schema = defineSchema({
  collections: [
    {
      name: "post",
      label: "Blog Posts",
      path: "content/blog",
      format: "mdx",
      ui: {
        router: ({ document }) => {
          return `/blog/${document._sys.breadcrumbs.join("/")}`;
        },
      },
      fields: [
        { type: "string", name: "title", label: "Title", isTitle: true, required: true },
        { type: "datetime", name: "date", label: "Date", required: true },
        { type: "string", name: "tags", label: "Tags", list: true },
        { type: "datetime", name: "lastmod", label: "Last Modified" },
        // Kept only to keep the TinaCloud remote schema happy — removing a field
        // is a breaking change and the `tinacms build` in CI bails before it can
        // push the new schema. Draft is no longer read anywhere in the codebase;
        // no blog post has ever had `draft: true`, and the filter helpers were
        // removed. Field stays here purely as a placeholder until we can safely
        // drop it via TinaCloud's breaking-change approval flow.
        { type: "boolean", name: "draft", label: "Draft" },
        { type: "string", name: "summary", label: "Summary", ui: { component: "textarea" } },
        { type: "string", name: "canonicalUrl", label: "Canonical URL" },
        {
          type: "rich-text",
          name: "body",
          label: "Body",
          isBody: true,
          templates: [
            {
              name: "Figure",
              label: "Figure (Image with Caption)",
              fields: [
                { type: "image", name: "src", label: "Image", required: true },
                { type: "string", name: "alt", label: "Alt Text", required: true },
                { type: "string", name: "width", label: "Width" },
                { type: "string", name: "height", label: "Height" },
                { type: "string", name: "caption", label: "Caption" },
              ],
            },
            {
              name: "YouTubeEmbed",
              label: "YouTube Video",
              fields: [
                { type: "string", name: "src", label: "YouTube Embed URL", required: true },
                { type: "string", name: "title", label: "Video Title" },
                { type: "number", name: "width", label: "Width" },
                { type: "number", name: "height", label: "Height" },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "author",
      label: "Authors",
      path: "content/authors",
      format: "mdx",
      fields: [
        { type: "string", name: "name", label: "Name", isTitle: true, required: true },
        { type: "image", name: "avatar", label: "Avatar" },
        { type: "string", name: "profile_line_1", label: "Profile Line 1" },
        { type: "string", name: "profile_line_2", label: "Profile Line 2" },
        { type: "string", name: "company_name", label: "Company Name" },
        { type: "string", name: "company_website", label: "Company Website" },
        { type: "image", name: "company_logo_dark", label: "Company Logo (Dark)" },
        { type: "image", name: "company_logo_light", label: "Company Logo (Light)" },
        { type: "string", name: "mvp_website", label: "MVP Website" },
        { type: "image", name: "mvp_logo_dark", label: "MVP Logo (Dark)" },
        { type: "image", name: "mvp_logo_light", label: "MVP Logo (Light)" },
        { type: "string", name: "email", label: "Email" },
        { type: "string", name: "twitter", label: "Twitter" },
        { type: "string", name: "bluesky", label: "Bluesky" },
        { type: "string", name: "linkedin", label: "LinkedIn" },
        { type: "string", name: "github", label: "GitHub" },
        { type: "string", name: "layout", label: "Layout" },
        { type: "rich-text", name: "body", label: "Bio", isBody: true },
      ],
    },
    {
      name: "project",
      label: "Projects",
      path: "content/projects",
      format: "json",
      fields: [
        { type: "string", name: "title", label: "Title", isTitle: true, required: true },
        { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
        { type: "string", name: "href", label: "Website URL" },
        { type: "image", name: "imgSrc", label: "Image" },
        { type: "string", name: "techStack", label: "Tech Stack", list: true },
        { type: "string", name: "github", label: "GitHub URL" },
        { type: "boolean", name: "featured", label: "Featured" },
      ],
    },
    {
      name: "book",
      label: "Books",
      path: "content/books",
      format: "json",
      fields: [
        { type: "string", name: "title", label: "Title", isTitle: true, required: true },
        { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
        { type: "string", name: "href", label: "URL" },
        { type: "image", name: "imgSrc", label: "Cover Image" },
        { type: "string", name: "overview", label: "Overview", ui: { component: "textarea" } },
        {
          type: "object",
          name: "authors",
          label: "Authors",
          list: true,
          fields: [
            { type: "string", name: "name", label: "Name", required: true },
            { type: "string", name: "url", label: "Profile URL" },
          ],
        },
        {
          type: "object",
          name: "reviewers",
          label: "Reviewers",
          list: true,
          fields: [
            { type: "string", name: "name", label: "Name", required: true },
            { type: "string", name: "url", label: "Profile URL" },
          ],
        },
        { type: "string", name: "publisher", label: "Publisher" },
        { type: "string", name: "publishedDate", label: "Published Date" },
        { type: "string", name: "isbn", label: "ISBN" },
        {
          type: "object",
          name: "tableOfContents",
          label: "Table of Contents",
          list: true,
          fields: [
            { type: "string", name: "title", label: "Chapter Title", required: true },
            { type: "string", name: "sections", label: "Sections", list: true },
          ],
        },
      ],
    },
    {
      name: "siteConfig",
      label: "Site Config",
      path: "content/config",
      format: "json",
      ui: {
        allowedActions: { create: false, delete: false },
      },
      fields: [
        { type: "string", name: "title", label: "Site Title", isTitle: true, required: true },
        { type: "string", name: "author", label: "Author" },
        { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
        { type: "string", name: "siteUrl", label: "Site URL" },
        { type: "string", name: "language", label: "Language" },
        { type: "string", name: "locale", label: "Locale" },
        { type: "string", name: "timezone", label: "Timezone" },
        { type: "string", name: "email", label: "Email" },
        { type: "string", name: "github", label: "GitHub" },
        { type: "string", name: "twitter", label: "Twitter/X" },
        { type: "string", name: "linkedin", label: "LinkedIn" },
        { type: "string", name: "youtube", label: "YouTube" },
        { type: "string", name: "bluesky", label: "Bluesky" },
        { type: "string", name: "instagram", label: "Instagram" },
        { type: "string", name: "threads", label: "Threads" },
        { type: "string", name: "mastodon", label: "Mastodon" },
        { type: "string", name: "patreon", label: "Patreon" },
        { type: "string", name: "buymeacoffee", label: "Buy Me a Coffee" },
        { type: "string", name: "githubsponsors", label: "GitHub Sponsors" },
        { type: "string", name: "googleAnalyticsId", label: "Google Analytics ID" },
        { type: "string", name: "giscusRepo", label: "Giscus Repo" },
        { type: "string", name: "giscusRepoId", label: "Giscus Repo ID" },
        { type: "string", name: "giscusCategory", label: "Giscus Category" },
        { type: "string", name: "giscusCategoryId", label: "Giscus Category ID" },
      ],
    },
  ],
});

export default defineConfig({
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "",
  branch: process.env.NEXT_PUBLIC_TINA_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main",
  token: process.env.TINA_TOKEN || "",
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
  },
  schema,
});
