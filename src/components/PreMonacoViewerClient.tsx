// This directive marks this component as a Client Component.
"use client"

import dynamic from 'next/dynamic'
import React from 'react'

// Dynamically import the MonacoCodeViewer with SSR turned off.
// NOTE: The build error "Could not resolve ./MonacoCodeViewer" indicates that the
// build tool cannot find the file at this path. Please ensure this path is correct
// relative to the location of PreMonacoViewerClient.tsx in your project.
const DynamicMonacoViewer = dynamic(() => import('./MonacoCodeViewer'), {
  ssr: false, // This is allowed in a Client Component
  loading: () => (
    <div className="my-4 h-32 w-full rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="h-full w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
    </div>
  ),
})

// Dynamically import the MermaidDiagram with SSR turned off.
const DynamicMermaidDiagram = dynamic(() => import('./MermaidDiagram'), {
  ssr: false,
  loading: () => (
    <div className="my-4 h-32 w-full rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="h-full w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
    </div>
  ),
})

// Type definitions for the props passed from MDX
interface CodeBlockProps {
  className?: string
  children?: React.ReactNode // Children can be undefined if the block is empty
}

interface PreWrapperProps {
  children: React.ReactElement<CodeBlockProps>
  [key: string]: any
}

// The Client Component Wrapper
const PreMonacoViewerClient = ({ children, ...rest }: PreWrapperProps) => {
  // Defensive check: If the <pre> tag has an unexpected structure, children or its props might not exist.
  if (!children || !children.props) {
    // Render a simple <pre> block to avoid breaking the build and page layout.
    return <pre {...rest} />
  }

  const { className, children: code } = children.props
  const language = className?.replace(/language-/, '') || 'plaintext'

  // The 'code' prop might not be a string if the code block is empty.
  // We default to an empty string to prevent the .trim() error during build.
  const codeString = typeof code === 'string' ? code : ''

  // Render mermaid diagrams using the MermaidDiagram component
  if (language === 'mermaid') {
    return <DynamicMermaidDiagram chart={codeString.trim()} />
  }

  // Render the dynamically loaded Monaco viewer for other languages
  return <DynamicMonacoViewer code={codeString.trim()} language={language} {...rest} />
}

export default PreMonacoViewerClient
