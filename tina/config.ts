import { defineConfig, defineSchema } from "tinacms";
import { normalizeFigureImageSrc } from "./figure-image-src";
import { parsePostFilename, postFilename } from "./post-filename";
import {
  changeTinaDraftBranch,
  draftModeEnterUrl,
  enterTinaDraftMode,
  reloadSameOriginPreviewIframes,
} from "./enter-draft-mode";

const schema = defineSchema({
  collections: [
    {
      name: "post",
      label: "Blog Posts",
      path: "content/blog",
      format: "mdx",
      ui: {
        // New files are `<date>/<slug>` at the collection root (leading slash).
        // The date is the post's date field, or today, in Australia/Brisbane.
        filename: {
          readonly: false,
          slugify: (values) => postFilename(values),
          parse: parsePostFilename,
        },
        // Published posts are in the static export at this URL. A post that
        // only exists on a branch is served by the preview app once the admin
        // has entered official Next.js draft mode. Visitors still get a 404.
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
        //
        // We tried hiding the field with `ui.component: () => null`, but the
        // inline function doesn't serialize cleanly when Tina pushes the schema
        // up to the cloud — the indexed remote schema ends up missing the `ui`
        // block, and `tinacms build`'s local/remote equality check fails on
        // every run. Keeping the shape as a plain boolean matches whatever Tina
        // ultimately indexes, so the check stays happy. Editors will see a
        // "(deprecated)" checkbox in the admin; the label is the only deterrent.
        {
          type: "boolean",
          name: "draft",
          label: "Draft (deprecated — do not toggle)",
          description:
            "Unused. Kept only to avoid a breaking TinaCloud schema change.",
        },
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
                {
                  type: "image",
                  name: "src",
                  label: "Image",
                  required: true,
                  // Picker uploads land in public/images (Tina media cannot
                  // write to content/blog/<date>/images/). Saved src stays
                  // /images/<file>, matching copy-images and existing posts.
                  uploadDir: () => "images",
                  ui: {
                    parse: normalizeFigureImageSrc,
                    format: normalizeFigureImageSrc,
                  },
                },
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
      ui: {
        // Single author doc surfaced on the about page.
        router: () => "/about",
      },
      fields: [
        { type: "string", name: "name", label: "Name", isTitle: true, required: true },
        { type: "image", name: "avatar", label: "Avatar", uploadDir: () => "static/images" },
        { type: "string", name: "profile_line_1", label: "Profile Line 1" },
        { type: "string", name: "profile_line_2", label: "Profile Line 2" },
        { type: "string", name: "company_name", label: "Company Name" },
        { type: "string", name: "company_website", label: "Company Website" },
        { type: "image", name: "company_logo_dark", label: "Company Logo (Dark)", uploadDir: () => "static/images" },
        { type: "image", name: "company_logo_light", label: "Company Logo (Light)", uploadDir: () => "static/images" },
        { type: "string", name: "mvp_website", label: "MVP Website" },
        { type: "image", name: "mvp_logo_dark", label: "MVP Logo (Dark)", uploadDir: () => "static/images" },
        { type: "image", name: "mvp_logo_light", label: "MVP Logo (Light)", uploadDir: () => "static/images" },
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
      ui: {
        // slug = the JSON filename basename, e.g. content/projects/foo.json → /projects/foo
        router: ({ document }) => `/projects/${document._sys.filename}`,
      },
      fields: [
        { type: "string", name: "title", label: "Title", isTitle: true, required: true },
        { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
        { type: "string", name: "href", label: "Website URL" },
        { type: "image", name: "imgSrc", label: "Image", uploadDir: () => "static/images/projects" },
        { type: "string", name: "techStack", label: "Tech Stack", list: true },
        { type: "string", name: "github", label: "GitHub URL" },
        { type: "string", name: "appStore", label: "App Store URL" },
        { type: "string", name: "video", label: "Video URL" },
        {
          type: "string",
          name: "status",
          label: "Status",
          description: "e.g. Deprecated, Private preview",
          options: ["Deprecated", "Private preview"],
        },
        { type: "boolean", name: "featured", label: "Featured" },
        {
          type: "datetime",
          name: "date",
          label: "Date",
          description: "When the project started (repo creation date, or first commit for private repos). Places it on the home timeline.",
        },
      ],
    },
    {
      name: "book",
      label: "Books",
      path: "content/books",
      format: "json",
      ui: {
        // slug = the JSON filename basename, e.g. content/books/foo.json → /books/foo
        router: ({ document }) => `/books/${document._sys.filename}`,
      },
      fields: [
        { type: "string", name: "title", label: "Title", isTitle: true, required: true },
        { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
        { type: "string", name: "href", label: "URL" },
        { type: "image", name: "imgSrc", label: "Cover Image", uploadDir: () => "static/images/books" },
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
        // Single site-config doc; edited against the home page preview.
        router: () => "/",
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
  // Official Tina preview hooks. onLogin only runs after a fresh
  // authenticate(); an already-signed-in reload must also enter draft
  // mode from cmsCallback (see enterTinaDraftMode).
  admin: {
    authHooks: {
      onLogin: async ({ token }) => {
        const access = token?.id_token || token?.access_token;
        if (!access || typeof window === "undefined") return;
        await fetch(draftModeEnterUrl(), {
          headers: { Authorization: `Bearer ${access}` },
          credentials: "same-origin",
        });
      },
      onLogout: async () => {
        if (typeof window !== "undefined") {
          // The Tina admin is a standalone Vite app, not a Next Client
          // Component, so the official onLogout path is a top-level
          // navigation to the draft-mode exit handler.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = "/api/preview/exit";
        }
      },
    },
  },
  ui: {
    // Official "View Preview" button. The admin also enters draft mode via
    // cmsCallback + authProvider.fetchWithToken, so this URL can rely on
    // the draft-mode cookie already being set when opened from the same origin.
    previewUrl: ({ branch }) => {
      const params = new URLSearchParams();
      if (branch) params.set("branch", branch);
      params.set("slug", "/");
      return { url: `https://gordonbeeming.com/api/preview/enter?${params}` };
    },
  },
  cmsCallback: (cms) => {
    const enter = async () => {
      const ok = await enterTinaDraftMode(cms);
      if (ok) reloadSameOriginPreviewIframes();
    };
    if (typeof window !== "undefined") {
      void enter();
      cms.events.subscribe("cms:login", () => {
        void enter();
      });
    }
    cms.events.subscribe("branch:change", (event: { branchName?: string }) => {
      const branch = event?.branchName;
      if (!branch) return;
      void changeTinaDraftBranch(cms, branch);
    });
    return cms;
  },
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      // Empty on purpose: Tina Cloud saves image fields as
      // `${mediaRoot}${path after __file}`. mediaRoot "uploads" rewrote
      // existing `/images/x.webp` Figure srcs to `/uploads/images/x.webp`
      // on save, and would do the same to `/static/images/...` author
      // and project images. Uploads still go under public/ via
      // publicFolder plus each field's uploadDir.
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  schema,
});
