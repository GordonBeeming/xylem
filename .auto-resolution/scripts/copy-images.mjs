import { existsSync, mkdirSync, readdirSync, copyFileSync, unlinkSync } from 'fs';
import path from 'path';

const contentDir = './content/blog';
const publicDir = './public/images';

// Clean and recreate public/images
if (existsSync(publicDir)) {
  readdirSync(publicDir).forEach(file => {
    try { unlinkSync(path.join(publicDir, file)); } catch (e) { console.error(e); }
  });
} else {
  mkdirSync(publicDir, { recursive: true });
}

// Walk content/blog directories
const scannedDirs = new Set();
function walkDir(dir) {
  if (!existsSync(dir)) return;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'images' && !scannedDirs.has(fullPath)) {
        scannedDirs.add(fullPath);
        const imageFiles = readdirSync(fullPath);
        for (const imageFile of imageFiles) {
          const src = path.join(fullPath, imageFile);
          const dest = path.join(publicDir, imageFile);
          if (existsSync(dest)) {
            console.error(`Duplicate: ${dest}`);
            throw new Error(`Duplicate image: ${imageFile}`);
          }
          copyFileSync(src, dest);
        }
      } else {
        walkDir(fullPath);
      }
    }
  }
}

walkDir(contentDir);
console.log(`Copied images from ${scannedDirs.size} directories to ${publicDir}`);
