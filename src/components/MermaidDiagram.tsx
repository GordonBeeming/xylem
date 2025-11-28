'use client'

import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { useTheme } from 'next-themes'

interface MermaidDiagramProps {
  chart: string
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
        // Configure mermaid based on theme with custom variables for better visibility
        const isDark = resolvedTheme === 'dark'
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit',
          themeVariables: isDark
            ? {
                // Dark theme overrides for better visibility
                background: '#1f2937', // gray-800
                primaryColor: '#3b82f6', // blue-500
                primaryTextColor: '#f9fafb', // gray-50
                primaryBorderColor: '#60a5fa', // blue-400
                lineColor: '#9ca3af', // gray-400
                secondaryColor: '#374151', // gray-700
                tertiaryColor: '#4b5563', // gray-600
                textColor: '#f3f4f6', // gray-100
                mainBkg: '#1f2937', // gray-800
                nodeBorder: '#60a5fa', // blue-400
                clusterBkg: '#374151', // gray-700
                clusterBorder: '#6b7280', // gray-500
                edgeLabelBackground: '#374151', // gray-700
              }
            : {},
        })

        // Generate unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`

        // Render the diagram
        const { svg: renderedSvg } = await mermaid.render(id, chart)
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
      className="my-4 flex justify-center overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

export default MermaidDiagram
