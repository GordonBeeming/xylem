"use client";

import { useEffect, useRef, useState } from "react";

interface NuggetFrameProps {
  src: string;
  title: string;
  /** Fill the flex parent instead of using the measured postMessage height (fullscreen mode). */
  fillHeight?: boolean;
}

export function NuggetFrame({ src, title, fillHeight = false }: NuggetFrameProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      // Accept height posts from our own iframe only, on our own origin.
      // The source check alone isn't enough — if the iframe ever navigated
      // cross-origin (or was swapped for one), contentWindow.postMessage
      // would still appear to come from that window. Require both.
      if (event.source !== ref.current?.contentWindow) return;
      if (event.origin !== window.location.origin) return;

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
    <div className="nugget-scroll">
      <iframe
        ref={ref}
        src={src}
        title={title}
        loading="eager"
        className="nugget-iframe block w-full border-0"
        style={{
          height: fillHeight ? "100%" : height ? `${height}px` : "100%",
        }}
      />
    </div>
  );
}
