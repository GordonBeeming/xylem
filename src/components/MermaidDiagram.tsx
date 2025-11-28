'use client'

import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { useTheme } from 'next-themes'

interface MermaidDiagramProps {
  chart: string
}

// Color mappings for dark mode (light color -> dark equivalent)
const darkModeColorMap: Record<string, string> = {
  // Background colors (light -> dark)
  '#F8F9FA': '#1f2937', // gray-100 -> gray-800
  '#f8f9fa': '#1f2937',
  '#FFFFFF': '#374151', // white -> gray-700
  '#ffffff': '#374151',
  '#E9ECEF': '#374151', // gray-200 -> gray-700
  '#e9ecef': '#374151',
  '#46CBFF': '#0ea5e9', // light cyan -> sky-500 (keep bright)
  '#46cbff': '#0ea5e9',
  // Text colors (dark -> light)
  '#1A1A1A': '#f3f4f6', // near-black -> gray-100
  '#1a1a1a': '#f3f4f6',
  // Blue accents (dark blue -> lighter blue)
  '#0063B2': '#93c5fd', // dark blue -> blue-300 for better visibility
  '#0063b2': '#93c5fd',
}

const transformSvgForDarkMode = (svgString: string): string => {
  let transformed = svgString

  // Replace colors in SVG
  Object.entries(darkModeColorMap).forEach(([lightColor, darkColor]) => {
    // Escape # for regex
    const escapedLight = lightColor.replace('#', '\\#')
    
    // Match fill in style attributes (fill:#COLOR or fill: #COLOR)
    transformed = transformed.replace(
      new RegExp(`fill:\\s*${escapedLight}`, 'gi'),
      `fill:${darkColor}`
    )
    // Match fill as attribute
    transformed = transformed.replace(
      new RegExp(`fill="${lightColor}"`, 'gi'),
      `fill="${darkColor}"`
    )
    // Match stroke in style attributes
    transformed = transformed.replace(
      new RegExp(`stroke:\\s*${escapedLight}`, 'gi'),
      `stroke:${darkColor}`
    )
    // Match stroke as attribute
    transformed = transformed.replace(
      new RegExp(`stroke="${lightColor}"`, 'gi'),
      `stroke="${darkColor}"`
    )
    // Match color in style (for text)
    transformed = transformed.replace(
      new RegExp(`([^-])color:\\s*${escapedLight}`, 'gi'),
      `$1color:${darkColor}`
    )
  })

  // Make edge label backgrounds darker for readability
  transformed = transformed.replace(
    /background-color:\s*rgb\([^)]+\)/gi,
    'background-color:#1f2937'
  )
  transformed = transformed.replace(
    /background-color:\s*#[a-fA-F0-9]{3,6}/gi,
    'background-color:#1f2937'
  )

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
