'use client'

import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { useTheme } from 'next-themes'

interface MermaidDiagramProps {
  chart: string
}

// Color mappings for dark mode (light color -> dark equivalent)
const darkModeColorMap: Record<string, string> = {
  '#F8F9FA': '#1f2937', // gray-100 -> gray-800
  '#f8f9fa': '#1f2937',
  '#FFFFFF': '#374151', // white -> gray-700
  '#ffffff': '#374151',
  '#E9ECEF': '#374151', // gray-200 -> gray-700
  '#e9ecef': '#374151',
  '#1A1A1A': '#f3f4f6', // near-black -> gray-100 (for text)
  '#1a1a1a': '#f3f4f6',
}

const transformSvgForDarkMode = (svgString: string): string => {
  let transformed = svgString

  // Replace fill colors
  Object.entries(darkModeColorMap).forEach(([lightColor, darkColor]) => {
    // Match fill in style attributes
    transformed = transformed.replace(
      new RegExp(`fill:\\s*${lightColor}`, 'gi'),
      `fill:${darkColor}`
    )
    // Match fill as attribute
    transformed = transformed.replace(
      new RegExp(`fill="${lightColor}"`, 'gi'),
      `fill="${darkColor}"`
    )
    // Match stroke colors
    transformed = transformed.replace(
      new RegExp(`stroke:\\s*${lightColor}`, 'gi'),
      `stroke:${darkColor}`
    )
    transformed = transformed.replace(
      new RegExp(`stroke="${lightColor}"`, 'gi'),
      `stroke="${darkColor}"`
    )
    // Match color (for text)
    transformed = transformed.replace(
      new RegExp(`color:\\s*${lightColor}`, 'gi'),
      `color:${darkColor}`
    )
  })

  return transformed
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current || !chart) return

      try {
        const isDark = resolvedTheme === 'dark'

        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit',
        })

        // Generate unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`

        // Render the diagram
        let { svg: renderedSvg } = await mermaid.render(id, chart)

        // Transform inline styles for dark mode
        if (isDark) {
          renderedSvg = transformSvgForDarkMode(renderedSvg)
        }

        setSvg(renderedSvg)
        setError(null)
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
      }
    }

    renderDiagram()
  }, [chart, resolvedTheme])

  if (error) {
    return (
      <div className="my-4 rounded-md border border-red-300 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
        <p className="text-sm text-red-600 dark:text-red-400">
          Failed to render Mermaid diagram: {error}
        </p>
        <pre className="mt-2 overflow-x-auto text-xs text-gray-600 dark:text-gray-400">
          {chart}
        </pre>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="my-4 flex justify-center overflow-x-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

export default MermaidDiagram
