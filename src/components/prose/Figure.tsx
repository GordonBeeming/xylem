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
        width={width && Number(width) ? Number(width) : undefined}
        height={height && Number(height) ? Number(height) : undefined}
        className="mx-auto block max-w-full rounded-[var(--radius-md)] border border-[var(--border)]"
        loading="lazy"
      />
      {caption && (
        <figcaption className="mt-[var(--space-3)] text-center text-[length:var(--text-sm)] leading-[var(--lh-normal)] italic text-[color:var(--text-muted)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
