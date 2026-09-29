"use client";

import { useEffect, useRef } from "react";
import { useLiveReducedMotion } from "@/lib/hooks/use-live-reduced-motion";
import { cn } from "@/lib/utils";

type ParticleRevealProps = {
  /** Light-on-dark source. Pixels brighter than mid-grey become particles. */
  src: string;
  label: string;
  className?: string;
  /** Grid step in CSS pixels; also each particle's square size. */
  initialParticleSize?: number;
  repelRadius?: number;
  /** v1 strings, parsed the way v1 parsed them — see `interpolateColor`. */
  particleColor: string;
  hoverParticleColor: string;
};

type Particle = {
  originX: number;
  originY: number;
  randomOffsetX: number;
  randomOffsetY: number;
  currentX: number;
  currentY: number;
  velocityX: number;
  velocityY: number;
  noiseOffsetX: number;
  noiseOffsetY: number;
  angle: number;
  rotationSpeed: number;
};

const OFFSCREEN = { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY };

function radialEase(x: number) {
  return Math.cos((1 - x) * Math.PI) * 0.5 + 0.5;
}

function noise(x: number) {
  return Math.sin(x * 0.15) * Math.cos(x * 0.15) * 2;
}

/**
 * v1's colour mix, kept verbatim including its quirk: it pulls every run of
 * digits, so `rgba(242, 241, 237, 0.7)` reads as 242, 241, 237 and the alpha
 * is dropped. Particles near the cursor therefore jump from 0.7 alpha to
 * opaque as they redden — part of how the effect looked, so it stays.
 */
function interpolateColor(baseColor: string, hoverColor: string, ratio: number) {
  const base = baseColor.match(/\d+/g)?.map(Number);
  const hover = hoverColor.match(/\d+/g)?.map(Number);
  if (!(base && hover)) {
    return baseColor;
  }
  const channel = (i: number) => Math.round(base[i] * (1 - ratio) + hover[i] * ratio);
  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

/**
 * v1's `HalloParticleReveal`, faithful in look and feel: the bright pixels of
 * `src` become particles that start scattered, drift on noise, and pull home —
 * reddening — near the cursor. Same maths, colours, spread and fit as v1.
 *
 * What changed is plumbing only:
 *
 * - The pointer lives in a ref. v1 kept it in state, which re-ran the effect
 *   and restarted the rAF loop on every mousemove.
 * - The loop stops while the canvas is offscreen or the tab is hidden.
 * - A ResizeObserver on the box re-samples, not only window resizes.
 * - Pointer events for the mouse, plus v1's own touchmove/touchend so a finger
 *   keeps steering while the page scrolls under it (a pointer stream is
 *   cancelled the moment the browser takes the pan).
 */
export function ParticleReveal({
  src,
  label,
  className,
  initialParticleSize = 1,
  repelRadius = 220,
  particleColor,
  hoverParticleColor,
}: ParticleRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef(OFFSCREEN);
  const reducedMotion = useLiveReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      return;
    }
    const canvas = canvasRef.current;
    const box = canvas?.parentElement;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!(canvas && box && ctx)) {
      return;
    }

    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let onScreen = false;
    let disposed = false;

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = src;

    const build = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      width = box.clientWidth;
      height = box.clientHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      if (!(image.complete && image.naturalWidth)) {
        return;
      }

      // v1 fit the image to the whole box, no margin.
      const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
      const fitWidth = Math.floor(image.naturalWidth * scale);
      const fitHeight = Math.floor(image.naturalHeight * scale);
      const offsetX = (width - fitWidth) / 2;
      const offsetY = (height - fitHeight) / 2;

      const sample = document.createElement("canvas").getContext("2d");
      if (!(sample && fitWidth && fitHeight)) {
        return;
      }
      sample.canvas.width = fitWidth;
      sample.canvas.height = fitHeight;
      sample.drawImage(image, 0, 0, fitWidth, fitHeight);
      const { data } = sample.getImageData(0, 0, fitWidth, fitHeight);

      const size = initialParticleSize;
      const rows = Math.floor(fitHeight / size);
      const columns = Math.floor(fitWidth / size);
      const spread = 300;

      particles = [];
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const i = Math.floor((row * size * fitWidth + column * size) * 4);
          if ((data[i] + data[i + 1] + data[i + 2]) / 3 <= 128) {
            continue;
          }
          // (random - 0.3), not - 0.5: v1's scatter leans down and right.
          const randomX = (Math.random() - 0.3) * spread;
          const randomY = (Math.random() - 0.3) * spread;
          const originX = offsetX + column * size;
          const originY = offsetY + row * size;
          particles.push({
            originX,
            originY,
            randomOffsetX: randomX,
            randomOffsetY: randomY,
            currentX: originX + randomX + (Math.random() - 0.5) * 40,
            currentY: originY + randomY + (Math.random() - 0.5) * 40,
            velocityX: 0,
            velocityY: 0,
            noiseOffsetX: Math.random() * 1000,
            noiseOffsetY: Math.random() * 1000,
            angle: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
          });
        }
      }
    };

    const step = () => {
      const { x: pointerX, y: pointerY } = pointerRef.current;
      const time = Date.now() * 0.001;
      const extendedRadius = repelRadius * 1.2;
      const movementScale = 6;
      const movementSpeed = 0.08;

      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = 1;

      for (const p of particles) {
        const distance = Math.hypot(pointerX - p.originX, pointerY - p.originY);
        const distanceRatio = radialEase(Math.max(0, 1 - distance / extendedRadius));
        const loose = 1 - distanceRatio;

        p.angle += p.rotationSpeed;
        const noiseX = noise(p.noiseOffsetX + time * movementSpeed) * movementScale;
        const noiseY = noise(p.noiseOffsetY + time * movementSpeed) * movementScale;

        const targetX =
          p.originX + p.randomOffsetX * loose + noiseX * loose + Math.cos(p.angle) * 0.25;
        const targetY =
          p.originY + p.randomOffsetY * loose + noiseY * loose + Math.sin(p.angle) * 0.25;

        const spring = 0.08 * (0.2 + distanceRatio * 0.3);
        const friction = 0.7;
        p.velocityX = (p.velocityX + (targetX - p.currentX) * spring) * friction;
        p.velocityY = (p.velocityY + (targetY - p.currentY) * spring) * friction;
        p.currentX += p.velocityX;
        p.currentY += p.velocityY;
        p.noiseOffsetX += movementSpeed;
        p.noiseOffsetY += movementSpeed;

        ctx.fillStyle =
          distanceRatio > 0
            ? interpolateColor(particleColor, hoverParticleColor, distanceRatio)
            : particleColor;
        ctx.fillRect(
          Math.round(p.currentX),
          Math.round(p.currentY),
          initialParticleSize,
          initialParticleSize
        );
      }

      frame = requestAnimationFrame(step);
    };

    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (!disposed && onScreen && !document.hidden) {
        frame = requestAnimationFrame(step);
      }
    };

    const rebuild = () => {
      build();
      sync();
    };

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? false;
      sync();
    });
    const resizer = new ResizeObserver(rebuild);

    image.addEventListener("load", rebuild);
    document.addEventListener("visibilitychange", sync);
    observer.observe(canvas);
    resizer.observe(box);
    rebuild();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      image.removeEventListener("load", rebuild);
      document.removeEventListener("visibilitychange", sync);
      observer.disconnect();
      resizer.disconnect();
    };
  }, [
    src,
    initialParticleSize,
    repelRadius,
    particleColor,
    hoverParticleColor,
    reducedMotion,
  ]);

  // v1 swapped to the plain raster under reduced motion.
  if (reducedMotion) {
    return (
      <div className={cn("relative", className)}>
        {/* biome-ignore lint/performance/noImgElement: a local 478×194 PNG shown only under reduced motion; next/image adds nothing here */}
        <img
          alt={label}
          className="absolute inset-0 h-full w-full object-contain"
          src={src}
        />
      </div>
    );
  }

  const leave = () => {
    pointerRef.current = OFFSCREEN;
  };

  const track = (element: HTMLElement, clientX: number, clientY: number) => {
    const rect = element.getBoundingClientRect();
    pointerRef.current = { x: clientX - rect.left, y: clientY - rect.top };
  };

  return (
    <div
      aria-label={label}
      className={cn("relative", className)}
      onPointerLeave={event => {
        if (event.pointerType === "mouse") {
          leave();
        }
      }}
      onPointerMove={event => {
        if (event.pointerType === "mouse") {
          track(event.currentTarget, event.clientX, event.clientY);
        }
      }}
      onTouchEnd={leave}
      onTouchMove={event => {
        const touch = event.touches[0];
        if (touch) {
          track(event.currentTarget, touch.clientX, touch.clientY);
        }
      }}
      role="img"
    >
      <canvas className="absolute inset-0" ref={canvasRef} />
    </div>
  );
}
