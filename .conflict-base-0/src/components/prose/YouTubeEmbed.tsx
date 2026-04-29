interface YouTubeEmbedProps {
  src: string;
  title?: string;
  width?: number;
  height?: number;
}

export function YouTubeEmbed({
  src,
  title = "YouTube video",
  width,
  height,
}: YouTubeEmbedProps) {
  return (
    <div className="my-6 aspect-video w-full overflow-hidden rounded-lg">
      <iframe
        src={src}
        title={title}
        width={width ?? "100%"}
        height={height ?? "100%"}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
