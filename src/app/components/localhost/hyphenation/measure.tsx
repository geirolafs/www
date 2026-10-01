"use client";

import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { localhostHyphenationClientContent } from "@/lib/content/localhost-hyphenation-client";
import { cn } from "@/lib/utils";

const { measure: content } = localhostHyphenationClientContent;

type MeasureProps = {
  /** The starting width in px, picked so the specimen shows its point at once. */
  initial: number;
  min?: number;
  max?: number;
  className?: string;
  /** Read the width as `var(--measure)`, e.g. with `w-(--measure)`. */
  children: ReactNode;
};

/**
 * A width slider over a specimen. The width reaches the children as the CSS
 * variable `--measure`, so they can stay server components and every box
 * under one slider moves together. Line breaks move with the edge, which is
 * the point: a fixed width can hide or fake a difference.
 */
export function Measure({
  initial,
  min = 160,
  max = 640,
  className,
  children,
}: MeasureProps) {
  const [width, setWidth] = useState(initial);

  return (
    <div className={cn("flex min-w-0 flex-col gap-sm", className)}>
      {/* No visible label or readout: the box moving is the feedback. A
          screen reader gets the name and the width in px. */}
      <input
        aria-label={content.label}
        aria-valuetext={content.value(width)}
        className="hy-range w-full max-w-64"
        max={max}
        min={min}
        onChange={event => setWidth(Number(event.target.value))}
        step={10}
        type="range"
        value={width}
      />
      {/* A live value from the slider, not a design token. */}
      <div style={{ "--measure": `${width}px` } as CSSProperties}>{children}</div>
    </div>
  );
}
