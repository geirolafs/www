"use client";

import { useSyncExternalStore } from "react";

/** Live `matchMedia` match. The server can't know it; hydrates as `false`, then corrects. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    onChange => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
