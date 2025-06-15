import React, { useState, useEffect, FC } from 'react'

// NOTE FOR USER: The error "Could not resolve '@monaco-editor/react'" happens
// because this package is designed for the browser (client-side) only.
// This code is correct, but it MUST be loaded inside a Client Component
// using a dynamic import with `ssr: false` to prevent this error during build.
import Editor, { EditorProps } from '@monaco-editor/react'
import { useTheme } from 'next-themes'

/**
 * Define the props for the MonacoCodeViewer component
 */
interface MonacoCodeViewerProps {
  code?: string
  language?: string
}

const MonacoCodeViewer: FC<MonacoCodeViewerProps> = ({
  code = '',
  language = 'plaintext',
}) => {
  // We use `resolvedTheme` which correctly identifies the active theme
  // ('light' or 'dark') even when the user setting is 'system'.
  const { resolvedTheme } = useTheme()
  const [editorTheme, setEditorTheme] = useState('vs') // Default to light theme
  const [isMounted, setIsMounted] = useState(false)

  // When the component mounts on the client, we set this state to true.
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // This effect now correctly listens for changes to the *resolved* theme.
  useEffect(() => {
    if (resolvedTheme === 'dark') {
      setEditorTheme('vs-dark')
    } else {
      setEditorTheme('vs')
    }
  }, [resolvedTheme])

  // --- Dynamic Height Calculation ---
  const lines = code.trim().split('\n').length
  const lineHeight = 19
  const verticalPadding = 15
  const editorHeight = lines * lineHeight + verticalPadding

  // --- Editor Configuration ---
  const editorOptions: EditorProps['options'] = {
    value: code.trim(),
    language: language,
    theme: editorTheme, // This will now be correctly set to 'vs' or 'vs-dark'
    lineNumbers: 'on',
    glyphMargin: false,
    vertical: 'auto',
    horizontal: 'auto',
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
    scrollBeyondLastLine: false,
    readOnly: true,
    automaticLayout: true,
    minimap: {
      enabled: false,
    },
    lineHeight: lineHeight,
    renderLineHighlight: 'none',
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
    scrollbar: {
      vertical: 'auto',
      horizontal: 'auto',
    },
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
  }

  // To prevent a flash of the wrong theme on initial load, we don't render the editor
  // until the component has mounted and the theme has been resolved.
  if (!isMounted) {
    return null
  }

  return (
    <div className="my-4 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <Editor
        height={`${editorHeight}px`}
        language={language}
        value={code.trim()}
        options={editorOptions}
        theme={editorTheme}
      />
    </div>
  )
}

export default MonacoCodeViewer
