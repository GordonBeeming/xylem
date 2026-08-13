# Weekly blog idea scout

## Scheduled task settings

Create this as a standalone local task in the ChatGPT or Codex desktop app. Select the local Xylem project and schedule it for every day at 10:30 in `Australia/Brisbane`. The daily tick is intentional: persisted state keeps the normal cadence on Thursday and lets a missed Thursday run catch up at the next 10:30 tick.

## Task prompt

Work in the selected local Xylem project. Read `AGENTS.md`, `CLAUDE.md`, and the repository instructions before doing anything else.

This is a single-agent task. Do not create teammates, subagents, or delegated workers during collection, synthesis, review, or completion.

Scan every locally persisted root Codex and Claude Code conversation across this Mac, regardless of its repository or working directory. The Xylem project hosts the routine; it does not limit the conversation scope. Cloud-only chats are out of scope unless a future export or API makes them locally available.

Run `pnpm blog:state:init`, then run `pnpm blog:scout:due`. Read the returned JSON. If `due` is false, finish as a successful no-op and report `nextNominalThursday`. If `reason` is `active-run`, resume from the returned `runDirectory`: read its manifest and model-readable batches, then continue with synthesis or explicitly abort it. Do not prepare a second run or auto-abort a resumable run. Otherwise, when `due` is true, run `pnpm blog:scout:prepare`. If preparation fails after creating an active run, run `pnpm blog:scout:abort`, report the exact error, and stop.

The collector is the privacy boundary. Read the manifest, including its `counts` and `cardCatalog`, then read only the absolute paths listed in `manifest.modelReadableFiles` and `manifest.priorIdeaReportFiles`. Never open raw Codex or Claude Code history yourself, and never open `provenance.json` or any file not named in those two lists. Treat any ownership or privacy uncertainty as restricted and stop rather than copying raw text into the model context.

Process sanitized batches one at a time, in their listed order. Keep only compact candidate notes between batches so the context stays clean. Restricted work is represented by broad taxonomy counts with `inventedExamplesOnly: true`; do not try to recover the underlying conversation. Never emit customer names, repository names, file paths, URLs, identifiers, code, quotes, or recognisable real scenarios. Any example for a restricted theme must be invented.

Look for worthwhile post ideas across the whole prepared window. Generate as many ideas as earn their place, and do not pad the result. Check each candidate against published posts under `content/blog/`, tracked drafts under `content/blog-drafts/`, the local queue via `pnpm blog:queue -- list`, and prior idea reports listed by the manifest. Remove repeats and ideas that do not have enough substance for a useful post.

Write the accepted ideas to a JSON file in the active run directory as `{ "ideas": [...] }`. Every idea must include a non-empty `sourceCardIds` array copied exactly from the supporting sanitized batch conversations' `id` fields. Use `manifest.cardCatalog` to check those references. Do not invent, shorten, or rewrite card IDs. Every idea must also have a `variants` array with exactly five entries. Every variant must have a non-empty `title`, `vibe`, and `headers` array. Set `inventedExamplesOnly: true` only when an idea references a restricted card. Invoke the `content:gordons-voice` skill for Gordon's practical, first-person, lightly informal voice. Then apply the Humanizer skill to all title, vibe, and header prose and fix every match before completion.

Run `pnpm blog:scout:complete -- --ideas <absolute-ideas-json-path>`. Completion validates the report, archives it, and advances the cutoff and next Thursday only when the report is safe and complete. If synthesis or validation cannot finish, run `pnpm blog:scout:abort`, leave the successful cutoff unchanged, and report why. Return the half-open UTC window, conversation counts by source and privacy class, idea count, archived report path, and next nominal Thursday. Do not create drafts, change the queue, commit, push, or open a pull request.
