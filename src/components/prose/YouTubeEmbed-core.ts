export function extractVideoId(src: string): string | null {
  const match = src.match(/(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function youtubeEmbedSrc(src: string): string {
  const videoId = extractVideoId(src);
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0` : src;
}

export function visibleCaption(title?: string): string | undefined {
  const text = title?.trim();
  if (!text) return undefined;
  const generic = text.toLowerCase();
  if (generic === "youtube video" || generic === "youtube video player") {
    return undefined;
  }
  return text;
}
