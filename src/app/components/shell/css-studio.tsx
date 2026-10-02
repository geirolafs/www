"use client";

import { useEffect } from "react";
import { useShortcutToggle } from "@/lib/hooks/use-shortcut-toggle";

/* shift+S, beside shift+G for the grid. Matched on `event.key` for the same
   reason the grid toggle is (see `use-shortcut-toggle.ts`). CSS Studio claims
   alt+C and alt+F for itself, so those are out. */
const TOGGLE_KEY = "s";

/* Survives the full refresh a server-component edit triggers, and no longer.
   Same reasoning as `dev:grid-overlay`. */
const STORAGE_KEY = "dev:css-studio";

/**
 * CSS Studio (cssstudio.ai), a visual CSS editor wired to the coding agent.
 * Off until shift+S, and shift+S again tears it down. Dev-only: `layout.tsx`
 * renders this only under `NODE_ENV === "development"`, and the dynamic import
 * keeps the package out of the production bundle.
 */
export function CssStudio() {
  const [open] = useShortcutToggle(TOGGLE_KEY, STORAGE_KEY);

  useEffect(() => {
    if (!open) {
      return;
    }

    /* `startStudio` returns its own teardown. The import can resolve after a
       toggle-off, so a late resolve tears down at once instead of leaking. */
    let stop: (() => void) | undefined;
    let cancelled = false;

    import("cssstudio")
      .then(({ startStudio }) => {
        stop = startStudio();
        if (cancelled) {
          stop();
        }
      })
      .catch((error: unknown) => {
        console.warn("[cssstudio] failed to start:", error);
      });

    return () => {
      cancelled = true;
      /* The teardown unmounts Studio's own React root, and React refuses a
         synchronous unmount while this root is still committing. */
      if (stop) {
        queueMicrotask(stop);
      }
    };
  }, [open]);

  return null;
}
