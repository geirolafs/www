"use client";

import { useMinuteTick } from "@/lib/hooks/use-minute-tick";
import { cn } from "@/lib/utils";

/**
 * Hidden rather than shown, and digits rather than dashes, because this has to
 * reserve the exact width the real time will take. Tabular figures make every
 * time identical — "09:41", "23:59" and "00:00" all measure 44.18px in Same
 * Univers — but they say nothing about the dash: "--:--" comes out at 26.26px,
 * so dashes would hand the element an 18px jump at hydration, on the one thing
 * in the header pinned to the right edge.
 *
 * `visibility: hidden` keeps the box and drops it from the a11y tree, so the
 * placeholder is never seen and never announced.
 *
 * The reveal is deliberately unanimated. A 200ms fade was tried and removed:
 * hydration lands fast enough that there is no visible pop to bridge, so the
 * fade was animating something nobody was going to see anyway.
 */
const PLACEHOLDER = "00:00";

/**
 * Iceland never observes DST, so Atlantic/Reykjavík is permanently UTC+0 and
 * the "GMT ( UTC+0 )" label next to this clock is true year round.
 *
 * `hourCycle: "h23"` rather than `hour12: false` — the latter resolves to h24
 * in some locales, which prints midnight as 24:00.
 */
const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Atlantic/Reykjavik",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

type Props = {
  className?: string;
};

/** The header clock, in Reykjavík time. */
export function LocalClock({ className }: Props) {
  const now = useMinuteTick();
  const time = now ? formatter.format(now) : null;

  return (
    // `tabular-nums` rather than the raw `font-feature-settings: "tnum" 1`
    // this used to carry: the two measure identically, but
    // `font-feature-settings` resets every other feature to its default, and
    // the high-level property composes. The `lnum` that rode along with it is
    // gone — Same Univers has no oldstyle figures, so it was a no-op.
    <time
      className={cn("tabular-nums", className)}
      dateTime={time ?? undefined}
      style={{ visibility: time ? undefined : "hidden" }}
    >
      {time ?? PLACEHOLDER}
    </time>
  );
}
