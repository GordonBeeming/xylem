# CLAUDE.md

## Project Overview

This is **xylem-x**, Gordon Beeming's developer blog and portfolio at gordonbeeming.com. It's a Next.js App Router site with TinaCMS for content management, Tailwind CSS v4 for styling, and MDX for blog content.

## Quick Reference

- **Package manager**: pnpm
- **Dev server**: `pnpm dev` (without CMS) or `pnpm dev:tina` (with TinaCMS admin at /admin)
- **Build**: `pnpm build`
- **Content**: 184 MDX blog posts in `content/blog/YYYY-MM-DD/slug.mdx`

## Architecture

### Content System
- Blog posts, authors are **MDX** in `content/`
- Projects, books, site config are **JSON** in `content/`
- TinaCMS schema defined in `tina/config.ts` (5 collections: post, author, project, book, siteConfig)
- Content is read at build time via `src/lib/tina-helpers.ts` (filesystem) with TinaCMS client as overlay for visual editing
- Blog images live alongside posts in `content/blog/YYYY-MM-DD/images/` and are copied to `public/images/` by `scripts/copy-images.mjs` at build time

### Rendering Pipeline (Blog Posts)
- MDX rendered via `next-mdx-remote/rsc` (server-side)
- Syntax highlighting via `@shikijs/rehype` with `github-light`/`github-dark` dual themes
- Code block titles extracted from meta string (`title="filename.go"`) via shiki transformer → `data-meta` attribute → `CodeBlock` component
- Custom components mapped in `src/app/blog/[...slug]/page.tsx` (`mdxComponents` object)
- Visual editing via `useTina` hook in `src/app/blog/[...slug]/client-post.tsx`

### Styling
- Tailwind CSS v4 with design tokens in `src/css/tailwind.css`
- Dark mode uses class strategy: `@custom-variant dark (&:where(.dark, .dark *))` with `next-themes`
- Brand colors: Light primary `#0063B2`, Dark primary `#46CBFF`
- All colors defined as CSS custom properties under `.dark {}` override block

### Key Files
| File | Purpose |
|------|---------|
| `src/app/blog/[...slug]/page.tsx` | Blog post page (MDX rendering, SEO, structured data) |
| `src/app/Main.tsx` | Home page layout (hero, posts grid, projects, books) |
| `src/lib/tina-helpers.ts` | Content reading from filesystem (getAllPosts, getPost, etc.) |
| `src/lib/content.ts` | Content utilities (formatDate, sortPosts, getTagCounts, etc.) |
| `src/components/prose/CodeBlock.tsx` | Code block with title bar, language pill, copy button, shiki highlighting |
| `src/css/tailwind.css` | Design tokens, dark mode overrides, animations, prose styles |
| `tina/config.ts` | TinaCMS schema definition |
| `config/redirects.mjs` | 146 URL redirect rules |
| `src/lib/rehype-code-meta.ts` | Rehype plugins for preserving code fence meta through shiki |

### URL Structure
- Blog posts: `/blog/YYYY-MM-DD/slug`
- Tags: `/tags/slugified-tag` (tags are slugified via github-slugger)
- Years: `/years/YYYY`
- Feeds: `/feed.xml`, `/atom.xml`, `/feed.json`, `/tags/[tag]/feed.xml`, `/years/[year]/feed.xml`

## Development Notes

### Adding a Blog Post
Create `content/blog/YYYY-MM-DD/slug.mdx` with frontmatter (title, date, tags, summary). Images go in `content/blog/YYYY-MM-DD/images/` — they are copied to `public/images/` automatically when running `pnpm dev`, `pnpm build`, or Docker build.

### Code Block Titles
Use the meta string on code fences: ` ```language title="descriptive title" `. The title shows in a grey header bar above the code.

### Tag Handling
Tags are slugified for URLs using `github-slugger`. The `TagPill` component handles this automatically. When filtering posts by tag, always compare against the slugified version.

### TinaCMS Visual Editing
Blog posts use `useTina` hook (in `client-post.tsx`) for sidebar form editing in the admin. The server component fetches from both filesystem (for rendering) and TinaCMS client (for editing data). TinaCMS local mode runs a GraphQL server at localhost:4001.

### Dark Mode
Uses `next-themes` with `attribute="class"`. The `html` element gets class `dark`. Tailwind's `dark:` variant is configured via `@custom-variant`. Use `dark:` prefix for dark mode styles. Logo/image swapping uses `dark:hidden` / `hidden dark:block` pattern.

### GitHub Stars
Project cards fetch live star counts from GitHub API at build time via `src/lib/github-stars.ts`. Set `GITHUB_TOKEN` env var for higher rate limits.

## Don't Forget
- Image copy runs automatically with `pnpm dev`/`pnpm build` — no manual step needed
- Tags in URLs are always lowercase/slugified — never use raw tag text in hrefs
- The `config/redirects.mjs` file has 146 redirect rules — preserve all of them
- Code blocks should always have a `title="..."` meta string for the header bar

@AGENTS.md
