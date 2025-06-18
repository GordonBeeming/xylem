'use client'

import { Comments as CommentsComponent } from 'pliny/comments'
import { useState, useEffect } from 'react'
import siteMetadata from '@/data/siteMetadata'
import { useTheme } from 'next-themes'; // Import the useTheme hook

export default function Comments({ slug }: { slug: string }) {
  const [loadComments, setLoadComments] = useState(false); // Initialize to false
  const { resolvedTheme } = useTheme(); // Get the current theme from next-themes
  const [commentsConfig, setCommentsConfig] = useState(siteMetadata.comments); // State for comments config

  useEffect(() => {
    // Update commentsConfig when the theme changes
    if (siteMetadata.comments?.provider === 'giscus') {
      setCommentsConfig({
        ...siteMetadata.comments,
        giscusConfig: {
          ...siteMetadata.comments.giscusConfig,
          theme: resolvedTheme === 'dark' ? siteMetadata.comments.giscusConfig.darkTheme : siteMetadata.comments.giscusConfig.theme,
        },
      });
      setLoadComments(true); // Load comments when the component mounts and theme is available
    }
  }, [resolvedTheme]);

  if (!siteMetadata.comments?.provider) {
    return null
  }

  return (
    <>
      {loadComments ? (
        <CommentsComponent commentsConfig={commentsConfig} slug={slug} />
      ) : (
        <button onClick={() => setLoadComments(true)}>Load Comments</button>
      )}
    </>
  );
}