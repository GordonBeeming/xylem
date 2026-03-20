"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

interface AvatarProps {
  videoSrc?: string;
  fallbackAnimatedWebP?: string;
  poster?: string;
  alt?: string;
  size?: number;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  videoSrc = "/static/videos/avatar.mp4",
  fallbackAnimatedWebP = "/static/videos/avatar.webp",
  poster = "/static/images/avatar.jpg",
  alt = "Gordon Beeming",
  size = 150,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setPrefersReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  // Lazy load via IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "100px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const attemptPlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play()
      .then(() => {
        setAutoplayBlocked(false);
        setIsPlaying(true);
      })
      .catch(() => {
        setAutoplayBlocked(true);
        setIsPlaying(false);
      });
  }, []);

  // Attempt autoplay when in view
  useEffect(() => {
    if (!isInView || prefersReducedMotion) return;
    attemptPlay();
    const t = setTimeout(() => {
      if (!isPlaying && !autoplayBlocked) attemptPlay();
    }, 600);
    return () => clearTimeout(t);
  }, [isInView, prefersReducedMotion, attemptPlay, isPlaying, autoplayBlocked]);

  // Retry on user interaction if autoplay was blocked
  useEffect(() => {
    if (!autoplayBlocked) return;
    const handler = () => attemptPlay();
    window.addEventListener("pointerdown", handler, { once: true });
    window.addEventListener("keydown", handler, { once: true });
    return () => {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
  }, [autoplayBlocked, attemptPlay]);

  const showVideo = !prefersReducedMotion && isInView && !autoplayBlocked;
  const showAnimatedFallback =
    !prefersReducedMotion && autoplayBlocked && fallbackAnimatedWebP;

  let content: React.ReactNode;

  if (showVideo) {
    content = (
      <video
        ref={videoRef}
        className={`h-full w-full object-cover rounded-full ${
          isLoaded
            ? "opacity-100 transition-opacity duration-500"
            : "opacity-0"
        }`}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={poster}
        aria-hidden="true"
        onPlaying={() => {
          setIsPlaying(true);
          if (!isLoaded) setIsLoaded(true);
        }}
        onLoadedData={() => {
          if (!isLoaded) setIsLoaded(true);
        }}
      >
        <source src={videoSrc} type="video/mp4" />
        <Image
          src={poster}
          alt={alt}
          width={size}
          height={size}
          className="h-full w-full object-cover rounded-full"
        />
      </video>
    );
  } else if (showAnimatedFallback) {
    content = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fallbackAnimatedWebP}
        alt={alt}
        width={size}
        height={size}
        className={`h-full w-full object-cover rounded-full ${
          isLoaded
            ? "opacity-100 transition-opacity duration-500"
            : "opacity-0"
        }`}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
      />
    );
  } else {
    content = (
      <Image
        src={poster}
        alt={alt}
        width={size}
        height={size}
        className={`h-full w-full object-cover rounded-full ${
          isLoaded
            ? "opacity-100 transition-opacity duration-500"
            : "opacity-0"
        }`}
        onLoad={() => setIsLoaded(true)}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
      aria-label={alt}
    >
      {content}
    </div>
  );
};

export default Avatar;
