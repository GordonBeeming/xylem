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

## CLI Task Documentation

When creating documentation files (MD files) during CLI tasks, follow these guidelines to avoid unnecessary documentation noise:

### When to Create New Documentation

**DO create new documentation for**:
- Significant architectural changes or new features
- Major refactorings that affect multiple modules
- New patterns or conventions being established
- Implementation guides that will be referenced by others
- Complex changes that need detailed explanation for future reference

**DO NOT create new documentation for**:
- Minor bug fixes or corrections
- Small adjustments to existing code
- Clarifications or improvements to existing implementations
- Changes that can be adequately explained in commit messages

**When unsure**: Ask if documentation should be created before writing it. It's better to update existing documentation than create redundant files.

### Documentation File Naming Format
All documentation files created during CLI tasks should be saved to `docs/cli-tasks/` with the following format:

```
yyyyMMdd-II-XX-description.md
```

Where:
- `yyyyMMdd` = Current date (e.g., 20251002)
- `II` = Author's initials from git config (e.g., GB for Gordon Beeming)
- `XX` = Sequential number starting at 01 for the day (01, 02, 03, etc.)
- `description` = Kebab-case description of the task/document

### Examples
- `20251002-GB-01-graceful-row-failure-implementation-summary.md`
- `20251002-GB-02-graceful-row-failure-refactoring-guide.md`
- `20251002-GB-03-graceful-row-failure-changes-summary.md`

### Process
1. **Determine if documentation is needed** - Is this a significant change?
2. Get current date: `date +%Y%m%d`
3. Get author initials from git config: `git config user.name`
4. Check existing files in `docs/cli-tasks/` for today's date to determine next sequence number
5. **Check if existing documentation should be updated instead** of creating new
6. Create file with proper naming format only if genuinely needed
7. If multiple related documents, use sequential numbers to maintain order

### Updating Existing Documentation

Prefer updating existing documentation when:
- The change is related to a recent task documented today
- It's a bug fix or improvement to something recently implemented
- It adds clarification or correction to existing docs
- The change is minor and fits within the scope of existing documentation

### Purpose
This approach:
- Reduces documentation noise and clutter
- Keeps related information together
- Makes documentation easier to navigate and maintain
- Ensures only significant changes are documented separately
- Maintains high signal-to-noise ratio in documentation

## Git Commit Guidelines

### Commit Frequently
Commit changes incrementally as you complete logical units of work.

**Why commit frequently:**
- ✅ Creates small, focused commits that are easy to review and understand
- ✅ Enables vertical slicing - each commit represents a single logical change
- ✅ Avoids one giant commit at the end of a session with dozens of unrelated changes
- ✅ Makes it easier to track progress and document work in task documentation
- ✅ Allows reverting specific changes without losing other work
- ✅ Provides clear checkpoints during development

**When to commit:**
- ✅ After adding a new feature or component
- ✅ After fixing a bug
- ✅ After updating documentation (including task documentation in `docs/cli-tasks/`)
- ✅ After refactoring code
- ✅ Before making major changes (safety checkpoint)
- ✅ After successful test runs

**Exception:** Do not commit when working on the `gitbutler/workspace` branch - GitButler manages commits on this branch.

### Commit Message Format
Follow conventional commit format:

```
[Type]: Brief description

Examples:
- feat: Add recipe search functionality
- fix: Correct dark mode toggle behavior
- docs: Update Tina CMS setup guide
- refactor: Simplify recipe card component
- style: Fix accessibility contrast issues
- test: Add keyboard navigation tests
```

### Co-Author Attribution

**ALWAYS add the requester as a co-author on commits** to ensure proper attribution.

**How to identify the requester:**
1. **Git config**: Check `git config user.name` and `git config user.email`
2. **GitHub user**: If running in GitHub Codespaces, use the logged-in GitHub user
3. **GitHub Actions**: When triggered by a comment/issue, use the comment author's details
4. **Manual request**: When someone asks you to make changes, use their information

**Co-Author Format:**
```bash
git commit -m "Type: Brief description

Co-authored-by: Name <email@example.com>"
```

**Example:**
```bash
git commit -m "feat: Add authentication module

Co-authored-by: Gordon Beeming <me@gordonbeeming.com>"
```

**Multiple co-authors:**
```bash
git commit -m "feat: Add authentication module

Co-authored-by: Gordon Beeming <me@gordonbeeming.com>
Co-authored-by: Daniel Mackay <daniel@example.com>"
```

**When to add co-authors:**
- ✅ When implementing a requested feature
- ✅ When fixing a reported bug
- ✅ When making changes based on feedback
- ✅ When pair programming or collaborating
- ❌ Not needed for automated updates (dependency bumps, etc.)
- ❌ Not needed for your own self-initiated refactoring (unless requested)

## Working Directory and File Management

### Repository Boundaries
All work, including temporary files, must be done within the repository boundaries:

**DO**:
- Create temporary files/directories within the repository root
- Use `/tmp/` directory at repository root for temporary work files
- Add temporary directories to `.gitignore` if they shouldn't be committed
- Clean up temporary files after completing tasks

**DO NOT**:
- Create files outside the repository directory
- Work in system temp directories or home directory
- Leave temporary files scattered throughout the repository

### Temporary Files
- Use `/tmp/` at the repository root for scratch work
- This directory is already in `.gitignore`
- Always clean up temporary files when done
- Document any temporary files that need to persist

### Purpose
This approach:
- Keeps all work contained within the project
- Prevents pollution of system directories
- Makes cleanup easier and more predictable
- Ensures proper git ignore handling
