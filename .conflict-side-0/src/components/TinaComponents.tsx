import Link from "next/link";
import { Figure } from "@/components/prose/Figure";
import { YouTubeEmbed } from "@/components/prose/YouTubeEmbed";
import { CodeBlock } from "@/components/prose/CodeBlock";
import { TableWrapper } from "@/components/prose/TableWrapper";

interface TinaComponentProps {
  [key: string]: unknown;
}

function TinaLink({
  url,
  children,
}: {
  url?: string;
  children?: React.ReactNode;
}) {
  if (!url) return <>{children}</>;

  const isExternal = url.startsWith("http") || url.startsWith("//");

  if (isExternal) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--color-brand-primary)] hover:underline"
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={url}
      className="text-[var(--color-brand-primary)] hover:underline"
    >
      {children}
    </Link>
  );
}

function TinaImage({
  url,
  alt,
  caption,
}: {
  url?: string;
  alt?: string;
  caption?: string;
}) {
  if (!url) return null;
  return <Figure src={url} alt={alt ?? ""} caption={caption} />;
}

function TinaCodeBlock({
  value,
  lang,
  children,
}: {
  value?: string;
  lang?: string;
  children?: string;
}) {
  const code = value ?? children ?? "";
  return <CodeBlock code={code} language={lang} />;
}

function TinaTable({ children }: { children?: React.ReactNode }) {
  return <TableWrapper>{children}</TableWrapper>;
}

function TinaYouTubeEmbed({
  url,
  title,
}: {
  url?: string;
  title?: string;
}) {
  if (!url) return null;
  return <YouTubeEmbed src={url} title={title} />;
}

export const tinaComponents: Record<
  string,
  React.ComponentType<TinaComponentProps>
> = {
  Figure: TinaImage as React.ComponentType<TinaComponentProps>,
  YouTubeEmbed: TinaYouTubeEmbed as React.ComponentType<TinaComponentProps>,
  code_block: TinaCodeBlock as React.ComponentType<TinaComponentProps>,
  a: TinaLink as React.ComponentType<TinaComponentProps>,
  img: TinaImage as React.ComponentType<TinaComponentProps>,
  table: TinaTable as React.ComponentType<TinaComponentProps>,
};
