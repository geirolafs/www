import { useEffect } from "react";
import { TINT_STEPS } from "./config";

/**
 * The page colour tinted by the stripe: the base colour mixed with the
 * gradient's colour at the middle of the viewport. The gradient runs the
 * page's height top to bottom, so the colour at the viewport's middle is the
 * median of the part of the stripe in view.
 *
 * Nothing here parses a colour. The stops are read as written from
 * `--gradient-ambient-stops`, and the mixing is handed back to the browser as
 * nested `color-mix()` in oklab — the space the gradient itself is drawn in,
 * so the tint is exactly the stripe's colour at that height.
 */

type Stop = { color: string; at: number };

/** Split on commas outside parentheses: `color-mix(a, b) 0%, #fff 50%`. */
function splitTopLevel(value: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char === "(") {
      depth++;
    } else if (char === ")") {
      depth--;
    } else if (char === "," && depth === 0) {
      parts.push(value.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(value.slice(start));
  return parts;
}

/** The ambient gradient's stops, each a CSS colour and a 0–1 position. */
function readAmbientStops(): Stop[] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    "--gradient-ambient-stops"
  );
  const stops: Stop[] = [];
  for (const part of splitTopLevel(raw)) {
    const match = part.trim().match(/^(.*\S)\s+(-?[\d.]+)%$/);
    if (match?.[1] && match[2]) {
      stops.push({ color: match[1], at: Number(match[2]) / 100 });
    }
  }
  return stops;
}

/** The gradient's colour at `t` (0 top, 1 bottom), as a CSS colour. */
function colourAt(stops: Stop[], t: number) {
  const first = stops[0];
  const last = stops.at(-1);
  if (!(first && last)) {
    return null;
  }
  if (t <= first.at) {
    return first.color;
  }
  for (let i = 1; i < stops.length; i++) {
    const from = stops[i - 1];
    const to = stops[i];
    if (from && to && t <= to.at) {
      const share = to.at > from.at ? (t - from.at) / (to.at - from.at) : 1;
      return `color-mix(in oklab, ${from.color}, ${to.color} ${(share * 100).toFixed(2)}%)`;
    }
  }
  return last.color;
}

/**
 * `base` with `amount` (0–1) of the gradient's colour at `t` mixed in, or
 * `base` alone if there are no stops to read.
 */
function tintedBackground(stops: Stop[], base: string, t: number, amount: number) {
  const colour = colourAt(stops, t);
  if (!colour || amount <= 0) {
    return base;
  }
  return `color-mix(in oklab, ${base}, ${colour} ${(amount * 100).toFixed(1)}%)`;
}

/**
 * The page colour: `base`, leaning `amount` (0-1) towards the stripe's colour
 * at the middle of the viewport, following the scroll; see the top of this
 * file. Set on the root so the body and every `bg-background` surface follow
 * it, and removed on the way out so a page without a stripe keeps its base
 * colour.
 *
 * This is the site's one sanctioned scroll-linked effect. The position is
 * snapped to `TINT_STEPS`, the variable is only written when the value
 * changes, and the listeners are rAF-throttled, so most scroll frames write
 * nothing. With `amount` at 0 there are no listeners at all.
 */
export function usePageTint(base: string, amount: number) {
  useEffect(() => {
    const root = document.documentElement;
    const stops = readAmbientStops();
    let frame = 0;
    let written = "";

    const paint = () => {
      frame = 0;
      const { scrollHeight } = root;
      const middle = window.scrollY + window.innerHeight / 2;
      const t = Math.min(1, Math.max(0, middle / scrollHeight));
      const snapped = Math.round(t * TINT_STEPS) / TINT_STEPS;
      const value = tintedBackground(stops, base, snapped, amount);
      if (value !== written) {
        root.style.setProperty("--color-background", value);
        written = value;
      }
    };
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(paint);
      }
    };

    paint();
    if (amount > 0) {
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });
    }
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      root.style.removeProperty("--color-background");
    };
  }, [base, amount]);
}
