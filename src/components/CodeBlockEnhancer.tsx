'use client'

import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import CopyButton from './CopyButton'

export default function CodeBlockEnhancer() {
  useEffect(() => {
    const addCopyButtons = () => {
      const codeBlocks = document.querySelectorAll('pre:has(code)')
      
      codeBlocks.forEach((pre) => {
        // Skip if already has a copy button
        if (pre.querySelector('[data-copy-button]')) return
        
        const code = pre.querySelector('code')
        if (!code) return
        
        const text = code.textContent || ''
        
        // Create container for the copy button
        const buttonContainer = document.createElement('div')
        buttonContainer.setAttribute('data-copy-button', 'true')
        buttonContainer.style.position = 'absolute'
        buttonContainer.style.top = '0'
        buttonContainer.style.right = '0'
        
        // Make the pre element relative for absolute positioning
        pre.style.position = 'relative'
        
        // Insert the button container
        pre.appendChild(buttonContainer)
        
        // Create React root and render the copy button
        const root = createRoot(buttonContainer)
        root.render(<CopyButton text={text} />)
      })
    }

    // Add copy buttons after initial render
    addCopyButtons()
    
    // Also add them when new content is loaded (e.g., for MDX)
    const observer = new MutationObserver(() => {
      addCopyButtons()
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    return () => observer.disconnect()
  }, [])

  return null
}