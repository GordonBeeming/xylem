// src/components/Figure.tsx

import React from 'react'

interface FigureProps {
  src: string
  alt: string
  width?: string | number
  height?: string | number
  caption?: string
}

export const Figure: React.FC<FigureProps> = ({ src, alt, width, height, caption }) => {
  const imageProps: React.ImgHTMLAttributes<HTMLImageElement> = {
    src,
    alt,
    title: alt,
    loading: 'lazy',
  }

  if (width && width !== 0) {
    imageProps.width = Number(width)
  }
  if (height && height !== 0) {
    imageProps.height = Number(height)
  }

  // --- THE CHANGE IS HERE ---
  // We wrap the entire output in a div. This acts as a stable container
  // during the React hydration process, preventing reordering issues.
  return (
    <div>
      <figure className="figure-container">
        <img {...imageProps} />
        {caption && <figcaption>{caption}</figcaption>}
      </figure>
    </div>
  )
}

export default Figure