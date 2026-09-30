"use client";

import { useMediaQuery } from "./use-media-query";

/** Motion's `useReducedMotion` reads the preference once; subscribe for live changes. */
export function useLiveReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
