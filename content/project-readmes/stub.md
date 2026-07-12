---
title: "Stub"
fetchedAt: 2026-07-11
sourceRepo: GordonBeeming/stub
sourceBranch: main
---

# stub

Short links and burn notes. Single-tenant, passkey auth, runs on Cloudflare's free tier.

Only the email you configure can log in. Notes are encrypted in your browser before they leave it — the server never sees the key. Fork it to run your own copy.

## What's in the box

- `apps/app` — Next.js App Router app deployed to a Cloudflare Worker via `@opennextjs/cloudflare`. Hosts the app itself at `/` plus the marketing pages at `/stub/*`.
- `packages/design-system` — shared React components, tokens, Tailwind preset. Dark mode only. See `DESIGN.md`.
- `apps/app/migrations/` — D1 schema.
- `DESIGN.md` / `CLAUDE.md` — source of truth for design and agent workflow.

## Prerequisites

- Node 20+
- pnpm 9+
- A Cloudflare account with Workers, D1, KV, and Turnstile access. R2 is optional — it only powers nightly JSONL backups, which you can skip or enable later (see `/stub/setup`).
- A Resend account for magic-link email (or swap the `sendMagicLink` adapter in `apps/app/lib/email.ts`)
- A domain on Cloudflare with a sub-domain you can point at the Worker (the included `wrangler.example.toml` assumes `stub.gordonbeeming.com`)

## Fork and deploy

```bash
# 1. fork and clone
gh repo fork GordonBeeming/stub --clone
cd stub
pnpm install

# 2. copy the wrangler template and fill in IDs
cp apps/app/wrangler.example.toml apps/app/wrangler.toml

# 3. provision Cloudflare resources (one command per)
cd apps/app
npx wrangler d1 create stub                             # note the database_id
npx wrangler kv namespace create SESSIONS               # note the id
npx wrangler kv namespace create RATE_LIMIT             # note the id
# paste the IDs into wrangler.toml
# Optional: enable R2 for nightly backups. Requires a payment method on the
# Cloudflare account even though free tier covers a personal workload.
# See /stub/setup for the full walkthrough.

# 4. apply the D1 schema
npx wrangler d1 migrations apply DB --remote

# 5. set secrets
npx wrangler secret put SESSION_SECRET                  # >= 32 random bytes
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put IP_HASH_SALT

# 6. edit wrangler.toml vars for your setup
#    OWNER_EMAIL, RESEND_FROM, SITE_URL, TURNSTILE_SITE_KEY

# 7. build and ship — one chained script so .open-next/ stays consistent
pnpm --filter @stub/app cf:deploy
# add the route in the Cloudflare dashboard pointing your subdomain at the Worker
```

First login: visit `/login`, enter your `OWNER_EMAIL`, click the magic link, enroll a passkey. From there the magic link stays around only as a recovery path.

## Local dev

```bash
pnpm dev                                     # runs apps/app in Next dev mode
pnpm --filter @stub/app cf:preview           # opennext preview against real bindings
```

Put local-only secrets in `apps/app/.dev.vars` (see `.dev.vars.example`).

## Marketing proxy

`gordonbeeming.com/stub` is proxied to this Worker by the sibling `cloudflare-xylem-worker` repo. Any direct hit to `stub.gordonbeeming.com/stub*` is 301'd back to `gordonbeeming.com/stub*` by `apps/app/middleware.ts`, so there's one canonical URL for the marketing pages.

If you're forking for yourself, either drop the marketing routes or swap the host/proxy for your own setup.

## Single-tenant rules

- `OWNER_EMAIL` gates every write. The magic-link endpoint won't send anything unless the submitted address matches, and the response is identical in both cases so the endpoint can't be used to enumerate the owner address.
- Secret notes are encrypted in the browser with WebCrypto (AES-GCM). The server only ever sees ciphertext. The decryption key lives in the URL fragment (`#k=...`) and never hits the server.
- There's no registration flow for anyone else. If you want a co-owner, add them in the code.

## Scripts

| Command | Does |
|---|---|
| `pnpm build` | Builds every workspace in dependency order |
| `pnpm typecheck` | `tsc --noEmit` across the monorepo |
| `pnpm lint` | ESLint across the monorepo |
| `pnpm format` | Prettier write |
| `pnpm --filter @stub/app cf:deploy` | Build + deploy the Worker |
| `pnpm --filter @stub/app db:migrate:remote` | Apply D1 migrations to Cloudflare |

## License

MIT. See `LICENSE`.
