"use client";

import type { MouseEvent, TouchEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

export type Position = { x: number; y: number };

export type Effect = { x: number; y: number; rotate: number };

/**
 * v1's `useHoverAnimation`, trimmed to what `SpringHover` reads. The maths
 * is unchanged: displacement is measured from each character's top-left
 * (its `getBoundingClientRect()` x/y, not its centre), falls off linearly
 * over 200px (300 on touch), pushes 15px (25) and twists 25° (35), with the
 * twist on `sin(2θ)` so diagonal neighbours rotate hardest.
 *
 * Dropped: v1's `frozenEffects` cache and `handleTouchReset`, which were
 * written but never read, and the resize pass that stamped `data-position`
 * onto each glyph, which nothing read either. The resize *reset* is kept —
 * a large viewport change drops the hover so glyphs don't spring from stale
 * positions.
 */
export function useHoverAnimation({ isFrozen = false }: { isFrozen?: boolean } = {}) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [shouldResetAnimation, setShouldResetAnimation] = useState(false);
  const [touchPosition, setTouchPosition] = useState<Position | null>(null);
  const charRefs = useRef<Map<string, HTMLSpanElement | null>>(new Map());
  const frozenMousePosition = useRef<Position>({ x: 0, y: 0 });

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleInteraction = useCallback((event: MouseEvent | TouchEvent) => {
    if ("touches" in event) {
      const touch = event.touches[0];
      if (!touch) {
        return;
      }
      setTouchPosition({ x: touch.clientX, y: touch.clientY });
      setMousePosition({ x: touch.clientX, y: touch.clientY });
      return;
    }
    setMousePosition({ x: event.clientX, y: event.clientY });
  }, []);

  useEffect(() => {
    if (isFrozen) {
      frozenMousePosition.current = mousePosition;
    }
  }, [isFrozen, mousePosition]);

  const calculateFixedEffect = useCallback(
    (element: Position): Effect => {
      let current = mousePosition;
      if (isTouchDevice && touchPosition) {
        current = touchPosition;
      } else if (isFrozen) {
        current = frozenMousePosition.current;
      }

      const dx = element.x - current.x;
      const dy = element.y - current.y;
      const distance = Math.hypot(dx, dy);

      const maxDistance = isTouchDevice ? 300 : 200;
      const shift = isTouchDevice ? 25 : 15;
      const twist = isTouchDevice ? 35 : 25;

      const strength = Math.max(0, 1 - distance / maxDistance);
      const angle = Math.atan2(dy, dx);

      return {
        x: Math.cos(angle) * shift * strength,
        y: Math.sin(angle) * shift * strength,
        rotate: Math.sin(angle * 2) * twist * strength,
      };
    },
    [isTouchDevice, touchPosition, isFrozen, mousePosition]
  );

  useEffect(() => {
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    let frame: number | null = null;

    // rAF-throttled, and only a change over 50px counts — mobile browser
    // chrome showing and hiding would otherwise reset the hover mid-scroll.
    const onResize = () => {
      if (frame !== null) {
        return;
      }
      frame = requestAnimationFrame(() => {
        frame = null;
        const significant =
          Math.abs(window.innerWidth - lastWidth) > 50 ||
          Math.abs(window.innerHeight - lastHeight) > 50;
        if (significant) {
          lastWidth = window.innerWidth;
          lastHeight = window.innerHeight;
          setIsHovered(false);
          setHoveredLine(null);
          setShouldResetAnimation(true);
        }
      });
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  return {
    isHovered,
    setIsHovered,
    hoveredLine,
    setHoveredLine,
    mousePosition: isFrozen ? frozenMousePosition.current : mousePosition,
    handleInteraction,
    calculateFixedEffect,
    charRefs,
    isTouchDevice,
    shouldResetAnimation,
    setShouldResetAnimation,
    setTouchPosition,
  };
}
