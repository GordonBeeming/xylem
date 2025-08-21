# Xylem - Gordon Beeming's Personal Blog

**ALWAYS follow these instructions first and fallback to search or bash commands only when encountering information that does not match what is documented here.**

Xylem is Gordon Beeming's personal blog built with Next.js 15.3.3, React 19.1.0, TypeScript, Contentlayer2, and TailwindCSS. The site features a comprehensive blog with MDX content processing, search functionality, RSS feeds, theme switching, and automated deployment via GitHub Actions.

## Essential Setup & Dependencies

**NEVER skip these setup steps - all subsequent commands will fail without them:**

```bash
# Install Node.js and pnpm (if not available)
npm install -g pnpm
```

```bash
# Install all project dependencies - takes 2-3 minutes
pnpm install
```

## Core Development Workflow

### Building the Application
```bash
# Production build - takes 1-2 minutes. NEVER CANCEL - set timeout to 5+ minutes
pnpm run build
```
**Build Details:**
- ⏱️ Takes approximately 1 minute 15 seconds
- Processes 150 blog posts via Contentlayer2
- Generates static pages (688 total including dynamic routes)
- Creates RSS feeds and search index
- Copies images from blog posts to public directory
- **NEVER CANCEL** - Always wait for completion

### Development Server
```bash
# Start development server - ready in 3-4 seconds
pnpm run dev
```
- Runs on http://localhost:3000
- Hot reload enabled
- Contentlayer processes MDX files automatically
- Ready in approximately 3 seconds

### Code Quality & Linting
```bash
# Lint code - takes 3-4 seconds
pnpm run lint
```
- Uses ESLint with Next.js configuration
- Automatically fixes issues when possible
- **ALWAYS run before committing changes**

## Manual Validation Requirements

**CRITICAL:** After making any changes, ALWAYS test these user scenarios:

### Essential User Flows to Test:
1. **Homepage Load:** Visit http://localhost:3000 - verify recent posts display
2. **Blog Navigation:** Click "Blog" - verify post listing with search and filters
3. **Search Functionality:** Use search bar - test with "rust" or "C#" queries
4. **Theme Switching:** Click theme switcher - test Light/Dark/System modes
5. **Post Reading:** Click any blog post - verify content renders correctly
6. **Tag Filtering:** Click any tag - verify filtered posts display
7. **Year Filtering:** Click year buttons - verify chronological filtering

### Validation Commands:
```bash
# Test homepage functionality
curl -s http://localhost:3000 | grep -q "Gordon Beeming" && echo "Homepage OK"

# Verify build artifacts exist
ls -la .next/static/ && echo "Build artifacts present"
```

## Key Architecture Components

### Content Management:
- **Blog Posts:** `data/blog/` - MDX files with frontmatter
- **Authors:** `data/authors/` - Author profiles in MDX
- **Configuration:** `data/siteMetadata.js` - Site-wide settings

### Processing Pipeline:
- **Contentlayer2:** Processes MDX → JSON at build time
- **RSS Generation:** `scripts/rss.mjs` - Creates feeds for all content and tags
- **Image Processing:** Copies blog images to `public/images/`
- **Search Index:** Generates JSON for kbar search functionality

### Build Artifacts:
- **Static Pages:** `.next/static/` - Pre-generated pages
- **Search Data:** `public/search.json` - Search index
- **Tag Data:** `src/app/tag-data.json` - Tag counts
- **Year Data:** `src/app/year-data.json` - Year-based counts

## Docker & Deployment

**⚠️ LIMITATION:** Docker builds fail in sandboxed environments due to certificate issues with npm registry. Document as "Docker builds require direct internet access without proxy/firewall restrictions."

### GitHub Actions Pipeline:
- **Trigger:** Push to `main`, `preview`, or `copilot/*` branches
- **Build Time:** Approximately 3-5 minutes in CI
- **Deployment:** Automated to preview and production environments
- **Pipeline File:** `.github/workflows/build-publish.yml`

## Common Development Tasks

### Adding New Blog Posts:
```bash
# Create new post
mkdir -p data/blog/$(date +%Y-%m-%d)/
touch data/blog/$(date +%Y-%m-%d)/post-title.mdx
```

### Testing Content Changes:
```bash
# After editing any MDX content, restart dev server to see changes
# Contentlayer will automatically regenerate content
pnpm run dev
```

### Pre-Commit Checklist:
```bash
# ALWAYS run these commands before committing
pnpm run lint
pnpm run build
# Test manually in browser
```

### UI/UX Changes Requirements:
**CRITICAL:** When making any UI element changes, ALWAYS include Lighthouse performance and accessibility results in the PR description:

1. **Run Lighthouse Analysis:**
   - Test both desktop and mobile versions
   - Include Performance, Accessibility, Best Practices, and SEO scores
   - Take screenshots of the results
   - Test key pages: homepage, blog post pages, blog listing

2. **Include in PR Description:**
   ```markdown
   ## Lighthouse Results
   
   ### Homepage
   - Performance: XX/100
   - Accessibility: XX/100  
   - Best Practices: XX/100
   - SEO: XX/100
   
   ### Blog Post Page
   - Performance: XX/100
   - Accessibility: XX/100
   - Best Practices: XX/100
   - SEO: XX/100
   
   [Screenshots of Lighthouse results]
   ```

3. **Accessibility Testing:**
   - Run axe DevTools scans on modified pages
   - Ensure WCAG 2.1 AA compliance (4.5:1 contrast ratio minimum)
   - Test keyboard navigation and screen reader compatibility
   - Verify all interactive elements have proper focus indicators

## Important File Locations

### Configuration Files:
- `next.config.mjs` - Next.js configuration with Contentlayer
- `contentlayer.config.ts` - Content processing configuration
- `data/siteMetadata.js` - Site metadata and settings
- `tsconfig.json` - TypeScript configuration

### Key Directories:
- `src/app/` - Next.js app router pages
- `src/components/` - Reusable React components
- `src/layouts/` - Page layout components
- `data/blog/` - Blog post content (MDX)
- `public/` - Static assets and generated files

### Generated Files (DO NOT EDIT):
- `.contentlayer/` - Generated content data
- `src/app/tag-data.json` - Tag statistics
- `src/app/year-data.json` - Year-based post counts
- `public/search.json` - Search index
- `public/feed.xml` - RSS feed

## Troubleshooting

### Common Issues:

**Build Failures:**
- Ensure `pnpm install` completed successfully
- Check for missing dependencies in package.json
- Verify Node.js version compatibility (requires Node 20+)

**Content Not Updating:**
- Restart development server after MDX changes
- Check Contentlayer console output for processing errors
- Verify frontmatter format in MDX files

**Search Not Working:**
- Ensure search index was generated during build
- Check `public/search.json` exists and contains data

## Environment Requirements

- **Node.js:** v20.19.4+ (tested version)
- **Package Manager:** pnpm (required, not npm or yarn)
- **Memory:** Sufficient for processing 150+ blog posts
- **Network:** Direct internet access for dependency installation

## Performance Expectations

- **Cold Start:** First `pnpm install` takes ~2-3 minutes
- **Clean Build:** `pnpm run build` takes ~1-2 minutes
- **Development Server:** Ready in ~3 seconds
- **Hot Reload:** Instant for most changes
- **Linting:** ~3 seconds

**Remember: NEVER CANCEL long-running operations. This application processes extensive content and requires time to complete builds properly.**