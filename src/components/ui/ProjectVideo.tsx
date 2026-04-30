interface ProjectVideoProps {
  url: string;
  title?: string;
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

export function ProjectVideo({ url, title }: ProjectVideoProps) {
  const youTubeId = getYouTubeId(url);
  const vimeoId = !youTubeId ? getVimeoId(url) : null;

  if (!youTubeId && !vimeoId) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-brand-primary)] hover:underline"
      >
        Watch video ↗
      </a>
    );
  }

  const src = youTubeId
    ? `https://www.youtube-nocookie.com/embed/${youTubeId}`
    : `https://player.vimeo.com/video/${vimeoId}`;

  return (
    <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-black">
      <iframe
        src={src}
        title={title ?? "Project video"}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
