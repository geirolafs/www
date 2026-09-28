"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CarouselCard } from "@/app/components/home/carousel-card";
import type { PortfolioMedia } from "@/lib/content/portfolio";
import { portfolioMedia } from "@/lib/content/portfolio";
import { buildCarouselOrder } from "@/lib/utils/carousel-order";

/**
 * The endless portfolio strip.
 *
 * **Why the order is picked on the client.** The homepage is statically
 * prerendered, so a shuffle at render time would run once at build and bake a
 * single "random" order into the HTML — the same order for every visitor until
 * the next deploy. The server ships the grey card boxes the frame calls for and
 * the first effect after hydration picks the order and fills them in. Same
 * shape as `LocalClock`, and for the same reason.
 *
 * Because the cards are a fixed size the server HTML already has the strip's
 * exact geometry, so filling it in shifts nothing.
 *
 * **Why it never ends.** The shuffled sequence is laid out `COPIES` times and
 * the scroll position is kept inside the middle copy. Cross half a cycle in
 * either direction and the scroll position jumps a whole cycle back — the same
 * card lands under the same pixel, so nothing visibly moves, and the strip runs
 * 1…n, 1…n, 1…n forever in both directions. The order holds for the visit and
 * is re-drawn on the next load.
 */

/** Three, so there is a full cycle of slack on each side of the home copy. */
const COPIES = 3;
const HOME_COPY = 1;
const CARD_COUNT = portfolioMedia.length;

/**
 * The cards are fixed ring slots, so a slot's identity is its position and the
 * keys are constant for the life of the component.
 *
 * Keying by asset id instead would re-key all 123 cards the moment the shuffle
 * lands, and React would move every node to match. Stable keys mean the
 * shuffle only ever changes what is *inside* a slot: no node moves, and the
 * scroll container is never handed a reason to reset its position.
 */
const SLOT_KEYS = Array.from(
  { length: COPIES * CARD_COUNT },
  (_, slot) => `carousel-slot-${slot}`
);

export function CarouselStrip() {
  /** The scroll container. `<section>` because a labelled region wants one. */
  const scrollerRef = useRef<HTMLElement>(null);
  /** The flex track inside it, whose children are measured for the cycle. */
  const listRef = useRef<HTMLUListElement>(null);
  /** Width of one full pass of the sequence, gaps included. Measured, never derived. */
  const cycleRef = useRef(0);
  /** Homing happens once. A later resize must not yank a reader back. */
  const hasHomedRef = useRef(false);
  const [order, setOrder] = useState<readonly PortfolioMedia[] | null>(null);

  useEffect(() => {
    setOrder(buildCarouselOrder(portfolioMedia));
  }, []);

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }

    // The distance between the same card in two consecutive copies is one
    // cycle exactly. Taken off the DOM rather than computed from the width and
    // gap tokens, so a change to either cannot silently desynchronise the wrap.
    const first = list.children.item(0);
    const nextCopy = list.children.item(CARD_COUNT);
    if (!(first instanceof HTMLElement && nextCopy instanceof HTMLElement)) {
      return;
    }

    cycleRef.current = nextCopy.offsetLeft - first.offsetLeft;
  }, []);

  // Measure, and home the moment there is a geometry to home against — which
  // is not necessarily this tick. Homing on mount alone is what a first pass
  // did, and it left the strip against its hard left edge on any load where
  // the track had not been laid out yet: the measurement came back 0, the
  // guard skipped, and nothing ever tried again.
  //
  // `ResizeObserver` fires once on `observe()` with the initial size, so the
  // retry costs nothing extra — the callback is already there for resize.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const list = listRef.current;
    if (!(scroller && list)) {
      return;
    }

    const sync = () => {
      measure();
      if (!hasHomedRef.current && cycleRef.current > 0) {
        scroller.scrollLeft = cycleRef.current * HOME_COPY;
        hasHomedRef.current = true;
      }
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(list);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    const handleScroll = () => {
      const cycle = cycleRef.current;
      if (cycle <= 0) {
        return;
      }

      // Half a cycle is ~20 cards, so a single fling never reaches the seam and
      // the correction cannot interrupt momentum scrolling on iOS.
      const offset = scroller.scrollLeft - cycle * HOME_COPY;
      if (offset <= -cycle / 2) {
        scroller.scrollLeft += cycle;
      } else if (offset >= cycle / 2) {
        scroller.scrollLeft -= cycle;
      }
      // The assignment fires another scroll event; that one is inside the band
      // and returns above, so this does not recurse.
    };

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", handleScroll);
  }, []);

  // Before hydration the source order stands in. Nothing is rendered inside the
  // cards until `order` lands, so no media is fetched for a layout that is
  // about to be re-drawn.
  const sequence = order ?? portfolioMedia;

  return (
    // The scroller spans every column and out through both page margins, so it
    // is exactly viewport-wide. The negative margins have to cancel the grid's
    // padding exactly, and the grid does not use one value at both ends — 16
    // below `lg`, 24 above. Anything else overhangs the viewport.
    //
    // The frame's 142 start is `carousel-lead-in` on the track below: padding
    // inside the scroller, not margin outside it. That is the difference
    // between cards stopping at an invisible wall on column 2 and cards
    // travelling on through it and off the edge of the screen.
    <section
      aria-label="Selected project imagery"
      className="col-[1/-1] -mx-sm overflow-x-auto overscroll-x-contain scroll-auto [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-2 lg:-mx-site [&::-webkit-scrollbar]:hidden"
      ref={scrollerRef}
      // A scroll container has to be reachable by keyboard or its content is
      // unreachable without a pointer (WCAG 2.1.1). Chrome and Firefox now do
      // this for scrollers implicitly; Safari does not, so it is set here.
      // biome-ignore lint/a11y/noNoninteractiveTabindex: focusable scroll region
      tabIndex={0}
    >
      <ul className="carousel-lead-in flex w-max gap-[var(--carousel-gap)]" ref={listRef}>
        {SLOT_KEYS.map((slotKey, slot) => {
          const media = sequence[slot % CARD_COUNT];

          return (
            // No fill behind the card. Image cards paint their own blurred
            // still from the first frame they mount, and a grey box behind
            // that is a hard edge the blur has to fight. Video cards have no
            // still, so an empty slot is what shows until frame one — quieter
            // than a grey rectangle announcing itself on a white page.
            <li
              className="relative h-[var(--carousel-card-height)] w-[var(--carousel-card-width)] shrink-0 overflow-hidden"
              key={slotKey}
            >
              {order && media ? <CarouselCard media={media} /> : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
