'use client';

import { useEffect, useRef } from 'react';
import { trackScrollDepth } from '@/lib/analytics';

const MILESTONES = [25, 50, 75, 100] as const;

export function ScrollDepthTracker() {
  const firedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const sentinels: HTMLDivElement[] = [];
    const observers: IntersectionObserver[] = [];

    for (const milestone of MILESTONES) {
      const sentinel = document.createElement('div');
      sentinel.style.position = 'absolute';
      sentinel.style.left = '0';
      sentinel.style.width = '1px';
      sentinel.style.height = '1px';
      sentinel.style.pointerEvents = 'none';
      sentinel.style.opacity = '0';
      sentinel.setAttribute('aria-hidden', 'true');
      sentinel.setAttribute('data-scroll-milestone', String(milestone));

      // Position at the correct percentage of the document body
      const updatePosition = () => {
        const docHeight = document.documentElement.scrollHeight;
        sentinel.style.top = `${(docHeight * milestone) / 100}px`;
      };

      updatePosition();
      document.body.appendChild(sentinel);
      sentinels.push(sentinel);

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !firedRef.current.has(milestone)) {
              firedRef.current.add(milestone);
              trackScrollDepth(milestone);
            }
          }
        },
        { threshold: 0 }
      );

      observer.observe(sentinel);
      observers.push(observer);

      // Recalculate position on resize
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      for (const observer of observers) {
        observer.disconnect();
      }
      for (const sentinel of sentinels) {
        sentinel.remove();
      }
    };
  }, []);

  return null;
}
