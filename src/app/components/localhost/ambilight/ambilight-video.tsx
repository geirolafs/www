"use client";

import { useEffect, useRef } from "react";
import { useLiveReducedMotion } from "@/lib/hooks/use-live-reduced-motion";
import { AmbilightFilter } from "./ambilight-filter";
import {
  AMBILIGHT_CANVAS,
  AMBILIGHT_FPS,
  AMBILIGHT_LAYER_CLASS,
  ambilightStyle,
} from "./config";

const FRAME_INTERVAL = 1000 / AMBILIGHT_FPS;

/** v1's `SCROLL_SETTLE_MS`: drawing resumes this long after the last scroll. */
const SCROLL_SETTLE_MS = 150;

/**
 * v1's `AmbientVideo` with `useVideoCanvasSync` folded in: the clip autoplays
 * muted on a loop, and each frame is copied into a small canvas, at up to
 * 24fps, which carries the glow filter.
 *
 * The copy loop runs only while the clip is playing and the canvas is on
 * screen (v1's 25% threshold, 50px margin), and skips frames while the page is
 * scrolling — v1's mobile perf guard, kept as it was. A hidden tab gets no
 * animation frames, so there is nothing extra to cancel for that case.
 *
 * Under reduced motion v1 dropped the glow; it still autoplayed the clip. This
 * drops both: the poster stands in, without a glow.
 *
 * The source is cross-origin and fetched without CORS. Drawing it taints the
 * canvas, which only matters for reading pixels back — this never does.
 */
export function AmbilightVideo({
  id,
  src,
  posterUrl,
}: {
  id: string;
  src: string;
  posterUrl: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useLiveReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (prefersReducedMotion || !(video && canvas && context)) {
      return;
    }

    let frame = 0;
    let lastDraw = 0;
    let isPlaying = !(video.paused || video.ended);
    let isIntersecting = true;
    let isScrolling = false;
    let scrollTimeout: ReturnType<typeof setTimeout> | undefined;

    const shouldRun = () => isPlaying && isIntersecting;

    const draw = (timestamp: number) => {
      if (!isScrolling && timestamp - lastDraw >= FRAME_INTERVAL) {
        lastDraw = timestamp;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      if (shouldRun()) {
        frame = requestAnimationFrame(draw);
      }
    };

    const start = () => {
      cancelAnimationFrame(frame);
      if (shouldRun()) {
        frame = requestAnimationFrame(draw);
      }
    };

    const onPlay = () => {
      isPlaying = true;
      start();
    };
    const onPause = () => {
      isPlaying = false;
      cancelAnimationFrame(frame);
    };
    // One frame as soon as there is one, so a paused clip still glows.
    const onLoadedData = () => draw(performance.now());

    const onScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, SCROLL_SETTLE_MS);
    };

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries.at(-1);
        if (!entry) {
          return;
        }
        isIntersecting = entry.isIntersecting;
        if (isIntersecting) {
          start();
        } else {
          cancelAnimationFrame(frame);
        }
      },
      { threshold: 0.25, rootMargin: "50px" }
    );
    observer.observe(canvas);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("loadeddata", onLoadedData);
    window.addEventListener("scroll", onScroll, { passive: true });
    if (video.readyState >= 2) {
      start();
    }

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(scrollTimeout);
      observer.disconnect();
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("loadeddata", onLoadedData);
      window.removeEventListener("scroll", onScroll);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      // biome-ignore lint/performance/noImgElement: a still in place of the clip, at the clip's own size
      <img alt="" className="relative z-10 block w-full" src={posterUrl} />
    );
  }

  return (
    <div className="relative">
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: no `controls`, so not focusable */}
      <video
        aria-hidden="true"
        autoPlay
        className="relative z-10 block w-full"
        loop
        muted
        playsInline
        poster={posterUrl}
        ref={videoRef}
        src={src}
      />
      <AmbilightFilter id={id} />
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: a canvas is not focusable */}
      <canvas
        aria-hidden="true"
        className={AMBILIGHT_LAYER_CLASS}
        height={AMBILIGHT_CANVAS.height}
        ref={canvasRef}
        style={ambilightStyle(id)}
        width={AMBILIGHT_CANVAS.width}
      />
    </div>
  );
}
