export function extractVideoId(src: string): string | null {
  const match = src.match(/(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function youtubeEmbedSrc(src: string): string {
  const videoId = extractVideoId(src);
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0` : src;
}

/** Formats a length in seconds as SSW Rules does in captions, e.g. "9 min". */
export function formatVideoDuration(duration?: number | string | null): string | undefined {
  if (duration === undefined || duration === null || duration === "") {
    return undefined;
  }
  const seconds = typeof duration === "string" ? Number(duration.trim()) : Number(duration);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return undefined;
  }
  const totalSeconds = Math.round(seconds);
  if (totalSeconds < 60) {
    return totalSeconds === 1 ? "1 sec" : `${totalSeconds} sec`;
  }
  const totalMinutes = Math.round(totalSeconds / 60);
  if (totalMinutes < 60) {
    return totalMinutes === 1 ? "1 min" : `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hourLabel = hours === 1 ? "1 hr" : `${hours} hr`;
  if (minutes === 0) {
    return hourLabel;
  }
  const minLabel = minutes === 1 ? "1 min" : `${minutes} min`;
  return `${hourLabel} ${minLabel}`;
}

function captionBody(title: string): string {
  let body = title.replace(/\.+$/, "").trim();
  body = body.replace(/^(video|figure):\s*/i, "").trim();
  return body;
}

/**
 * SSW Rules video caption: "Video: {{ TITLE }} ({{ LENGTH }})".
 * Duration is omitted when unknown rather than invented.
 * Non-YouTube embeds (SlideShare, Codealike) are not prefixed as videos.
 */
export function visibleCaption(
  title?: string,
  duration?: number | string | null,
  options?: { isVideo?: boolean },
): string | undefined {
  const text = title?.trim();
  if (!text) return undefined;
  const generic = text.toLowerCase();
  if (generic === "youtube video" || generic === "youtube video player") {
    return undefined;
  }
  if (options?.isVideo === false) {
    return text;
  }
  const body = captionBody(text);
  if (!body) return undefined;
  const existingLength = body.match(/\s*\(([^)]+)\)\s*$/);
  let heading = body;
  let durationLabel = formatVideoDuration(duration);
  if (existingLength) {
    if (!durationLabel) {
      durationLabel = existingLength[1].trim() || undefined;
    }
    heading = body.slice(0, existingLength.index).trim();
  }
  if (!heading) return undefined;
  if (durationLabel) {
    return `Video: ${heading} (${durationLabel})`;
  }
  return `Video: ${heading}`;
}
