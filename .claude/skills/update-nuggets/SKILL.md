---
name: update-nuggets
description: |
  Generate or refresh sidecar YAML metadata for xylem nugget HTML files and
  inject the iframe resize shim. Use when Gordon runs /update-nuggets, says
  "update nuggets", "generate nugget metadata", or points at specific .html
  files in content/nuggets/. Also use before committing in xylem when any
  content/nuggets/*.html has no matching .yaml sidecar.
allowed-tools:
  - Bash
  - Read
  - Edit
  - Write
  - Glob
  - Grep
  - Skill
---

# /update-nuggets — generate nugget sidecars

You are preparing Gordon's standalone HTML "nugget" explainers for publication
on https://gordonbeeming.com/nuggets. Each nugget is a self-contained HTML
file at `content/nuggets/<slug>.html` with a sibling `<slug>.yaml` sidecar
that carries the title, date, summary, and tags used by the listing page and
search index.

This skill **only runs in Gordon's `xylem` blog repo** at
`/Users/gordonbeeming/Developer/github/gordonbeeming/xylem`. Bail out if you
are anywhere else.

## Scope — what files do I process?

Pick scope in this order:

1. **Explicit file args.** If the user specified one or more paths (e.g.
   `/update-nuggets content/nuggets/foo.html` or `/update-nuggets foo.html
   bar.html`), process exactly those files. Resolve relative paths against
   the xylem repo root.
2. **No args — uncommitted.** Run `git status --porcelain content/nuggets/`
   and collect every `.html` file in `?? `, `A `, ` M`, or `M ` state whose
   sibling `.yaml` is either missing or also unstaged/untracked. Skip any
   file that's fully committed and unchanged.
3. **Still nothing?** Report "No nuggets to update" and stop. Do not touch
   already-published nuggets unless asked.

## Per file — what do I do?

For each file in scope, in order:

### 1. Read the HTML

Use the `Read` tool. Fall back to `Bash` `head -200` if the file is huge —
you only need enough to pull metadata and locate `</body>`.

### 2. Determine existing sidecar state

- Look for `content/nuggets/<slug>.yaml`.
- If it exists, read it and treat every populated key as **immutable unless
  `--force` was passed**. You will only fill in missing keys.

### 3. Extract metadata

| Key | Source (in priority order) | Notes |
|---|---|---|
| `title` | `<title>...</title>` → `<h1>...</h1>` → first `<h2>` | Strip trailing site/brand suffixes like " · gordonbeeming.com". Trim whitespace. |
| `summary` | `<meta name="description" content="...">` → first substantive `<p>` inside `<main>`/`<article>`/`<body>`. | ≤ 200 characters. One sentence max. Must be human-readable prose (skip nav/footer boilerplate). |
| `tags` | Infer from the HTML content — `<h2>`/`<h3>` headings, prominent nouns, explicit `<meta name="keywords">` if present. | 1–5 tags. Lowercase, kebab-case, singular ("web-crypto" not "WebCrypto"). If you can't confidently pick any, emit `tags: []` and leave a note in the report. |
| `date` | Today's date (YYYY-MM-DD) if no existing sidecar date. Preserve existing date on refresh. | Use `date +%Y-%m-%d` via Bash. |

### 4. Humanize the summary

This is prose that will appear on the public listing page, so it is subject
to Gordon's content-writing rule. Before writing the sidecar, run the summary
through the `humanizer` skill via the Skill tool with the summary as input.
Take the humanized output as the final value.

Skip the humanizer pass for `title` and `tags` — they're labels, not prose.

### 5. Write the sidecar

YAML layout:

```yaml
title: "..."
date: YYYY-MM-DD
summary: "..."
tags:
  - tag-one
  - tag-two
```

Use double-quoted strings for `title` and `summary` to survive em dashes and
apostrophes. `date` is unquoted ISO. `tags` is a YAML list.

- **No sidecar existed** → write the full file.
- **Sidecar existed, non-`--force`** → use `Edit` to add only the missing
  keys. Never overwrite an existing value. If the current YAML is malformed,
  stop and report it — don't silently rewrite.
- **`--force`** → overwrite every key with the newly-extracted values.

### 6. Inject the iframe-resize shim

The nugget HTML itself needs to tell its parent page how tall to make the
iframe. That's done by `/nuggets/_resize.js` (served from the xylem public
directory). Check whether the shim is already present:

```bash
grep -F 'src="/nuggets/_resize.js"' content/nuggets/<slug>.html
```

- If the grep hits → leave the HTML alone.
- If it misses → use `Edit` to insert exactly one line immediately before
  `</body>`:

  ```html
  <script src="/nuggets/_resize.js" defer></script>
  ```

Match the existing indentation of the last line so it blends in.

This step is **idempotent** — the grep ensures re-running the skill never
produces duplicate `<script>` tags.

## Output

After processing every file, print a small table. Example:

```
Nugget                                       Sidecar    Shim      Notes
webcrypto-aes-gcm-explainer                  written    injected  3 tags inferred
redis-stream-consumer-groups-explainer       merged     present   date preserved
rtdb-permissions-audit                       skipped    -         existing YAML malformed — please review
```

Then remind Gordon in one line: _"Review the sidecars before committing. If
anything looks off, edit the `.yaml` directly or re-run with `--force` on the
specific file."_

## Guardrails

- **Do not commit.** This skill only edits files. Gordon commits himself (via
  GitButler) once he's reviewed the output.
- **Do not touch `public/nuggets/`.** The copy-nuggets build script mirrors
  `content/nuggets/` → `public/nuggets/`. Editing `public/` directly is a
  footgun — it gets clobbered on the next `pnpm dev`/`pnpm build`.
- **Never infer metadata from file name alone.** The HTML is the source of
  truth. If the HTML has no title, report that and stop processing that file
  — don't fabricate one from the slug.
- **Respect existing sidecars.** Only `--force` overrides prior user choices.
