// Sent by nuggets embedded in an iframe so the parent page can resize the
// iframe to match content height (no internal scrollbars). Parent matches on
// { source: 'nugget-resize', height } and sizes the iframe accordingly.
(function () {
  if (window.top === window.self) return; // only run when framed

  const post = () => {
    const h = Math.max(
      document.documentElement.scrollHeight,
      document.body ? document.body.scrollHeight : 0
    );
    window.parent.postMessage({ source: 'nugget-resize', height: h }, '*');
  };

  const schedule = () => requestAnimationFrame(post);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule);
  } else {
    schedule();
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
