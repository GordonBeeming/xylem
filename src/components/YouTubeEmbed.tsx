import React from 'react'

interface YouTubeEmbedProps {
  src: string
  width?: string | number
  height?: string | number
  title?: string
  duration?: number | string
}

const formatDuration = (duration?: number | string): string => {
  if (!duration) return ''
  if (typeof duration === 'string') return duration

  const seconds = duration
  if (seconds < 60) {
    return `${seconds} sec`
  }

  const minutes = Math.round(seconds / 60)
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} hr`
  }

  return `${hours} hr ${remainingMinutes} min`
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  src,
  width = 560,
  height = 315,
  title,
  duration,
}) => {
  // The 'iframe-container' class will be used for styling from your global CSS
  // We calculate the aspect ratio for the padding-top trick right here!
  const aspectRatio = (Number(height) / Number(width)) * 100
  const containerStyle = {
    paddingTop: `${aspectRatio}%`,
  }

  // Sanitize the src URL - remove the leading "//" if it exists
  const sanitizedSrc = src.startsWith('//') ? `https:${src}` : src

  const formattedDuration = formatDuration(duration)

  return (
    <div className="my-4">
      <div className="iframe-container relative w-full" style={containerStyle}>
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={sanitizedSrc}
          title={title || 'Embedded YouTube video'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      {title && duration && (
        <figcaption className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          <strong>
            Video: {title} ({formattedDuration})
          </strong>
        </figcaption>
      )}
    </div>
  )
}

export default YouTubeEmbed