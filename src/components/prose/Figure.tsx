interface FigureProps {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  caption?: string;
}

export function Figure({ src, alt, width, height, caption }: FigureProps) {
  return (
    <figure className="my-6">
      <img
        src={src}
        alt={alt}
        width={width ? Number(width) : undefined}
        height={height ? Number(height) : undefined}
        className="mx-auto max-w-full rounded-lg"
        loading="lazy"
      />
      {caption && (
        <figcaption className="mt-3 text-center text-sm italic text-[var(--color-text-secondary)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
