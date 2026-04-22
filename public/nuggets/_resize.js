// Sent by nuggets embedded in an iframe so the parent page can resize the
// iframe to match content height (no internal scrollbars). Parent matches on
// { source: 'nugget-resize', height } and sizes the iframe accordingly.
(function () {
  if (window.top === window.self) return; // only run when framed

  // Nugget stylesheets often set `body { min-height: 100vh }`. Inside an
  // iframe sized by this script, that creates a feedback loop: the parent
  // grows the iframe → body.min-height grows with it → scrollHeight stays
  // pinned at the iframe's own height → parent keeps growing. Override it
  // once on load so scrollHeight reflects actual content height.
  const neutralize = () => {
    if (!document.body) return;
    const style = document.createElement('style');
    style.setAttribute('data-nugget-resize', '');
    style.textContent =
      'html, body { min-height: 0 !important; height: auto !important; }';
    document.head.appendChild(style);
  };

  const post = () => {
    // Prefer getBoundingClientRect for sub-pixel accuracy. Fall back to
    // scrollHeight if body hasn't rendered yet.
    const body = document.body;
    if (!body) return;
    const h = Math.ceil(body.getBoundingClientRect().height);
    if (h > 0) {
      // Nuggets always render same-origin as the parent site, so target the
      // parent's exact origin rather than '*'. If the iframe ever ended up
      // under a different origin the message simply won't be delivered,
      // which is the safer failure mode than broadcasting heights everywhere.
      window.parent.postMessage(
        { source: 'nugget-resize', height: h },
        window.location.origin
      );
    }
  };

  const schedule = () => requestAnimationFrame(post);
  neutralize();

  // The iframe's load event can fire before the parent React component's
  // useEffect has installed its message listener, so a single early post can
  // land in the void. Re-post at a few staggered delays to guarantee the
  // parent hears at least one. Idempotent — the parent only resizes when
  // the reported height changes.
  const initialPosts = [0, 50, 200, 600, 1500];
  initialPosts.forEach((delay) => setTimeout(schedule, delay));

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule);
  }
  window.addEventListener('load', schedule);

  if (typeof ResizeObserver !== 'undefined' && document.body) {
    new ResizeObserver(schedule).observe(document.body);
  }

  // Font loads, lazy images, and media that swaps layout post-load can all
  // shift height after the initial post.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(schedule).catch(() => {});
  }
  window.addEventListener('resize', schedule);
})();
