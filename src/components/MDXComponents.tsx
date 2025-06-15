import type { MDXComponents } from 'mdx/types'

// Your existing component imports from your project
import TOCInline from 'pliny/ui/TOCInline'
import Image from './Image'
import CustomLink from './Link'
import TableWrapper from './TableWrapper'
import Figure from './Figure'
import YouTubeEmbed from './YouTubeEmbed'

// Import our new client component wrapper for handling code blocks
import PreMonacoViewerClient from './PreMonacoViewerClient'

// Your updated components mapping
export const components: MDXComponents = {
  // All your other components remain the same
  Image,
  TOCInline,
  a: CustomLink,
  table: TableWrapper,
  Figure,
  YouTubeEmbed,

  // --- Use the new client component for all <pre> tags ---
  // This cleanly separates the server and client logic,
  // making your MDX configuration tidy and robust.
  pre: PreMonacoViewerClient,
}
