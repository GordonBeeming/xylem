import { existsSync, mkdirSync, readdirSync, copyFileSync, rmSync, statSync } from 'fs';
import path from 'path';

const contentDir = './content/nuggets';
// Raw nugget HTML lives under /_raw/<slug>/index.html so it:
//  1. Doesn't collide with Next's static-export output for /nuggets/[slug]
//     (Next writes out/nuggets/<slug>.html for the chromed page; same filename
//     at the top level would be overwritten and the iframe would embed the
//     chromed page → infinite iframe nesting).
//  2. Resolves at /nuggets/_raw/<slug> with no ".html" in the visible URL,
//     matching the extensionless style used elsewhere on the site (blog,
//     tags, years). The directory-with-index layout makes this work on any
//     static host — no reliance on host-specific extension stripping.
const publicDir = './public/nuggets/_raw';

if (existsSync(publicDir)) {
  rmSync(publicDir, { recursive: true, force: true });
}
mkdirSync(publicDir, { recursive: true });

if (!existsSync(contentDir)) {
  console.log(`No ${contentDir} directory found; skipping nugget copy.`);
  process.exit(0);
}

let copied = 0;
for (const entry of readdirSync(contentDir)) {
  const src = path.join(contentDir, entry);
  if (!statSync(src).isFile()) continue;
  if (!entry.endsWith('.html')) continue;
  const slug = entry.replace(/\.html$/, '');
  const destDir = path.join(publicDir, slug);
  mkdirSync(destDir, { recursive: true });
  copyFileSync(src, path.join(destDir, 'index.html'));
  copied += 1;
}

console.log(`Copied ${copied} nugget(s) from ${contentDir} to ${publicDir}/<slug>/index.html`);
