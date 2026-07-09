interface AnchorHeadingProps {
  level: 2 | 3 | 4;
  id: string;
  children: React.ReactNode;
}

export function AnchorHeading({ level, id, children }: AnchorHeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <Tag id={id}>
      <a href={`#${id}`} className="anchor" aria-hidden="true">
        #
      </a>
      {children}
    </Tag>
  );
}
