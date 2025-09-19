# Xylem

**Based on the [tailwind-nextjs-starter-blog](https://github.com/timlrx/tailwind-nextjs-starter-blog) using inheritance via copy and paste.**

## Getting Started

First, run:

```bash
pnpm install
```

Then run the development server (using the package manager of your choice):

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scheduled Post Publishing

This blog supports automatic publishing of scheduled posts. Posts with a future date will not appear on the site until their scheduled date, and then will automatically become visible via the GitHub Actions scheduled build process.

### How Scheduled Publishing Works

1. **Future Post Filtering**: Posts with dates in the future are excluded from:
   - Homepage recent posts listing
   - Blog listing pages and pagination
   - Tag pages and pagination
   - Year pages and pagination
   - RSS feeds (main, tag-specific, and year-specific)
   - Sitemap generation
   - Static site generation

2. **Automatic Publishing**: GitHub Actions runs daily at 6:00 AM Brisbane time to rebuild and deploy the site, ensuring scheduled posts go live automatically on their designated date.

3. **Date Format**: Use ISO 8601 format for post dates: `date: '2025-12-31T12:00:00Z'`

### Scheduling a Post

To schedule a post for future publication:

1. Create your blog post in the appropriate `data/blog/YYYY-MM-DD/` directory
2. Set the `date` field in the frontmatter to your desired publish time
3. Ensure `draft: false` (drafts are always excluded regardless of date)
4. The post will remain hidden until the scheduled date

The automated build process will publish the post without requiring any manual intervention. Posts are published daily, so any post dated for today or earlier will become visible in the next daily build.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
