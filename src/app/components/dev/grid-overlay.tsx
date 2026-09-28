"use client";

import { clsx } from "clsx";
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

/* Column numbers, not indices, so they can key the list directly. Twelve is the
   desktop frame; `page-grid` drops to eight below `lg`, so the last four are
   hidden there — see the render. */
const COLUMNS = Array.from({ length: 12 }, (_, index) => index + 1);
const MOBILE_COLUMN_COUNT = 8;

/**
 * Never steal the shortcut from a field someone is typing into. The site has no
 * inputs today, but a dev tool that eats keystrokes the first time one is added
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
 * Development-only layout grid, toggled with shift+G exactly as in Figma.
 *
 * **It draws the real grid, it does not redraw it.** The overlay is a
 * `page-grid` element with one child per column, so the column count, the
 * gutters and the outer margins are whatever `globals.css` currently says they
 * are — including the 12-column → 8-column switch at `lg`. There is no second
 * copy of `--grid-margin`, `--grid-gutter` or the column count in this file to
 * drift out of step with the utility every band on the page is placed against.
 * That is the whole point: an overlay that restated those numbers could agree
 * with the frames and disagree with the site, which is the one failure mode
 * that would make this tool actively misleading.
 *
 * Two details the columns depend on:
 *
 * - `col-auto` on each child. `page-grid` gives its children a default
 *   placement of `2 / span 6` below `lg` (nearly everything on mobile is that
 *   one column), which would stack all twelve markers on top of each other.
 *   `col-auto` is the real placement that displaces it. Note this is a tie
 *   broken by source order, not a specificity win: `:where()` zeroes the child
 *   half of `.page-grid > :where(*)`, but the `.page-grid` half still counts,
 *   so both selectors weigh (0,1,0) and the later utility takes it. Verified
 *   at both frames rather than assumed — if a future Tailwind reorders the
 *   utility layer, the symptom is every column stacking into column 2.
 * - The last four columns are `hidden lg:block`. Below `lg` the grid is eight
 *   columns wide, and twelve children would wrap onto a second row and draw a
 *   grid that does not exist.
 *
 * Sized with `fixed inset-0` rather than `w-screen`. Both look identical until
 * a classic scrollbar appears, at which point `100vw` counts the scrollbar and
 * the whole overlay drifts a few px off the content it is measuring — the same
 * trap the carousel inset in `globals.css` documents.
 *
 * Kept out of production by the conditional `dynamic()` import in `layout.tsx`
 * — gating the *element* on `NODE_ENV` is not enough, and the note there
 * explains why.
 */
export function GridOverlay() {
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

  if (!visible) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      /* `z-50`, the top of Tailwind's scale, rather than an arbitrary
         `z-[9999]`. Nothing else on the site sets a z-index at all, so this
         clears everything with room to spare. */
      className="pointer-events-none fixed inset-0 z-50"
      data-grid-overlay=""
    >
      <div className="page-grid h-full">
        {COLUMNS.map(column => (
          /* `clsx`, not `cn` — none of these classes conflict, so there is
             nothing for tailwind-merge to resolve and `cn` would pull it into
             the chunk for nothing. Not a template literal either: the class
             sorter treats a string inside one as a class list and trims it,
             which silently welds `bg-…/10` to `hidden`. */
          <div
            className={clsx(
              "col-auto h-full bg-[#ff2d55]/10",
              column > MOBILE_COLUMN_COUNT && "hidden lg:block"
            )}
            key={column}
          />
        ))}
      </div>

      {/* Which of the two frames you are looking at, plus its margin/gutter.
          Switched in CSS rather than from a resize listener, so it cannot
          disagree with the columns rendered beside it.

          Pinned top-left, inside the page margin and above the first band, for
          want of anywhere else: bottom-left is the Next dev indicator, bottom
          centre is the Vercel toolbar, and top-right is the header bar's
          clock. */}
      <p className="fixed top-1 left-1.5 font-mono text-[#ff2d55] text-[10px] uppercase tracking-wider">
        <span className="lg:hidden">8 col · 16 / 16</span>
        <span className="hidden lg:inline">12 col · 24 / 24</span>
      </p>
    </div>
  );
}
