"use client";

import { useReducedMotion } from "motion/react";
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/** Motion 12.43's hook reads the preference once; subscribe for live changes. */
export function useLiveReducedMotion() {
  const initial = Boolean(useReducedMotion());
  return useSyncExternalStore(subscribe, getSnapshot, () => initial);
}
