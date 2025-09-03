"use client"
import React, { useEffect, useRef, useState, useCallback } from 'react'
import Image from './Image'

interface AvatarProps {
  /** Path to the video file in public folder, e.g. /static/videos/avatar.mp4 */
  videoSrc: string
  /** Optional WebM source for better compression */
  videoSrcWebM?: string
  /** Poster image (will also act as fallback) */
  poster?: string
  /** Animated WebP fallback shown when autoplay blocked or reduced motion */
  fallbackAnimatedWebP?: string
  /** Alt text for accessibility */
  alt?: string
  /** Size in pixels (width & height) */
  size?: number
  /** Additional tailwind classes */
  className?: string
  /** If true, disables the video and just shows the image */
  disableVideo?: boolean
  /** Ensure autoplay by invoking play() in an effect (respects reduced motion) */
  ensureAutoplay?: boolean
  /** Defer loading until avatar enters viewport */
  lazy?: boolean
  /** Show a manual play overlay if autoplay is blocked */
  showPlayOverlay?: boolean
  /** Callback when video successfully starts playing */
  onPlay?: () => void
  /** Callback when video errors */
  onError?: (err: unknown) => void
  /** Apply a fade-in transition once media (video or fallback) is considered loaded */
  fadeIn?: boolean
  /** Root margin for intersection observer (when lazy) */
  lazyRootMargin?: string
  /** Fallback strategy: 'auto' (default) tries video then animated then static, 'prefer-animated' uses animated if available when blocked, 'static-only' always static if video fails */
  fallbackMode?: 'auto' | 'prefer-animated' | 'static-only'
}

/**
 * Avatar component that prefers an auto-playing looping muted inline video with an image fallback.
 * Accessible: Provides alt text via an aria-label on wrapper and hides decorative video from SR.
 */
const Avatar: React.FC<AvatarProps> = ({
  videoSrc,
  poster = '/static/images/avatar.jpg',
  alt = 'Profile avatar',
  size = 150,
  className = '',
  disableVideo = false,
  ensureAutoplay = true,
  videoSrcWebM,
  lazy = true,
  showPlayOverlay = true, // deprecated behavior; retained for backwards compatibility (ignored when false visually)
  onPlay,
  onError,
  fallbackAnimatedWebP,
  fadeIn = true,
  lazyRootMargin = '100px',
  fallbackMode = 'auto',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isInView, setIsInView] = useState(!lazy)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const [hasTriedPlay, setHasTriedPlay] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const prefersReducedMotion = (() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })()

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy) return
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: lazyRootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [lazy])

  const attemptPlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setHasTriedPlay(true)
    v.play()
      .then(() => {
        setAutoplayBlocked(false)
        setIsPlaying(true)
        onPlay?.()
      })
      .catch((err) => {
        setAutoplayBlocked(true)
        setIsPlaying(false)
        onError?.(err)
      })
  }, [onPlay, onError])

  // Attempt to enforce autoplay; respect prefers-reduced-motion.
  useEffect(() => {
    if (disableVideo || !ensureAutoplay) return
    if (!isInView) return
    if (prefersReducedMotion) return
    if (hasTriedPlay && (isPlaying || autoplayBlocked)) return
    // initial and retry logic
    attemptPlay()
    const t = setTimeout(() => {
      if (!isPlaying && !autoplayBlocked) attemptPlay()
    }, 600)
    return () => clearTimeout(t)
  }, [disableVideo, ensureAutoplay, attemptPlay, isInView, prefersReducedMotion, hasTriedPlay, isPlaying, autoplayBlocked])
  // Tailwind can't generate arbitrary classes at runtime; we map a few common sizes.
  const sizeClass = (() => {
    switch (size) {
      case 64:
        return 'w-16 h-16'
      case 96:
        return 'w-24 h-24'
      case 128:
        return 'w-32 h-32'
      case 150:
        return 'w-[150px] h-[150px]'
      case 192:
        return 'w-48 h-48'
      default:
        return `w-[${size}px] h-[${size}px]`
    }
  })()
  const commonClasses = `${sizeClass} mx-auto rounded-full shadow-xl ring-4 ring-gray-100 ring-opacity-30 overflow-hidden ${className}`

  const showVideo = !disableVideo && !prefersReducedMotion && isInView

  // Determine if we should show animated fallback
  // Determine if we should show animated fallback. We broaden logic so that when autoplay is blocked
  // (common on Safari) we prefer an animated WebP if provided even in 'auto' mode. Previously 'auto'
  // required autoplayBlocked AND fallbackAnimatedWebP; that remains but we also treat the case where
  // video element exists but is not yet playing after a play attempt.
  const canShowAnimatedFallback = !!fallbackAnimatedWebP && (
    // Explicit preference
    fallbackMode === 'prefer-animated' ||
    // Autoplay blocked scenario (Safari / policy) in auto mode
    (fallbackMode === 'auto' && autoplayBlocked)
  )

  // With reduced motion preference we never animate (always static poster)

  // When autoplay is blocked we just show the static poster (no overlay). We add a one-off user-interaction listener to retry silently.
  useEffect(() => {
    if (!autoplayBlocked) return
    const handler = () => {
      attemptPlay()
    }
    window.addEventListener('pointerdown', handler, { once: true })
    window.addEventListener('keydown', handler, { once: true })
    return () => {
      window.removeEventListener('pointerdown', handler)
      window.removeEventListener('keydown', handler)
    }
  }, [autoplayBlocked, attemptPlay])

  // Decide final rendering branch
  let content: React.ReactNode
  if (showVideo && !autoplayBlocked) {
    content = (
      <video
        ref={videoRef}
        className={
          'h-full w-full object-cover rounded-full ' +
          (fadeIn ? (isLoaded ? 'opacity-100 transition-opacity duration-500' : 'opacity-0') : '')
        }
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={poster}
        aria-hidden="true"
        onPlaying={() => {
          setIsPlaying(true)
          if (!isLoaded) setIsLoaded(true)
        }}
        onLoadedData={() => {
          if (!isLoaded) setIsLoaded(true)
        }}
        onPause={() => setIsPlaying(false)}
      >
        {videoSrcWebM && <source src={videoSrcWebM} type="video/webm" />}
        <source src={videoSrc} type="video/mp4" />
        <Image
          src={poster}
          alt={alt}
          width={size}
          height={size}
          className="h-full w-full object-cover rounded-full"
        />
      </video>
    )
  } else if (
    // Animated fallback path only when user does NOT prefer reduced motion
    canShowAnimatedFallback && !prefersReducedMotion
  ) {
    content = (
      <img
        src={fallbackAnimatedWebP as string}
        alt={alt}
        width={size}
        height={size}
        className={
          'h-full w-full object-cover rounded-full ' +
          (fadeIn ? (isLoaded ? 'opacity-100 transition-opacity duration-500' : 'opacity-0') : '')
        }
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
      />
    )
  } else {
    content = (
      <Image
        src={poster}
        alt={alt}
        width={size}
        height={size}
        className={
          'h-full w-full object-cover rounded-full ' +
          (fadeIn ? (isLoaded ? 'opacity-100 transition-opacity duration-500' : 'opacity-0') : '')
        }
        // onLoadingComplete deprecated in newer Next.js versions; use onLoad
        onLoad={() => setIsLoaded(true)}
      />
    )
  }

  return (
    <div
      ref={containerRef}
      className={commonClasses + ' relative'}
      aria-label={alt}
      data-playing={isPlaying || undefined}
      data-autoplay-blocked={autoplayBlocked || undefined}
      data-reduced-motion={prefersReducedMotion || undefined}
      data-loaded={isLoaded || undefined}
      data-fallback-mode={fallbackMode}
    >
      {content}
    </div>
  )
}

export default Avatar
