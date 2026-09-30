"use client";

import { motion, useSpring } from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Effect, Position } from "./use-hover-animation";

/**
 * v1's springs, exactly: its `SPRING_PHYSICS.elastic` (stiffness 700,
 * restDelta 0.001) with damping and mass overridden to 30 and 1. Damping
 * ratio ≈ 0.57, so a glyph snaps out and overshoots on the way home.
 *
 * v1 also passed a mass-3 `transition` prop to the span. Motion ignores
 * `transition` for values driven by `useSpring`, so it never did anything
 * and is left out.
 */
const SPRING = { stiffness: 700, damping: 30, mass: 1, restDelta: 0.001 };

type SpringCharacterProps = {
  char: string;
  charIndex: number;
  lineIndex: number;
  hoveredLine: number | null;
  isHovered: boolean;
  calculateFixedEffect: (element: Position) => Effect;
  mousePosition: Position;
  isPrefix?: boolean;
};

/**
 * One glyph. Re-targets its springs whenever the hover state or the cursor
 * (through `calculateFixedEffect`) changes, and springs home to zero when the
 * hover ends.
 *
 * Colours are v1's hovered-line swap: the prefix goes muted → foreground, the
 * content foreground → primary. v1's `--primary` sat within a hair of its
 * foreground in both themes (0.205 against 0.145 light, equal dark), so the
 * content half of the swap was invisible in v1 too; `text-foreground` stands
 * in for primary to keep that literally.
 */
export function SpringCharacter({
  char,
  charIndex,
  lineIndex,
  hoveredLine,
  isHovered,
  calculateFixedEffect,
  mousePosition,
  isPrefix = false,
}: SpringCharacterProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const boundsRef = useRef<Position>({ x: mousePosition.x, y: mousePosition.y });

  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const rotate = useSpring(0, SPRING);

  const getFreshBounds = useCallback(() => {
    const element = elementRef.current;
    if (!element) {
      return boundsRef.current;
    }
    const rect = element.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      boundsRef.current = { x: rect.x, y: rect.y };
    }
    return boundsRef.current;
  }, []);

  useEffect(() => {
    if (isHovered) {
      const effect = calculateFixedEffect(getFreshBounds());
      x.set(effect.x);
      y.set(effect.y);
      rotate.set(effect.rotate);
    } else {
      x.set(0);
      y.set(0);
      rotate.set(0);
    }
  }, [isHovered, x, y, rotate, calculateFixedEffect, getFreshBounds]);

  // v1 compared against `char.length`, the glyph's own length, so this is
  // true for the first character of a prefix. Every prefix is one letter, so
  // it lands on the letter before the content either way.
  const isLastPrefixChar = isPrefix && charIndex === char.length - 1;
  const isLineHovered = hoveredLine === lineIndex;
  const colour = isPrefix && !isLineHovered ? "text-muted" : "text-foreground";

  return (
    <motion.span
      aria-hidden="true"
      className={cn(!isPrefix && lineIndex !== 3 && "tabular-nums", colour)}
      ref={elementRef}
      style={{
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        perspective: 1000,
        willChange: isHovered ? "transform" : "auto",
        display: "inline-block",
        marginRight: isLastPrefixChar ? "0.5rem" : undefined,
        x,
        y,
        rotate,
      }}
    >
      <span style={{ pointerEvents: "auto" }}>{char}</span>
    </motion.span>
  );
}
