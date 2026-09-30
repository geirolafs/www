"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/* Figma's own binding for "toggle layout grid".

   Matched on `event.key` — the character the key produces — and not on
   `event.code`, which is the *physical* position of G on a US QWERTY board.
   The two agree on QWERTY-derived layouts (Icelandic included) and come apart
   everywhere else: on Dvorak the key at QWERTY-G's position types "i", while
   the key that actually types "G" reports `code: "KeyI"`. `code` would bind
   the shortcut to whichever key happens to sit in that spot, which is not the
   one anybody pressing "shift+G" is reaching for. */
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
 * Never steal the shortcut from a field someone is typing into. The site has no
 * inputs today, but a shortcut that eats keystrokes the first time one is added
 * is a bug that gets found the slow way.
 */
const isTypingInto = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
};

/**
 * The layout grid, toggled with shift+G exactly as in Figma, on every build: a
 * small easter egg in production, a measuring tool in development.
 */
export function GridOverlayToggle() {
  /* `null` is "storage has not been read yet", and it is what stops the persist
     effect below from writing `false` over a stored `on` during the first
     commit — the read effect and the write effect both run on mount, in that
     order, and the write would otherwise close over the pre-restore value. */
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    setVisible(window.sessionStorage.getItem(STORAGE_KEY) === "on");
  }, []);

  useEffect(() => {
    if (visible === null) {
      return;
    }

    window.sessionStorage.setItem(STORAGE_KEY, visible ? "on" : "off");
  }, [visible]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== TOGGLE_KEY || !event.shiftKey) {
        return;
      }

      /* Holding the chord down would otherwise autorepeat into a strobe. */
      if (event.repeat) {
        return;
      }

      /* shift+G alone. Leaving the other modifiers through would shadow
         browser and OS chords that happen to include the same key. */
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (isTypingInto(event.target)) {
        return;
      }

      event.preventDefault();
      setVisible(previous => !previous);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return visible ? <GridOverlay /> : null;
}
