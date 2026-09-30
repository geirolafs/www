import { headerBarContent } from "@/lib/content/home";
import { LocalClock } from "./local-clock";
import { VisitorTime } from "./visitor-time";

/**
 * 59 tall on desktop, 80 on mobile, both 24 of padding around a cap-height
 * row: 11 at 16px, 10 at 14px.
 *
 * Desktop is one row on columns 6–12 — location left, timezone and clock
 * pushed to the right edge. Mobile is also one row, but the right-hand pair
 * swaps: timezone first, then the clock, each keeping its own weight — muted
 * label, semibold time — 12 apart. The row spans columns 2–8: location
 * starts on column 2, left-aligned with the content column below it, and the
 * pair ends flush with column 8, so on the right the header reaches past the
 * 2–7 content column into column 8, the page's empty right-hand column.
 *
 * `cap-trim` sits on the three text elements and not on the row that holds
 * them. `text-box` trims the first and last line boxes of a block container,
 * and a flex row has no line boxes of its own, so on the parent it is simply
 * inert.
 *
 * `data-reveal="load"` on the row, not on its three leaves: the header is one
 * small band of meta text, and staggering location against clock against
 * timezone would draw attention to a corner of the page that is meant to be
 * read at a glance and then ignored. It is always in view at load, so it
 * takes `RevealObserver`'s reveal-on-mount path — distinct from the
 * scroll-gated `data-reveal` the four content sections use — rather than
 * waiting on a scroll.
 *
 * Safe to reveal even though it is above the fold: LCP is the introduction's
 * first paragraph, and this row's text blocks are `--text-meta` at 14–16px —
 * an order of magnitude smaller in painted area, so hiding it briefly cannot
 * move the metric. The Introduction itself stays excluded for exactly the
 * reason this one does not have to be.
 */
export function HeaderBar() {
  const { location, timezone } = headerBarContent;

  return (
    <header
      className="page-grid h-20 content-center py-md text-meta lg:h-[59px]"
      data-reveal="load"
    >
      <div className="col-span-7 col-start-2 flex items-baseline justify-between gap-md lg:col-span-7 lg:col-start-6">
        <p className="cap-trim text-balance font-regular text-muted lg:order-1">
          {location}
        </p>
        <div className="flex items-baseline gap-xs lg:contents">
          <VisitorTime
            className="cap-trim whitespace-nowrap font-regular text-muted lg:order-2 lg:ml-auto"
            fallback={timezone}
          />
          <LocalClock className="cap-trim font-semibold text-foreground lg:order-3" />
        </div>
      </div>
    </header>
  );
}
