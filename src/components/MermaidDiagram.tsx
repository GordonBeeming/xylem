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
        // Configure mermaid based on theme
        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit',
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
