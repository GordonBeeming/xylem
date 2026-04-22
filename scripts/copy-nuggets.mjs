import { existsSync, mkdirSync, readdirSync, copyFileSync, unlinkSync, statSync } from 'fs';
import path from 'path';

const contentDir = './content/nuggets';
const publicDir = './public/nuggets';

// Preserve _resize.js (owned by this repo, not by per-nugget content) while
// clearing out stale nugget HTML from previous builds.
const PRESERVE = new Set(['_resize.js']);

if (existsSync(publicDir)) {
  for (const file of readdirSync(publicDir)) {
    if (PRESERVE.has(file)) continue;
    try { unlinkSync(path.join(publicDir, file)); } catch (e) { console.error(e); }
  }
} else {
  mkdirSync(publicDir, { recursive: true });
}

if (!existsSync(contentDir)) {
  console.log(`No ${contentDir} directory found; skipping nugget copy.`);
  process.exit(0);
}

let copied = 0;
for (const entry of readdirSync(contentDir)) {
  const src = path.join(contentDir, entry);
  if (!statSync(src).isFile()) continue;
  if (!entry.endsWith('.html')) continue;
  const dest = path.join(publicDir, entry);
  copyFileSync(src, dest);
  copied += 1;
}

console.log(`Copied ${copied} nugget(s) from ${contentDir} to ${publicDir}`);
