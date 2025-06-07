import React from 'react'

interface YouTubeEmbedProps {
  src: string
  width?: string | number
  height?: string | number
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ src, width = 560, height = 315 }) => {
  // The 'iframe-container' class will be used for styling from your global CSS
  // We calculate the aspect ratio for the padding-top trick right here!
  const aspectRatio = (Number(height) / Number(width)) * 100
  const containerStyle = {
    paddingTop: `${aspectRatio}%`,
  }

  // Sanitize the src URL - remove the leading "//" if it exists
  const sanitizedSrc = src.startsWith('//') ? `https:${src}` : src

  return (
    <div className="iframe-container" style={containerStyle}>
      <iframe
        src={sanitizedSrc}
        title="Embedded YouTube video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  )
}

export default YouTubeEmbed