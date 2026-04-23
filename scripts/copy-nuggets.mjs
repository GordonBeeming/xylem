import { existsSync, mkdirSync, readdirSync, copyFileSync, unlinkSync, statSync } from 'fs';
import path from 'path';

const contentDir = './content/nuggets';
// Raw nugget HTML lives under /_raw/ so it doesn't collide with Next's
// static-export output for the /nuggets/[slug] route. Next writes
// out/nuggets/<slug>.html for the chromed page; if the raw file were at the
// same path, Next's output would overwrite it during build and the iframe
// would end up embedding the chromed page — infinite iframe nesting.
const publicDir = './public/nuggets/_raw';

if (existsSync(publicDir)) {
  for (const file of readdirSync(publicDir)) {
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
