'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtagFn = (window as Record<string, unknown>)['gtag'];
      if (typeof gtagFn === 'function') {
        gtagFn('event', metric.name, {
          value: Math.round(
            metric.name === 'CLS' ? metric.value * 1000 : metric.value
          ),
          event_label: metric.id,
          non_interaction: true,
        });
      }
    }
  });

  return null;
}
