import { existsSync, mkdirSync, readdirSync, copyFileSync, rmSync, statSync } from 'fs';
import path from 'path';

const contentDir = './content/nuggets';
// Raw nugget HTML is exposed at /nuggets/_raw/<slug>, backed by
// public/nuggets/_raw/<slug>/index.html. This keeps it:
//  1. Clear of collision with Next's static-export output for /nuggets/[slug]
//     (Next writes out/nuggets/<slug>.html for the chromed page; if the raw
//     file were at that same filename it would be overwritten and the iframe
//     would embed the chromed page → infinite iframe nesting).
//  2. Extensionless in the visible URL — matching blog, tags, years — with
//     no reliance on host-specific .html stripping, since the directory +
//     index.html layout resolves on any static host.
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
