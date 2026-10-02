"use client";

import dynamic from "next/dynamic";
import { useShortcutToggle } from "@/lib/hooks/use-shortcut-toggle";

/* Figma's own binding for "toggle layout grid". */
const TOGGLE_KEY = "g";

/* Editing a *server* component triggers a full page refresh rather than a Fast
   Refresh, and a full refresh loses component state — which, without this,
   means re-pressing shift+G after nearly every edit to the very layout you are
   measuring. Session-scoped on purpose: the overlay should not still be on when
   you open the site again tomorrow. */
const STORAGE_KEY = "dev:grid-overlay";

/* The columns load on the first toggle, not with the page: everyone gets this
   listener, almost nobody presses shift+G. */
const GridOverlay = dynamic(() => import("./grid-overlay").then(m => m.GridOverlay));

/**
 * The layout grid, toggled with shift+G exactly as in Figma, on every build: a
 * small easter egg in production, a measuring tool in development.
 */
export function GridOverlayToggle() {
  const [visible] = useShortcutToggle(TOGGLE_KEY, STORAGE_KEY);

  return visible ? <GridOverlay /> : null;
}
