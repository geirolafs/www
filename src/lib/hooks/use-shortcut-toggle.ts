"use client";

import { useEffect, useState } from "react";

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
 * An on/off switch flipped by shift+`key`, and kept in `sessionStorage` under
 * `storageKey` so it survives the full refresh a server-component edit
 * triggers. `null` until storage is read.
 *
 * `key` is matched on `event.key` — the character the key produces — and not on
 * `event.code`, which is the *physical* position of the key on a US QWERTY
 * board. The two agree on QWERTY-derived layouts (Icelandic included) and come
 * apart everywhere else: on Dvorak the key at QWERTY-G's position types "i",
 * while the key that actually types "G" reports `code: "KeyI"`. `code` would
 * bind the shortcut to whichever key happens to sit in that spot, which is not
 * the one anybody pressing "shift+G" is reaching for.
 */
export function useShortcutToggle(key: string, storageKey: string) {
  /* `null` is "storage has not been read yet", and it is what stops the persist
     effect below from writing `off` over a stored `on` during the first
     commit — the read effect and the write effect both run on mount, in that
     order, and the write would otherwise close over the pre-restore value. */
  const [on, setOn] = useState<boolean | null>(null);

  useEffect(() => {
    setOn(window.sessionStorage.getItem(storageKey) === "on");
  }, [storageKey]);

  useEffect(() => {
    if (on === null) {
      return;
    }

    window.sessionStorage.setItem(storageKey, on ? "on" : "off");
  }, [on, storageKey]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key || !event.shiftKey) {
        return;
      }

      /* Holding the chord down would otherwise autorepeat into a strobe. */
      if (event.repeat) {
        return;
      }

      /* shift+key alone. Leaving the other modifiers through would shadow
         browser and OS chords that happen to include the same key. */
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (isTypingInto(event.target)) {
        return;
      }

      event.preventDefault();
      setOn(previous => !previous);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key]);

  return [on, setOn] as const;
}
