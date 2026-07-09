import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const BLOG_DIR = './content/blog';
const OUTPUT_DIR = './public/og';
const AVATAR_PATH = './public/static/images/avatar.jpg';

const SLATE_950 = '#0b1120';
const ACCENT = '#0e7490';
const ACCENT_LIGHT = '#67e8f9';
const SLATE_400 = '#94a3b8';
const BORDER_STRONG = '#263250';
const TEXT = '#e8eef6';

function walkDir(dir) {
  const results = [];
  if (!existsSync(dir)) return results;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else if (entry.isFile() && /\.mdx?$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function parsePost(filePath) {
  const raw = readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  if (!data.title || !data.date) return null;
  if (data.draft === true) return null;

  const slug = path.relative(BLOG_DIR, filePath).replace(/\.mdx?$/, '');
  const rt = readingTime(content);
  const date = new Date(data.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return {
    title: data.title,
    tags: Array.isArray(data.tags) ? data.tags.slice(0, 2) : [],
    readingTime: rt.text,
    date,
    slug,
  };
}

// Resolve the current woff/ttf URL for a Google Font weight from its CSS2 endpoint
async function resolveGoogleFontUrl(family, weight) {
  const resp = await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const css = await resp.text();
  const match = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/);
  if (!match) throw new Error(`Could not resolve ${family} ${weight} URL from Google Fonts`);
  return match[1];
}

async function fetchFont(family, weight) {
  const url = await resolveGoogleFontUrl(family, weight);
  const resp = await fetch(url);
  return Buffer.from(await resp.arrayBuffer());
}

const [spaceGroteskBold, spaceGroteskMedium, plexMono] = await Promise.all([
  fetchFont('Space+Grotesk', 700),
  fetchFont('Space+Grotesk', 500),
  fetchFont('IBM+Plex+Mono', 400),
]);

const avatarData = readFileSync(AVATAR_PATH);
const avatarDataUri = `data:image/jpeg;base64,${avatarData.toString('base64')}`;

const files = walkDir(BLOG_DIR);
const posts = files.map(parsePost).filter(Boolean);

mkdirSync(OUTPUT_DIR, { recursive: true });

let generated = 0;

for (const post of posts) {
  const outputPath = path.join(OUTPUT_DIR, `${post.slug}.png`);
  const outputDir = path.dirname(outputPath);
  mkdirSync(outputDir, { recursive: true });

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: `radial-gradient(120% 140% at 100% 0%, rgba(14,116,144,0.16), rgba(11,17,32,0) 55%), ${SLATE_950}`,
          color: TEXT,
          fontFamily: 'Space Grotesk',
        },
        children: [
          // vessel channel motif — vertical accent line + two nodes on the right
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '-80px',
                right: '150px',
                bottom: '-80px',
                width: '2px',
                background: `linear-gradient(180deg, rgba(11,17,32,0), rgba(14,116,144,0.5), rgba(11,17,32,0))`,
              },
            },
          },
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '150px',
                right: '143px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: ACCENT,
                boxShadow: `0 0 0 6px ${SLATE_950}`,
              },
            },
          },
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '360px',
                right: '143px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: ACCENT,
                opacity: 0.5,
                boxShadow: `0 0 0 6px ${SLATE_950}`,
              },
            },
          },

          // top row — wordmark + content kind
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em' },
                    children: [
                      { type: 'span', props: { style: { color: ACCENT }, children: 'xylem' } },
                      { type: 'div', props: { style: { width: '2px', height: '22px', background: BORDER_STRONG } } },
                      { type: 'span', props: { children: 'Gordon Beeming' } },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontFamily: 'IBM Plex Mono',
                      fontSize: 15,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: ACCENT_LIGHT,
                    },
                    children: 'Blog · Post',
                  },
                },
              ],
            },
          },

          // title
          {
            type: 'div',
            props: {
              style: {
                fontSize: post.title.length > 60 ? 52 : 72,
                lineHeight: 1.05,
                letterSpacing: '-0.035em',
                fontWeight: 700,
                maxWidth: '780px',
              },
              children: post.title,
            },
          },

          // bottom row — avatar, name/meta, tags
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', gap: '20px' },
              children: [
                {
                  type: 'img',
                  props: {
                    src: avatarDataUri,
                    width: 68,
                    height: 68,
                    style: {
                      borderRadius: '50%',
                      boxShadow: `0 0 0 2px ${SLATE_950}, 0 0 0 4px ${ACCENT}`,
                      objectFit: 'cover',
                    },
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column', gap: '4px' },
                    children: [
                      { type: 'div', props: { style: { fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }, children: 'Gordon Beeming' } },
                      {
                        type: 'div',
                        props: {
                          style: { fontFamily: 'IBM Plex Mono', fontSize: 15, letterSpacing: '0.04em', color: SLATE_400 },
                          children: `${post.date} · ${post.readingTime}`,
                        },
                      },
                    ],
                  },
                },
                post.tags.length > 0
                  ? {
                      type: 'div',
                      props: {
                        style: { display: 'flex', gap: '10px', marginLeft: 'auto' },
                        children: post.tags.map((tag) => ({
                          type: 'div',
                          props: {
                            style: {
                              fontFamily: 'IBM Plex Mono',
                              fontSize: 14,
                              padding: '6px 14px',
                              borderRadius: '999px',
                              background: 'rgba(14,116,144,0.14)',
                              color: ACCENT_LIGHT,
                            },
                            children: tag.trim(),
                          },
                        })),
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Space Grotesk', data: spaceGroteskBold, weight: 700, style: 'normal' },
        { name: 'Space Grotesk', data: spaceGroteskMedium, weight: 500, style: 'normal' },
        { name: 'IBM Plex Mono', data: plexMono, weight: 400, style: 'normal' },
      ],
    }
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });
  const pngData = resvg.render().asPng();
  writeFileSync(outputPath, pngData);
  generated++;
}

console.log(`Generated ${generated} OG images to ${OUTPUT_DIR}`);
