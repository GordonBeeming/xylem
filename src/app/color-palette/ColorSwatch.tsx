'use client'

import { useState } from 'react'

interface ColorSwatchProps {
  name: string
  hex: string
  colorVar: string
  description?: string
}

export default function ColorSwatch({ name, hex, colorVar, description }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(hex)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <div className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div 
        className="w-16 h-16 rounded-lg border border-gray-300 dark:border-gray-600 flex-shrink-0"
        style={{ backgroundColor: hex }}
        title={`${name}: ${hex}`}
      />
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{name}</h3>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{hex}</p>
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
            title="Copy hex code"
          >
            {copied ? (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            )}
            <span className="ml-1">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}