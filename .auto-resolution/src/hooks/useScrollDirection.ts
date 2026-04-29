"use client";

import { useState, useEffect, useRef } from "react";

type ScrollDirection = "up" | "down" | null;

const TOP_THRESHOLD = 64;
const HIDE_THRESHOLD = 50;
const SHOW_THRESHOLD = 10;

export function useScrollDirection(threshold = 10): ScrollDirection {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const lastScrollY = useRef(0);
  const lastDirection = useRef<ScrollDirection>(null);
  const accumulatedDiff = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function updateScrollDirection() {
      const currentScrollY = window.scrollY;

      // Always show nav when near the top of the page
      if (currentScrollY < TOP_THRESHOLD) {
        setScrollDirection("up");
        lastScrollY.current = currentScrollY;
        accumulatedDiff.current = 0;
        lastDirection.current = "up";
        ticking.current = false;
        return;
      }

      const diff = currentScrollY - lastScrollY.current;
      const newDirection: ScrollDirection = diff > 0 ? "down" : "up";

      // Accumulate scroll distance in the same direction, reset on reversal
      if (newDirection === lastDirection.current) {
        accumulatedDiff.current += Math.abs(diff);
      } else {
        accumulatedDiff.current = Math.abs(diff);
        lastDirection.current = newDirection;
      }

      lastScrollY.current = currentScrollY;

      // Asymmetric thresholds: require more scroll to hide than to show
      // This prevents momentum deceleration from hiding the nav after a flick up
      const requiredThreshold =
        newDirection === "down" ? HIDE_THRESHOLD : SHOW_THRESHOLD;

      if (accumulatedDiff.current >= requiredThreshold) {
        setScrollDirection(newDirection);
      }

      ticking.current = false;
    }

    function onScroll() {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrollDirection;
}
