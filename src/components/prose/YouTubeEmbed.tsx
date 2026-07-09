interface YouTubeEmbedProps {
  src: string;
  title?: string;
}

function extractVideoId(src: string): string | null {
  const match = src.match(/(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

/** Xylem YouTubeEmbed — responsive 16:9 player. Embeds the native YouTube
 *  player directly (YouTube's own poster + one-click play) on the
 *  privacy-friendly youtube-nocookie domain, lazy-loaded. */
export function YouTubeEmbed({ src, title = "YouTube video" }: YouTubeEmbedProps) {
  const videoId = extractVideoId(src);
  const embedSrc = videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0` : src;

  return (
    <div className="my-6 aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-black">
      <iframe
        src={embedSrc}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="block h-full w-full border-0"
      />
    </div>
  );
}
