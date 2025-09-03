# Avatar Video Setup

This project now supports a looping avatar video in place of the static `/static/images/avatar.jpg` image.

## 1. Add Video Asset
Place your video file here (create the folder if it does not exist):
```
public/static/videos/avatar.mp4
```
Recommended encoding:
- Format: MP4 (H.264 + AAC)
- Resolution: Square (e.g. 512x512 or 720x720)
- Duration: Keep it short (<10s) and loop-friendly
- File size: <1 MB preferred for fast load

You can also optionally include a high quality poster image (already using existing avatar):
```
public/static/images/avatar.jpg
```

## 2. Component Usage
The new `Avatar` component is used in:
- `src/app/Main.tsx`
- `src/layouts/AuthorLayout.tsx`

Example:
```tsx
<Avatar
  videoSrc="/static/videos/avatar.mp4"
  poster="/static/images/avatar.jpg"
  alt="Gordon Beeming profile video avatar"
  size={150}
  videoSrcWebM="/static/videos/avatar.webm" // optional higher efficiency source
/>
```

## 3. Disabling Video (Fallback to Image)
If you need to temporarily disable the video while keeping the same markup:
```tsx
<Avatar videoSrc="/static/videos/avatar.mp4" disableVideo />
```

Force a best-effort autoplay (default is true already):
```tsx
<Avatar videoSrc="/static/videos/avatar.mp4" ensureAutoplay />
```

Provide a WebM + MP4 pair with lazy loading disabled:
```tsx
<Avatar
  videoSrcWebM="/static/videos/avatar.webm"
  videoSrc="/static/videos/avatar.mp4"
  poster="/static/images/avatar.jpg"
  lazy={false}
/>
```

Use an animated WebP fallback if autoplay is blocked (Safari, policy) and user does not have reduced motion enabled:
```tsx
<Avatar
  videoSrc="/static/videos/avatar.mp4"
  videoSrcWebM="/static/videos/avatar.webm"
  poster="/static/images/avatar.jpg"
  fallbackAnimatedWebP="/static/videos/avatar.webp" // shown when video cannot autoplay
  alt="Gordon Beeming profile animated avatar"
  size={150}
/>
```

Advanced fallback behavior preferences (reduced motion users always get static poster):
```tsx
<Avatar
  videoSrc="/static/videos/avatar.mp4"
  fallbackAnimatedWebP="/static/videos/avatar.webp"
  fallbackMode="prefer-animated"           // if autoplay blocked OR video hidden, prefer animated fallback
  fadeIn                                   // smooth fade (default true)
  lazyRootMargin="200px"                   // start loading a bit earlier
/>
```

## 4. Accessibility
 If the user has `prefers-reduced-motion: reduce`, autoplay enforcement is skipped.
 If autoplay is blocked (e.g. Safari), the static poster is shown; a silent retry occurs after first user interaction (no play overlay is shown to keep avatar clean).
- Provide meaningful `alt` text via the `alt` prop.
 If `prefers-reduced-motion: reduce` matches, the component renders only the static poster image and does not attempt autoplay or show an overlay.
 - If autoplay is blocked, an accessible Play button overlay appears (can be disabled with `showPlayOverlay={false}`).
 Safari (especially iOS) may block autoplay even for muted inline videos. Behavior:
 1. Attempt `play()` when entering viewport.
 2. Retry after ~600ms.
 3. If still blocked, show static poster (no overlay to keep avatar visually clean).
 4. On first user interaction (pointer / key), attempt another silent `play()`.

 If guaranteed motion is essential on Safari without interaction, alternatives are limited by platform policy. Consider a lightweight animated WebP, CSS sprite, or Lottie animation instead.
| `showPlayOverlay` | boolean | true       | Display Play overlay when blocked       |
| `showPlayOverlay` | boolean | true       | (Deprecated visual) Overlay currently suppressed; kept for backward compatibility |
### Safari Autoplay Notes
ffmpeg -i source.mov -vf "scale=512:512:force_original_aspect_ratio=1,crop=512:512" -an -c:v libx264 -preset slow -crf 28 -movflags +faststart public/static/videos/avatar.mp4
Safari (especially on iOS) can defer starting `video.play()` even when muted. The component:
- Attempts an initial `play()` when in view
- Retries after ~600ms
- Falls back to showing a Play overlay if blocked

### Lazy Loading
By default `lazy={true}` uses an `IntersectionObserver` with a `rootMargin` of 100px so the video begins loading just before it scrolls into view.
Set `lazy={false}` to always load immediately.

### New Props Summary
| Prop                   | Type                                         | Default    | Purpose                                                    |
| ---------------------- | -------------------------------------------- | ---------- | ---------------------------------------------------------- |
| `videoSrc`             | string                                       | (required) | MP4 source                                                 |
| `videoSrcWebM`         | string?                                      | undefined  | Optional WebM source (added before MP4)                    |
| `poster`               | string                                       | avatar.jpg | Poster & fallback image                                    |
| `fallbackAnimatedWebP` | string                                       | undefined  | Animated WebP used when autoplay blocked or reduced motion |
| `fallbackMode`         | 'auto' \| 'prefer-animated' \| 'static-only' | auto       | Strategy for choosing fallback                             |
| `fadeIn`               | boolean                                      | true       | Apply fade-in transition after load                        |
| `lazyRootMargin`       | string                                       | 100px      | Root margin threshold for lazy observer                    |
| `ensureAutoplay`       | boolean                                      | true       | Enforce autoplay attempts                                  |
| `lazy`                 | boolean                                      | true       | Defer loading until in viewport                            |
| `showPlayOverlay`      | boolean                                      | true       | Display Play overlay when blocked                          |
| `disableVideo`         | boolean                                      | false      | Force static image                                         |
| `onPlay`               | () => void                                   | undefined  | Callback when playback begins                              |
| `onError`              | (err) => void                                | undefined  | Callback on play error                                     |

## 5. Tailwind Sizing
Common sizes are mapped (64, 96, 128, 150, 192). Any other pixel value will emit an arbitrary size class using square dimensions.

## 6. Performance Tips
- Trim leading/trailing silence/frames.
- Use `ffmpeg` to optimize:
```bash
ffmpeg -i source.mov -vf "scale=512:512:force_original_aspect_ratio=1,crop=512:512" -an -c:v libx264 -preset slow -crf 28 -movflags +faststart public/static/videos/avatar.mp4
```
- Consider providing a lighter WebM variant in future (extend component with an extra `<source>`).

## 7. Future Enhancements (Optional)
- Add user preference (reduce motion) detection to auto-disable video if `prefers-reduced-motion`.
- Add WebM + AVIF poster sources.
- Lazy-load the video when in viewport via an `IntersectionObserver` wrapper.

---
Note: Contentlayer does not process or copy the video; assets in `public/` are served directly by Next.js at the same path.

This file documents the introduction of the `Avatar` component and how to manage the video asset.
