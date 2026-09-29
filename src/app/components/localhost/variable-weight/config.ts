import type { CSSProperties } from "react";

/**
 * v1's variable-weight numbers, unchanged. Heavy at rest and lighter on hover
 * — v1's direction, inspired by glyphsapp.com. The weights were Hallovetica's
 * ends (450–850 axis); Same Univers' axis (400–900) covers both.
 */
export const VARIABLE_WEIGHT = {
  weightDefault: 650,
  weightHover: 500,
  /** v1's `DURATIONS.instant`, in seconds. */
  duration: 0.15,
  /** v1's `EASING.reducedMotion`. */
  easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
} as const;

/** v1's `SPRING_PHYSICS.bouncy`, used by the arrow and the @ icon. */
export const BOUNCY_SPRING = {
  type: "spring",
  stiffness: 650,
  damping: 20,
  mass: 0.65,
} as const;

/** v1's `SLIDE_TRANSITION`: `DURATIONS.fast` with `easeOut`. */
export const SLIDE_TRANSITION = { duration: 0.3, ease: "easeOut" } as const;

/**
 * The custom properties every variable-weight surface reads. v1 built these
 * in `useVariableWeightStyle()`; they are inline because the values are
 * per-instance (the `duration` override) and reduced motion zeroes the
 * duration at runtime.
 */
export function variableWeightVars({
  weightDefault = VARIABLE_WEIGHT.weightDefault,
  weightHover = VARIABLE_WEIGHT.weightHover,
  duration = VARIABLE_WEIGHT.duration,
  reducedMotion = false,
}: {
  weightDefault?: number;
  weightHover?: number;
  duration?: number;
  reducedMotion?: boolean;
} = {}): CSSProperties {
  return {
    "--vwt-weight-default": weightDefault,
    "--vwt-weight-hover": weightHover,
    "--vwt-weight-max": Math.max(weightDefault, weightHover),
    "--vwt-duration": reducedMotion ? "0s" : `${duration}s`,
    "--vwt-easing": VARIABLE_WEIGHT.easing,
  } as CSSProperties;
}

/**
 * The shared class recipe: weight driven through `font-variation-settings`
 * from `--vwt-weight`, transitioned, with v1's `::after` width guard — an
 * invisible zero-height copy of the text at the heavier weight, so the box
 * is already as wide as it will ever get and neighbours never shift.
 */
export const VARIABLE_WEIGHT_CLASSES =
  "relative inline-block [--vwt-weight:var(--vwt-weight-default)] [font-variation-settings:'wght'_var(--vwt-weight)] transition-[font-variation-settings] duration-(--vwt-duration) ease-(--vwt-easing) after:pointer-events-none after:invisible after:block after:h-0 after:select-none after:overflow-hidden after:content-[attr(data-text)] after:[font-variation-settings:'wght'_var(--vwt-weight-max)] after:[speak:never]";
