"use client";

import { useEffect, useRef, useState } from "react";

interface NuggetFrameProps {
  src: string;
  title: string;
}

export function NuggetFrame({ src, title }: NuggetFrameProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      // Accept height posts from our own iframe only.
      if (event.source !== ref.current?.contentWindow) return;

      const data = event.data as { source?: string; height?: number } | null;
      if (!data || data.source !== "nugget-resize") return;
      if (typeof data.height !== "number" || data.height <= 0) return;

      const next = Math.ceil(data.height);
      // Ignore tiny oscillations (< 2px) — they're sub-pixel rounding and
      // acting on them just feeds back into the iframe's own layout.
      setHeight((current) =>
        current != null && Math.abs(current - next) < 2 ? current : next
      );
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      loading="eager"
      scrolling="no"
      className="block w-full border-0"
      style={{
        height: height ? `${height}px` : "100vh",
      }}
    />
  );
}
