# Daily blog publisher

## Scheduled task settings

Create this as a standalone local task in the ChatGPT or Codex desktop app. Select the local Xylem project and schedule it for every day at 09:30 in `Australia/Brisbane`.

## Task prompt

Use only the existing worktree-only Shunt siding at `/Users/gordonbeeming/Developer/github/gordonbeeming/.shunt-dev/xylem/blog-publisher/src`. Read its `AGENTS.md`, `CLAUDE.md`, the `global:git-usage` skill, and the `git-workflow:pull-request` skill before any source-control operation. Never create or start a Shunt guest. Never work in or modify the GitButler host checkout. In particular, do not touch its unrelated `public/images/dkim-recovery-4.png` edit.

Require the siding's ignored `.env` to be a symlink to the registration checkout's existing `.env`. Never copy that file, read or print its values, stage it, or commit it. If the symlink is missing, points elsewhere, or is not ignored, stop and report the setup problem.

Run `pnpm blog:state:init`, then run `pnpm blog:publisher:reconcile` before any sync, rebase, or clean-branch check. Route the run from its JSON result:

- If it reports a prepared transaction awaiting finalization, inspect the siding read-only and resume that transaction or its matching pull request using the stable publication marker. The intended publication changes make the siding dirty until the pull request flow handles them. Skip sync, rebase, status, and prepare. Continue at the first incomplete pull request, deployment, or live-verification gate. Never reset the changes, prepare another post, create a second pull request, or repeat the publication move.
- If it reports an incomplete `preparing` transaction or any malformed or mismatched state, stop for manual inspection. Do not sync, clean, reset, or create another publication.
- If it reports a finalized transaction, let reconciliation apply or verify the matching queue update first. Only after that succeeds may the run continue toward the next queued item.
- If it reports no transaction, continue with the new-publication path.

For the new-publication path, including the path after a finalized transaction is reconciled, inspect the siding with read-only status checks. Use the Shunt source-control route to fetch and rebase the publication branch onto `origin/main`. Require a clean `gb/shunt/blog-publisher` branch before running status or prepare. Never use raw Git for a source-control write in this siding.

Run `pnpm blog:publisher:status -- --date <today-in-Australia/Brisbane>`. Treat an empty queue or a date before `nextPublishOn` as a successful no-op. Stop on malformed state, a changed queue head, a missing draft, an unexpected dirty file, or any other failed gate.

When status returns one action, run `pnpm blog:publisher:prepare -- --date <today-in-Australia/Brisbane> --repo /Users/gordonbeeming/Developer/github/gordonbeeming/.shunt-dev/xylem/blog-publisher/src`. Handle no more than that one post. Read the transaction JSON and keep its publication marker, expected files, expected public URL, and queue head for every later check.

Run `pnpm lint:blog-automation` as the automation-code lint gate, then run `pnpm build:tina` as the content and site gate. `build:tina` matches deployment and regenerates the ignored Tina client needed in a fresh siding. Inspect the static output for the exact article route, blog index, RSS feed, Atom feed, JSON feed, and sitemap references promised by the transaction. If either gate fails, leave the queue unchanged and stop.

Invoke `$git-workflow:pull-request` for the prepared transaction. Follow its full personal-tier flow. Require a signed commit, verify the pull request diff contains only the transaction's intended files, request the configured reviews, resolve feedback, and wait for all checks on the current head SHA. Never force push, use an admin merge, bypass signing, or create an unsigned fallback. A signing, CI, review, merge, or policy failure leaves the queue unchanged.

After the squash merge, wait for the GitHub Pages run tied to the merge SHA. Require a successful deployment. Use headless Playwright, without Computer Use or any focus-taking automation, to verify the exact live article, the blog index entry, and the article's presence in the RSS feed, Atom feed, JSON feed, and sitemap. Check the expected title, date, canonical URL, page errors, and HTTP success. A deployment or live-verification failure leaves the queue unchanged.

Only after every check succeeds, run `pnpm blog:publisher:finalize -- --date <today-in-Australia/Brisbane> --merge-sha <verified-merge-sha> --live-url <verified-live-url>`. Finalization must match the active transaction and queue head. It removes exactly one queued post and computes the next publication date using the cadence that exists at that moment.

On any retry, begin with reconciliation and resume the matching transaction or pull request. Never infer success because a draft moved or disappeared. Report the queue decision, publication marker, pull request, signed commit, merge SHA, current-SHA checks, Pages run, live URL, finalized queue head, and next publication date. If the run stops early, report the failed gate and confirm that the queue was not changed.
