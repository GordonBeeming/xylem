---
name: refresh-projects
description: |
  Refresh the committed README snapshots and downloaded images that back the
  /projects/<slug> detail pages. Use when Gordon runs /refresh-projects, says
  "refresh project readmes", "update the project READMEs", or "pull the
  latest README for <project>". Also worth suggesting before a projects-page
  release if any content/project-readmes/*.md file is more than a week old.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Skill
---

# /refresh-projects — refresh project README snapshots

You are refreshing the README content and images behind Gordon's `/projects/<slug>`
detail pages on https://gordonbeeming.com. Each project's `github` URL (in
`content/projects/<slug>.json`) has its README fetched, rewritten, and
committed as `content/project-readmes/<slug>.md`, with any relative images
downloaded into `public/assets/projects/<slug>/`. The detail pages read these
committed files directly; nothing is fetched live at request time.

This skill **only runs in Gordon's `xylem` blog repo** at
`/Users/gordonbeeming/Developer/github/gordonbeeming/xylem`. Bail out if you
are anywhere else.

## 1. Run the fetch script

The heavy lifting is `scripts/refresh-project-readme.mjs`, a dependency-free
Node script (built-ins, `fetch`, and regex only). It talks to the GitHub API,
so set `GITHUB_TOKEN` if you have one handy (`gh auth token`) to dodge the
unauthenticated rate limit; it works fine without one too, just slower to
hit the limit.

- **Default (no args)**: processes every project in `content/projects/`,
  skipping any whose README snapshot is less than 7 days old:
  ```
  node scripts/refresh-project-readme.mjs
  ```
- **One project**: pass the slug, the JSON filename minus `.json`:
  ```
  node scripts/refresh-project-readme.mjs claude-bar
  ```
- **Force a refresh** even if the snapshot is fresh by adding `--force`
  (works with or without a slug):
  ```
  node scripts/refresh-project-readme.mjs claude-bar --force
  ```

Each project prints one status line (`refreshed`, `skipped (fresh)`,
`no readme`, `no github`, or `error: <reason>`), then a tally at the end.

## 2. If there's nothing to refresh

If the run reports `RESULT: nothing-to-refresh` (exit code 3), every
candidate was skipped because its snapshot is still within the 7-day
freshness window. **Don't report the run as done** — that result means the
script did nothing, not that everything is already up to date the way Gordon
asked. Ask him directly whether to force a refresh, either all projects or a
specific slug, or leave it as is, and wait for his answer before going
further.

## 3. Verify the rewritten output

For every project the script reported `refreshed`, check its work before
moving on:

- Read `content/project-readmes/<slug>.md` and confirm every
  `/assets/projects/<slug>/...` reference in the body resolves to a real file
  under `public/assets/projects/<slug>/`. The script only ever writes files
  it successfully downloaded, so a reference with no matching file means the
  download failed; check the run output for an `image not downloaded:` note
  on that project.
- Spot-check any rewritten `github.com/<owner>/<repo>/blob/<branch>/...`
  links. The owner/repo should match the project's `github` field, and the
  branch should look like a real branch name, not `undefined` or empty.

Flag anything that doesn't hold up rather than pushing ahead.

## 4. Visual QA on the detail pages

Follow the standard Playwright visual-QA loop for every project that was
actually refreshed. `file://` URLs are blocked in the Playwright MCP, and the
detail pages need the Next.js dev server running to render, so start it
yourself with `pnpm dev` (or ask Gordon to, if you're not meant to run the
dev server in this context) and drive the MCP's browser tools
(`mcp__plugin_playwright_playwright__browser_navigate`,
`browser_take_screenshot`, `browser_resize`, etc.; load them via ToolSearch
first if they're deferred) against `http://localhost:3000/projects/<slug>`.

For each affected slug, in both light and dark mode:

- Full-page screenshot, then zoom into the README body: code blocks, inline
  images, badges.
- Confirm every image actually loads (no broken-image icon).
- Check for text overlap, clipped content, or contrast issues, same bar as
  any other artifact QA.

Delete screenshots after you're done with them — don't leave them lying
around in the working directory.

## 5. This skill does not commit

`content/project-readmes/**` and `public/assets/projects/**` are generated,
committed content, but committing them is Gordon's call. Once verification
and QA pass, tell him what changed and let the normal GitButler flow (or his
explicit instruction) commit it — don't commit on his behalf from inside this
skill.

## Guardrails

- **Never hand-edit a `content/project-readmes/<slug>.md` file.** It's
  regenerated output; the source of truth is the upstream repo's README. If
  something in it looks wrong, fix it upstream and re-run the script, or fix
  the rewrite logic in `scripts/refresh-project-readme.mjs`.
- **A project with no `github` field is header-only by design** (currently
  `pullup` and `shunt`). `no github` in the script's output is expected for
  those — don't try to force a README onto them.
- **A project whose repo has no README** reports `no readme` and is skipped;
  its detail page simply renders without a README section.
