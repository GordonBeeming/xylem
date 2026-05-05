"use client";

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface StepProps {
  src: string;
  alt: string;
  caption?: string;
}

interface WalkthroughProps {
  title?: string;
  children?: ReactNode;
}

const SWIPE_THRESHOLD_PX = 50;

/**
 * Marker component for a single Walkthrough step. Renders nothing on its own —
 * Walkthrough reads its props via React.Children. Authoring as a child element
 * keeps MDX readable across multiple lines, which an inline `steps` array
 * doesn't tolerate well in next-mdx-remote.
 */
export function Step(_props: StepProps) {
  return null;
}
Step.displayName = "WalkthroughStep";

function extractSteps(children: ReactNode): StepProps[] {
  return Children.toArray(children)
    .filter(isValidElement)
    .map((child) => {
      const props = (child as { props?: Partial<StepProps> }).props ?? {};
      if (typeof props.src === "string" && typeof props.alt === "string") {
        return {
          src: props.src,
          alt: props.alt,
          caption: props.caption,
        } satisfies StepProps;
      }
      return null;
    })
    .filter((step): step is StepProps => step !== null);
}

export function Walkthrough({ title, children }: WalkthroughProps) {
  const steps = extractSteps(children);
  const [index, setIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const pointerStartX = useRef<number | null>(null);

  const total = steps.length;
  const current = steps[index];

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : i));
  }, []);
  const goNext = useCallback(() => {
    setIndex((i) => (i < total - 1 ? i + 1 : i));
  }, [total]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    },
    [goPrev, goNext],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = e.clientX;
  };
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null) return;
    const delta = e.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    if (delta < 0) goNext();
    else goPrev();
  };

  // Preload neighbouring frames so next-click is instant.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const neighbours = [steps[index - 1], steps[index + 1]].filter(
      Boolean,
    ) as StepProps[];
    const links: HTMLLinkElement[] = neighbours.map((step) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = step.src;
      document.head.appendChild(link);
      return link;
    });
    return () => {
      links.forEach((link) => link.remove());
    };
  }, [index, steps]);

  if (total === 0 || !current) return null;

  const stepNumber = index + 1;

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      role="region"
      aria-roledescription="walkthrough"
      aria-label={title ?? "Walkthrough"}
      onKeyDown={handleKeyDown}
      className="my-6 overflow-hidden rounded-xl border border-[var(--color-border-default)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-default)] bg-[var(--color-surface-tertiary)] px-4 py-2">
        {title ? (
          <span
            className="truncate text-[13px] font-medium text-[var(--color-text-secondary)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {title}
          </span>
        ) : (
          <span aria-hidden="true" />
        )}
        <div
          className="flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)] px-1 py-0.5 text-[11px] font-medium text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <button
            type="button"
            onClick={goPrev}
            disabled={index === 0}
            aria-label="Previous step"
            className="rounded-full px-1.5 py-0.5 transition hover:bg-[color-mix(in_srgb,var(--color-brand-primary)_18%,transparent)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            ◀
          </button>
          <span className="px-1 tabular-nums" aria-live="polite">
            {stepNumber} / {total}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={index === total - 1}
            aria-label="Next step"
            className="rounded-full px-1.5 py-0.5 transition hover:bg-[color-mix(in_srgb,var(--color-brand-primary)_18%,transparent)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            ▶
          </button>
        </div>
      </div>
      <div className="bg-[var(--color-surface-secondary)] p-4">
        <div
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            pointerStartX.current = null;
          }}
          className="touch-pan-y select-none"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={current.src}
            src={current.src}
            alt={current.alt}
            loading="lazy"
            draggable={false}
            className="mx-auto block max-w-full rounded-lg"
          />
        </div>
        {current.caption && (
          <p
            className="mt-3 text-center text-sm text-[var(--color-text-secondary)]"
            aria-live="polite"
          >
            <span className="font-semibold text-[var(--color-brand-primary)]">
              Step {stepNumber}:
            </span>{" "}
            {current.caption}
          </p>
        )}
      </div>
    </div>
  );
}
