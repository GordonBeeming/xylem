'use client'

import { Comments as CommentsComponent } from 'pliny/comments'
import { useState, useEffect } from 'react'
import siteMetadata from '@/data/siteMetadata'
import { useTheme } from 'next-themes'

export default function Comments({ slug }: { slug: string }) {
  const [loadComments, setLoadComments] = useState(false)
  const { resolvedTheme } = useTheme()
  
  // Initialize with the correct theme on first load
  const getInitialCommentsConfig = () => {
    if (siteMetadata.comments?.provider === 'giscus' && siteMetadata.comments.giscusConfig) {
      return {
        ...siteMetadata.comments,
        giscusConfig: {
          ...siteMetadata.comments.giscusConfig,
          theme: resolvedTheme === 'dark' 
            ? siteMetadata.comments.giscusConfig.darkTheme || 'transparent_dark'
            : siteMetadata.comments.giscusConfig.theme || 'light',
        },
      }
    }
    return siteMetadata.comments
  }

  // Function to send theme change message to Giscus iframe
  const updateGiscusTheme = (theme: string) => {
    const iframe = document.querySelector('iframe[src*="giscus"]') as HTMLIFrameElement
    if (iframe && siteMetadata.comments?.provider === 'giscus' && siteMetadata.comments.giscusConfig) {
      const giscusTheme = theme === 'dark' 
        ? siteMetadata.comments.giscusConfig.darkTheme || 'transparent_dark'
        : siteMetadata.comments.giscusConfig.theme || 'light'
      
      iframe.contentWindow?.postMessage(
        {
          giscus: {
            setConfig: {
              theme: giscusTheme
            }
          }
        },
        'https://giscus.app'
      )
    }
  }

  // Listen for theme changes and update Giscus
  useEffect(() => {
    if (loadComments && resolvedTheme) {
      // Small delay to ensure iframe is loaded
      const timer = setTimeout(() => {
        updateGiscusTheme(resolvedTheme)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [resolvedTheme, loadComments])

  // Load comments when component mounts and theme is available
  useEffect(() => {
    if (siteMetadata.comments?.provider === 'giscus' && resolvedTheme) {
      setLoadComments(true)
    }
  }, [resolvedTheme])

  if (!siteMetadata.comments?.provider) {
    return null
  }

  return (
    <>
      {loadComments ? (
        <CommentsComponent commentsConfig={getInitialCommentsConfig()} slug={slug} />
      ) : (
        <button onClick={() => setLoadComments(true)}>Load Comments</button>
      )}
    </>
  )
}