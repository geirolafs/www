/**
 * The availability month, shared by the homepage's `AvailabilityLine` and the
 * contact page's markdown rendition so the two can never disagree.
 *
 * Iceland never observes DST, so Atlantic/Reykjavík is permanently UTC+0 —
 * the same fact `LocalClock` runs on. The month is his calendar, not the
 * visitor's: someone reading this at 23:00 in Auckland on 31 August is being
 * told when *he* is free, and that is still September.
 */
const monthFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Atlantic/Reykjavik",
  month: "long",
});

/**
 * Always the month *after* the current one, never the current one.
 *
 * Day 1 of the target month rather than today's date advanced by a month:
 * `setUTCMonth(m + 1)` on the 31st of a 31-day month overflows into the month
 * after next, so 31 August would print October. `Date.UTC` also rolls
 * December into the following January on its own, so the year boundary needs
 * no special case.
 */
export function formatNextMonth(now: Date): string {
  const firstOfNextMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
  );

  return monthFormatter.format(firstOfNextMonth);
}
