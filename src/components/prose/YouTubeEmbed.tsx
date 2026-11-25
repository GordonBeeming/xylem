import {
  visibleCaption,
  youtubeEmbedSrc,
} from "./YouTubeEmbed-core";

interface YouTubeEmbedProps {
  src: string;
  title?: string;
}

/** Xylem YouTubeEmbed — responsive 16:9 player. Embeds the native YouTube
 *  player directly (YouTube's own poster + one-click play) on the
 *  privacy-friendly youtube-nocookie domain, lazy-loaded. The video title
 *  is shown as a figcaption, matching Figure. */
export function YouTubeEmbed({ src, title }: YouTubeEmbedProps) {
  const embedSrc = youtubeEmbedSrc(src);
  const iframeTitle = title?.trim() || "YouTube video";
  const caption = visibleCaption(title);

  return (
    <figure className="my-6">
      <div className="aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-black">
        <iframe
          src={embedSrc}
          title={iframeTitle}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="block h-full w-full border-0"
        />
      </div>
      {caption && (
        <figcaption className="mt-[var(--space-3)] text-center text-[length:var(--text-sm)] leading-[var(--lh-normal)] italic text-[color:var(--text-muted)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
