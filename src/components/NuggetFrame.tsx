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
      // Accept height posts from our own origin only. Same-origin iframes
      // post messages whose event.source is the iframe's contentWindow.
      if (event.source !== ref.current?.contentWindow) return;

      const data = event.data as { source?: string; height?: number } | null;
      if (!data || data.source !== "nugget-resize") return;
      if (typeof data.height !== "number" || data.height <= 0) return;

      // Small cushion prevents a 1px scrollbar from appearing due to
      // sub-pixel rounding.
      setHeight(Math.ceil(data.height) + 4);
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
      className="block w-full border-0"
      style={{
        height: height ? `${height}px` : "100vh",
        minHeight: "100vh",
      }}
    />
  );
}
