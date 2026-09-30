"use client";

import { motion } from "motion/react";
import type { TouchEvent } from "react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { SpringHoverLine } from "@/lib/content/localhost-spring-hover";
import { useLiveReducedMotion } from "@/lib/hooks/use-live-reduced-motion";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { SpringCharacter } from "./spring-character";
import type { Effect, Position } from "./use-hover-animation";
import { useHoverAnimation } from "./use-hover-animation";

/** Below this width v1 froze the field: a touch displaces and it stays put. */
const MOBILE_BREAKPOINT = 768;
/** A desktop hover with no movement relaxes after this long. */
const INACTIVITY_TIMEOUT = 8000;

type SpringLineProps = {
  line: SpringHoverLine;
  lineIndex: number;
  hoveredLine: number | null;
  isHovered: boolean;
  calculateFixedEffect: (element: Position) => Effect;
  mousePosition: Position;
  onLineHover: (lineIndex: number) => void;
  onLineLeave: () => void;
  isTouchDevice: boolean;
};

/**
 * One prefix + content line. `-mb-4` overlaps the lines as v1 did, so the
 * block reads as one tight stack. Memoised on the same fields v1 compared.
 */
const SpringLine = memo(
  function SpringLine({
    line,
    lineIndex,
    hoveredLine,
    isHovered,
    calculateFixedEffect,
    mousePosition,
    onLineHover,
    onLineLeave,
    isTouchDevice,
  }: SpringLineProps) {
    const prefixChars = useMemo(() => line.prefix.split(""), [line.prefix]);
    const contentChars = useMemo(() => line.content.split(""), [line.content]);

    const handleHover = () => {
      if (!isTouchDevice) {
        onLineHover(lineIndex);
      }
    };
    const handleLeave = () => {
      if (!isTouchDevice) {
        onLineLeave();
      }
    };
    const handleTouchStart = () => {
      if (isTouchDevice) {
        onLineHover(lineIndex);
      }
    };

    const shared = {
      lineIndex,
      hoveredLine,
      isHovered,
      calculateFixedEffect,
      mousePosition,
    };

    return (
      // v1 put `aria-label` on this bare div, where it is not announced. An
      // sr-only copy does the job instead, and the glyphs are hidden, so the
      // line reads as words rather than letter by letter.
      // biome-ignore lint/a11y/noStaticElementInteractions: v1's hover target; the mouse handlers only drive the colour swap
      <div
        className="-mb-4 flex items-baseline"
        onBlur={handleLeave}
        onFocus={handleHover}
        onMouseEnter={handleHover}
        onMouseLeave={handleLeave}
        onTouchStart={handleTouchStart}
        style={{
          transform: isHovered ? "translate3d(0,0,0)" : "none",
          willChange: isHovered ? "transform" : "auto",
          pointerEvents: "auto",
        }}
      >
        <span className="sr-only">{`${line.prefix} ${line.content}`}</span>
        {prefixChars.map((char, index) => (
          <SpringCharacter
            char={char}
            charIndex={index}
            isPrefix
            // biome-ignore lint/suspicious/noArrayIndexKey: static copy, characters never reorder and may repeat
            key={`prefix-${index}-${char}`}
            {...shared}
          />
        ))}
        {contentChars.map((char, index) => (
          <SpringCharacter
            char={char}
            charIndex={index}
            // biome-ignore lint/suspicious/noArrayIndexKey: static copy, characters never reorder and may repeat
            key={`${index}-${char}`}
            {...shared}
          />
        ))}
      </div>
    );
  },
  (prev, next) =>
    prev.hoveredLine === next.hoveredLine &&
    prev.isHovered === next.isHovered &&
    prev.mousePosition.x === next.mousePosition.x &&
    prev.mousePosition.y === next.mousePosition.y &&
    prev.isTouchDevice === next.isTouchDevice
);

type SpringHoverProps = {
  lines: readonly SpringHoverLine[];
  label: string;
  className?: string;
};

/**
 * v1's `HalloSpringHover`. The field only runs while the pointer is over the
 * block (motion's `onHoverStart`/`onHoverEnd` on the container, cursor from
 * the container's own `mousemove`), and each glyph springs away from it.
 *
 * Below 768px it freezes, as v1 did: a touch displaces the glyphs and they
 * stay where they were pushed until the next touch or a resize. On desktop a
 * hover that sits still for 8s relaxes.
 *
 * Reduced motion never enters the hover state, so nothing moves; the
 * hovered-line colour swap still runs, since it is colour, not motion.
 * v1 had no reduced-motion branch.
 *
 * v1 wrapped the lines in `AnimatePresence` with no enter or exit animations
 * on them, so it did nothing and is left out.
 */
export function SpringHover({ lines, label, className }: SpringHoverProps) {
  const reducedMotion = useLiveReducedMotion();
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

  const {
    isHovered,
    setIsHovered,
    hoveredLine,
    setHoveredLine,
    handleInteraction,
    calculateFixedEffect,
    mousePosition,
    isTouchDevice,
    shouldResetAnimation,
    setShouldResetAnimation,
    setTouchPosition,
  } = useHoverAnimation();

  // Crossing the breakpoint drops the hover. Adjusted during render, not in
  // an effect, so the old hover never paints against the new mode.
  const [prevMobile, setPrevMobile] = useState(isMobile);
  if (prevMobile !== isMobile) {
    setPrevMobile(isMobile);
    setIsHovered(false);
    setHoveredLine(null);
  }

  // Reduced motion never enters the hover state; derived, not synced by effect.
  const hovered = isHovered && !reducedMotion;

  const handleLineHover = useCallback(
    (lineIndex: number) => setHoveredLine(lineIndex),
    [setHoveredLine]
  );

  const handleLineLeave = useCallback(() => {
    if (!isMobile) {
      setHoveredLine(null);
    }
  }, [isMobile, setHoveredLine]);

  const activate = () => {
    if (shouldResetAnimation) {
      setShouldResetAnimation(false);
    }
    if (!reducedMotion) {
      setIsHovered(true);
    }
  };

  // `mousePosition` is a dep only so each move restarts the timer: a hover
  // relaxes after INACTIVITY_TIMEOUT of stillness, not of hovering.
  // biome-ignore lint/correctness/useExhaustiveDependencies: restart the timer on every move
  useEffect(() => {
    if (!isHovered || isMobile) {
      return;
    }
    const timer = setTimeout(() => {
      setIsHovered(false);
      setHoveredLine(null);
    }, INACTIVITY_TIMEOUT);
    return () => clearTimeout(timer);
  }, [isHovered, isMobile, mousePosition, setIsHovered, setHoveredLine]);

  return (
    <section aria-label={label} className={className}>
      <motion.div
        className="text-foreground"
        onHoverEnd={() => {
          if (!(isTouchDevice || isMobile)) {
            setIsHovered(false);
          }
        }}
        onHoverStart={() => {
          if (!isTouchDevice) {
            activate();
          }
        }}
        onMouseMove={event => {
          if (!isTouchDevice) {
            handleInteraction(event);
          }
        }}
        onTouchEnd={() => {
          if (isTouchDevice && !isMobile && shouldResetAnimation) {
            setIsHovered(false);
            setHoveredLine(null);
            setTouchPosition(null);
          }
        }}
        onTouchMove={(event: TouchEvent) => {
          if (isTouchDevice) {
            event.preventDefault();
            handleInteraction(event);
          }
        }}
        onTouchStart={(event: TouchEvent) => {
          if (isTouchDevice) {
            handleInteraction(event);
            activate();
          }
        }}
        style={{ pointerEvents: "auto", touchAction: "pan-y" }}
      >
        {lines.map((line, lineIndex) => (
          <SpringLine
            calculateFixedEffect={calculateFixedEffect}
            hoveredLine={hoveredLine}
            isHovered={hovered}
            isTouchDevice={isTouchDevice}
            key={`${line.prefix}-${line.content}`}
            line={line}
            lineIndex={lineIndex}
            mousePosition={mousePosition}
            onLineHover={handleLineHover}
            onLineLeave={handleLineLeave}
          />
        ))}
      </motion.div>
    </section>
  );
}
