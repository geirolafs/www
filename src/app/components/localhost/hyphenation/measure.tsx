"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { localhostHyphenationClientContent } from "@/lib/content/localhost-hyphenation-client";
import { cn } from "@/lib/utils";

const { measure: content } = localhostHyphenationClientContent;

/** Slider steps. Fine enough that a drag moves the edge smoothly. */
const STEPS = 1000;

/**
 * The box width at slider position `t` (0–1), as CSS: a straight line from
 * `min` to `max`, each cut to the room there is. It is resolved where
 * `--measure` is used, so `100%` is each box's own column, and the whole
 * track widens the box evenly at any layout.
 */
function widthAt(t: number, min: number, max: number) {
  const hi = `min(100%, ${max}px)`;
  const lo = `min(${min}px, 100%)`;
  return `calc(${lo} + (${hi} - ${lo}) * ${t.toFixed(4)})`;
}

/** Where on the track `initial` sits, given the room a box has. */
function startOf(initial: number, min: number, max: number, room: number) {
  const hi = Math.min(room, max);
  const lo = Math.min(min, hi);
  if (hi <= lo) {
    return 1;
  }
  return Math.min(1, Math.max(0, (Math.min(initial, hi) - lo) / (hi - lo)));
}

type MeasureProps = {
  /** The starting width in px, picked so the specimen shows its point at once. */
  initial: number;
  /** The narrowest the box gets, in px. */
  min?: number;
  /** The widest the box gets, in px, when its column has the room. */
  max?: number;
  className?: string;
  /** What the slider sizes, for its accessible name ("Width, Law text"). */
  name?: string;
  /** Read the width as `var(--measure)`, e.g. with `w-(--measure)`. */
  children: ReactNode;
};

/**
 * A width slider over a specimen. The width reaches the children as the CSS
 * variable `--measure`, so they can stay server components and every box
 * under one slider moves together. Line breaks move with the edge, which is
 * the point: a fixed width can hide or fake a difference.
 *
 * The slider is a position along the room there is, not a px value: from
 * `min` to as wide as the column allows, up to `max` (see `widthAt`). Until
 * it is moved, the box is `initial` px (or its column, if narrower), and the
 * thumb sits where that width falls on the track for the room measured, so
 * nothing jumps on load or on the first drag. A screen reader hears the
 * width a box actually has.
 */
export function Measure({
  initial,
  min = 160,
  max = 640,
  className,
  name,
  children,
}: MeasureProps) {
  // `null` until the slider is moved: the box keeps its designed width.
  const [step, setStep] = useState<number | null>(null);
  const [room, setRoom] = useState(max);
  const [px, setPx] = useState(initial);
  const boxesRef = useRef<HTMLDivElement>(null);

  // The first box that uses `--measure`: its column is the room, and its own
  // width is the slider's value text. Both follow the layout.
  useEffect(() => {
    const box = boxesRef.current?.querySelector<HTMLElement>("[class*='(--measure)']");
    const column = box?.parentElement;
    if (!(box && column)) {
      return;
    }
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === column) {
          setRoom(entry.contentRect.width);
        } else {
          setPx(Math.round(entry.borderBoxSize[0]?.inlineSize ?? box.offsetWidth));
        }
      }
    });
    observer.observe(column);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const value = step ?? Math.round(startOf(initial, min, max, room) * STEPS);
  const width = step === null ? `${initial}px` : widthAt(step / STEPS, min, max);

  return (
    <div className={cn("flex min-w-0 flex-col gap-sm", className)}>
      {/* No visible label or readout: the box moving is the feedback. A
          screen reader gets the name and the width in px. */}
      <input
        aria-label={name ? `${content.label}, ${name}` : content.label}
        aria-valuetext={content.value(px)}
        className="hy-range w-full max-w-64"
        max={STEPS}
        min={0}
        onChange={event => setStep(Number(event.target.value))}
        step={1}
        type="range"
        value={value}
      />
      {/* A live value from the slider, not a design token. */}
      <div ref={boxesRef} style={{ "--measure": width } as CSSProperties}>
        {children}
      </div>
    </div>
  );
}
