import { defineDocumentType, ComputedFields, makeSource } from 'contentlayer2/source-files'
import { writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync, unlinkSync } from 'fs'
import readingTime from 'reading-time'
import { slug } from 'github-slugger'
import path from 'path'
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
// Remark packages
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { remarkAlert } from 'remark-github-blockquote-alert'
import {
  remarkExtractFrontmatter,
  remarkCodeTitles,
  remarkImgToJsx,
  extractTocHeadings,
} from 'pliny/mdx-plugins/index.js'
// Rehype packages
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypeKatexNoTranslate from 'rehype-katex-notranslate'
import rehypeCitation from 'rehype-citation'
import rehypePresetMinify from 'rehype-preset-minify'
import rehypeExternalLinks from 'rehype-external-links'
import siteMetadata from './data/siteMetadata'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer.js'
import prettier from 'prettier'
import { visit } from 'unist-util-visit' // <-- ADD THIS IMPORT



const root = process.cwd()
const isProduction = process.env.NODE_ENV === 'production'

// heroicon mini link
const icon = fromHtmlIsomorphic(
  `
  <span class="content-header-link">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 linkicon">
  <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
  <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
  </svg>
  </span>
`,
  { fragment: true }
)

const computedFields: ComputedFields = {
  readingTime: { type: 'json', resolve: (doc) => readingTime(doc.body.raw) },
  slug: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath.replace(/^.+?(\/)/, ''),
  },
  path: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath,
  },
  filePath: {
    type: 'string',
    resolve: (doc) => doc._raw.sourceFilePath,
  },
  toc: { type: 'json', resolve: (doc) => extractTocHeadings(doc.body.raw) },
}

/**
 * Count the occurrences of all tags across blog posts and write to json file
 */
async function createTagCount(allBlogs) {
  const tagCount: Record<string, number> = {}
  allBlogs.forEach((file) => {
    if (file.tags && (!isProduction || file.draft !== true)) {
      file.tags.forEach((tag) => {
        const initialSlug = slug(tag);
        const formattedTag = initialSlug.replace(/--+/g, '-');
        if (formattedTag in tagCount) {
          tagCount[formattedTag] += 1
        } else {
          tagCount[formattedTag] = 1
        }
      })
    }
  })
  const sortedTags = Object.keys(tagCount).sort()
  const sortedTagCount = sortedTags.reduce((acc, key) => {
    acc[key] = tagCount[key]
    return acc
  }, {})
  const formatted = await prettier.format(JSON.stringify(sortedTagCount, null, 2), {
    parser: 'json',
  })
  writeFileSync('./src/app/tag-data.json', formatted)
}

async function createYearsCount(allBlogs) {
  const yearCount: Record<string, number> = {}
  allBlogs.forEach((file) => {
    let date = new Date(file.date)
    if (date && (!isProduction || file.draft !== true)) {
      const year = date.getFullYear().toString()
      if (year !== '1970') {
        if (year in yearCount) {
          yearCount[year] += 1
        } else {
          yearCount[year] = 1
        }
      }
    }
  })
  const sortedYears = Object.keys(yearCount).sort((a, b) => Number(b) - Number(a))
  const sortedYearCount = sortedYears.reduce((acc, key) => {
    acc[key] = yearCount[key]
    return acc
  }, {})
  const formatted = await prettier.format(JSON.stringify(sortedYearCount, null, 2), {
    parser: 'json',
  })
  writeFileSync('./src/app/year-data.json', formatted)
}

function createSearchIndex(allBlogs: any[]): void {
  if (
    siteMetadata?.search?.provider === 'kbar' &&
    siteMetadata.search.kbarConfig.searchDocumentsPath
  ) {
    writeFileSync(
      `public/${path.basename(siteMetadata.search.kbarConfig.searchDocumentsPath)}`,
      JSON.stringify(allCoreContent(sortPosts(allBlogs)))
    )
    console.log('Local search index generated...')
  }
}

function copyImages(allBlogs) {
  const publicDir = './public/'
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true })
  }
  const destinationImageDir = path.join(publicDir, 'images')
  if (!existsSync(destinationImageDir)) {
    mkdirSync(destinationImageDir, { recursive: true })
  }
  else {
    console.log(`Destination directory already exists: ${destinationImageDir}. Cleaning directory.`)
    readdirSync(destinationImageDir).forEach((file) => {
      const filePath = path.join(destinationImageDir, file)
      if (existsSync(filePath)) {
        try {
          unlinkSync(filePath)
        } catch (error) {
          console.error(`Error removing file ${filePath}:`, error)
        }
      }
    })
  }

  let folderPathsScanned = new Set<string>()
  allBlogs.forEach((post) => {
    const sourceImageDir = 'data/' + path.join(post._raw.sourceFileDir, 'images')
    if (existsSync(sourceImageDir)) {
      if (!folderPathsScanned.has(sourceImageDir)) {
        folderPathsScanned.add(sourceImageDir)
      } else {
        return
      }
      const imageFiles = readdirSync(sourceImageDir)
      imageFiles.forEach((imageFile) => {
        const sourcePath = path.join(sourceImageDir, imageFile)
        const destPath = path.join(destinationImageDir, imageFile)
        if (existsSync(destPath)) {
          console.error(`File already exists: ${destPath}. Duplicate file names not supported to avoid files being overridden.`)
          throw new Error(`File already exists: ${destPath}. Duplicate file names not supported to avoid files being overridden.`)
        }
        copyFileSync(sourcePath, destPath)
      })
    }
  })
  console.log('Successfully copied all blog images to public directory.')
}

export const Blog = defineDocumentType(() => ({
  name: 'Blog',
  filePathPattern: 'blog/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    lastmod: { type: 'date' },
    draft: { type: 'boolean' },
    summary: { type: 'string' },
    images: { type: 'json' },
    authors: { type: 'list', of: { type: 'string' } },
    layout: { type: 'string' },
    bibliography: { type: 'string' },
    canonicalUrl: { type: 'string' },
  },
  computedFields: {
    ...computedFields,
    structuredData: {
      type: 'json',
      resolve: (doc) => ({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: doc.title,
        datePublished: doc.date,
        dateModified: doc.lastmod || doc.date,
        description: doc.summary,
        image: doc.images ? doc.images[0] : siteMetadata.socialBanner,
        url: `${siteMetadata.siteUrl}/${doc._raw.flattenedPath}`,
      }),
    },
  },
}))

export const Authors = defineDocumentType(() => ({
  name: 'Authors',
  filePathPattern: 'authors/**/*.mdx',
  contentType: 'mdx',
  fields: {
    name: { type: 'string', required: true },
    avatar: { type: 'string' },
    profile_line_1: { type: 'string' },
    profile_line_2: { type: 'string' },
    company_name: { type: 'string' },
    company_website: { type: 'string' },
    company_logo_dark: { type: 'string' },
    company_logo_light: { type: 'string' },
    mvp_website: { type: 'string' },
    mvp_logo_dark: { type: 'string' },
    mvp_logo_light: { type: 'string' },
    email: { type: 'string' },
    twitter: { type: 'string' },
    bluesky: { type: 'string' },
    linkedin: { type: 'string' },
    github: { type: 'string' },
    layout: { type: 'string' },
  },
  computedFields,
}))

export default makeSource({
  contentDirPath: 'data',
  documentTypes: [Blog, Authors],
  mdx: {
    cwd: process.cwd(),
    remarkPlugins: [
      remarkExtractFrontmatter,
      remarkGfm,
      remarkCodeTitles,
      remarkMath,
      remarkImgToJsx,
      remarkAlert,
    ],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'prepend',
          headingProperties: {
            className: ['content-header'],
          },
          content: icon,
        },
      ],
      rehypeKatex,
      rehypeKatexNoTranslate,
      [rehypeCitation, { path: path.join(root, 'data') }],
      [rehypeExternalLinks, { target: '_blank', rel: ['nofollow noopener'] }],
      rehypePresetMinify,
    ],
  },
  onSuccess: async (importData) => {
    const { allAuthors, allBlogs } = await importData()
    await createTagCount(allBlogs)
    await createYearsCount(allBlogs)
    createSearchIndex(allBlogs)
    copyImages(allBlogs)
  },
})
