import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const BLOG_DIR = './content/blog';
const OUTPUT_DIR = './public/og';

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

  const date = data.date instanceof Date ? data.date : new Date(data.date);
  if (date > new Date()) return null;

  const slug = path.relative(BLOG_DIR, filePath).replace(/\.mdx?$/, '');
  const rt = readingTime(content);
  return {
    title: data.title,
    tags: Array.isArray(data.tags) ? data.tags.slice(0, 4) : [],
    readingTime: rt.text,
    slug,
  };
}

// Fetch Inter font
// Resolve the current Inter 700 URL from Google Fonts CSS
async function resolveInterFontUrl() {
  const resp = await fetch('https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap', {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const css = await resp.text();
  const match = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/);
  if (!match) throw new Error('Could not resolve Inter font URL from Google Fonts');
  return match[1];
}

const fontUrl = await resolveInterFontUrl();
const fontResponse = await fetch(fontUrl);
const fontData = await fontResponse.arrayBuffer();

const files = walkDir(BLOG_DIR);
const posts = files.map(parsePost).filter(Boolean);

mkdirSync(OUTPUT_DIR, { recursive: true });

let generated = 0;

for (const post of posts) {
  const outputPath = path.join(OUTPUT_DIR, `${post.slug}.png`);
  const outputDir = path.dirname(outputPath);
  mkdirSync(outputDir, { recursive: true });

  const title = post.title;
  const tags = post.tags;
  const readingTimeText = post.readingTime;

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
          background: 'linear-gradient(135deg, #0063B2 0%, #004E8C 50%, #003A6B 100%)',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '24px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: title.length > 60 ? 40 : 52,
                      fontWeight: 700,
                      color: 'white',
                      lineHeight: 1.2,
                      maxWidth: '900px',
                    },
                    children: title,
                  },
                },
                readingTimeText
                  ? {
                      type: 'div',
                      props: {
                        style: { display: 'flex', alignItems: 'center', gap: '12px' },
                        children: {
                          type: 'div',
                          props: {
                            style: {
                              fontSize: 20,
                              color: 'rgba(255,255,255,0.7)',
                              background: 'rgba(255,255,255,0.1)',
                              padding: '6px 16px',
                              borderRadius: '20px',
                            },
                            children: readingTimeText,
                          },
                        },
                      },
                    }
                  : null,
                tags.length > 0
                  ? {
                      type: 'div',
                      props: {
                        style: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
                        children: tags.map((tag) => ({
                          type: 'div',
                          props: {
                            style: {
                              fontSize: 16,
                              color: '#46CBFF',
                              background: 'rgba(70,203,255,0.15)',
                              padding: '4px 14px',
                              borderRadius: '16px',
                              textTransform: 'uppercase',
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
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '40px',
                left: '80px',
                fontSize: 22,
                color: 'rgba(255,255,255,0.5)',
              },
              children: 'gordonbeeming.com',
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: Buffer.from(fontData),
          weight: 700,
          style: 'normal',
        },
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
