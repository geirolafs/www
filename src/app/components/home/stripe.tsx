"use client";

import { useEffect } from "react";

/**
 * How far the visitor has to scroll before the stripe appears. Not the first
 * pixel: a browser restoring a position, a trackpad settling, or an anchor
 * jump can leave the page resting a few pixels down, and the stripe should
 * answer a scroll the visitor meant, not one the browser made. 100px is
 * about a third of the hero gap — clearly "I have started reading".
 */
const REVEAL_THRESHOLD_PX = 100;

/**
 * Where the revealed state is mirrored for the next page load to read.
 *
 * `data-stripe` cannot be server-rendered — it depends on a scroll position
 * that only exists in the browser — so on a reload part-way down the page the
 * stripe would be hidden on the first frame and only grow in once this
 * component's effect runs, 900ms of transition later. The inline boot script
 * in `layout.tsx` reads this key before first paint and sets the attribute
 * itself, so a restored position starts with the stripe already there. The
 * key is cleared again whenever the page returns to the top, so a reload
 * from up there starts hidden, as it should.
 *
 * `sessionStorage`, not `localStorage`: it is per-tab, which is exactly the
 * scope of the scroll position it is describing, and it should not outlive
 * the tab any more than the scroll restoration does.
 */
const REVEALED_STORAGE_KEY = "stripe:revealed";

/**
 * Toggles the stripe at the scroll threshold. CSS owns the timed width
 * transition; it is never linked to scroll offset. The layout boot script
 * restores the marker before paint on reload/back navigation.
 * See .private/REDESIGN.md, 2026-09-03, for the fallback and restoration rules.
 */
export function Stripe() {
  useEffect(() => {
    const root = document.documentElement;

    // `undefined` rather than a boolean, so the first run always writes. The
    // page can mount already scrolled — a reload part-way down, or a
    // back/forward restore — and then the stripe must show without waiting
    // for a scroll event that may never come.
    let isRevealed: boolean | undefined;

    const sync = () => {
      const revealed = window.scrollY >= REVEAL_THRESHOLD_PX;

      if (revealed === isRevealed) {
        return;
      }

      isRevealed = revealed;

      if (revealed) {
        root.dataset.stripe = "revealed";
      } else {
        delete root.dataset.stripe;
      }

      // Mirrored for the next load's pre-paint script — see the key's note.
      // Wrapped because storage throws in some locked-down contexts, and a
      // decorative stripe must not be the thing that breaks the page.
      try {
        if (revealed) {
          window.sessionStorage.setItem(REVEALED_STORAGE_KEY, "1");
        } else {
          window.sessionStorage.removeItem(REVEALED_STORAGE_KEY);
        }
      } catch {
        // Storage unavailable: a reload part-way down just grows the stripe in.
      }
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });

    return () => {
      window.removeEventListener("scroll", sync);
      // Leaving `data-stripe` behind would outlive the component that means
      // anything by it — on a client navigation to a page with no stripe the
      // attribute would linger on `<html>` and be read by whatever mounts a
      // stripe next.
      delete root.dataset.stripe;
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 z-10 w-stripe bg-[image:var(--gradient-stripe)]"
      data-stripe-reveal
    />
  );
}
