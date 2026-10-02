"use client";

import { useEffect, useState } from "react";
import { isTypingInto } from "./grid-overlay-toggle";

/* shift+S, beside shift+G for the grid. Matched on `event.key` for the same
   reason the grid toggle is (see `grid-overlay-toggle.tsx`). CSS Studio claims
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
  /* `null` until storage is read, so the persist effect cannot write `off`
     over a stored `on` on the first commit. */
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    setOpen(window.sessionStorage.getItem(STORAGE_KEY) === "on");
  }, []);

  useEffect(() => {
    if (open === null) {
      return;
    }

    window.sessionStorage.setItem(STORAGE_KEY, open ? "on" : "off");

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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== TOGGLE_KEY || !event.shiftKey) {
        return;
      }

      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (isTypingInto(event.target)) {
        return;
      }

      event.preventDefault();
      setOpen(previous => !previous);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
