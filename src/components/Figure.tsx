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

  const numericWidth = Number(width)
  const numericHeight = Number(height)

  // Only add the attribute if the resulting number is actually greater than zero.
  if (numericWidth > 0) {
    imageProps.width = numericWidth
  }
  if (numericHeight > 0) {
    imageProps.height = numericHeight
  }

  // The rest of your component remains the same.
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