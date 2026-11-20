type EventParams = Record<string, string | number | boolean>;
type Gtag = (command: "event", eventName: string, params?: EventParams) => void;

export function trackEvent(eventName: string, params?: EventParams): void {
  if (typeof window === "undefined") return;
  const gtag = (window as Window & { gtag?: Gtag }).gtag;
  if (typeof gtag === "function") {
    gtag("event", eventName, params);
  }
}

export function trackScrollDepth(depth: number): void {
  trackEvent('scroll_depth', { depth_percentage: depth });
}

export function trackCodeCopy(language: string): void {
  trackEvent('code_copy', { language });
}

export function trackExternalClick(url: string, linkText: string): void {
  trackEvent('outbound_click', { url, link_text: linkText });
}

export function trackSearch(query: string, resultCount: number): void {
  trackEvent('search', { search_term: query, result_count: resultCount });
}

export function trackReadingComplete(postSlug: string, readingTimeMinutes: number): void {
  trackEvent('reading_complete', { post_slug: postSlug, reading_time: readingTimeMinutes });
}

export function trackThemeChange(theme: string): void {
  trackEvent('theme_change', { theme });
}
