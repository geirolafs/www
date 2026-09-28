"use client";

import { useEffect, useState } from "react";

const MILLISECONDS_PER_MINUTE = 60_000;

/**
 * The current time, refreshed on every minute boundary. `null` until the first
 * effect runs.
 *
 * Nothing reads the clock during render on purpose: a prerendered page would
 * bake in its build-time value, which Next flags outright and which is stale by
 * the time anyone loads the page. Consumers render a placeholder for `null`.
 *
 * Ticks re-align to the next boundary after every update rather than running a
 * flat 60s interval — background tabs throttle timers, and an interval that
 * fires late stays late for the rest of the session. `visibilitychange` catches
 * a tab returning from a sleep long enough to have missed a tick entirely.
 */
export function useMinuteTick(): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      setNow(new Date());
      timeout = setTimeout(
        tick,
        MILLISECONDS_PER_MINUTE - (Date.now() % MILLISECONDS_PER_MINUTE)
      );
    };

    const resync = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(timeout);
        tick();
      }
    };

    tick();
    document.addEventListener("visibilitychange", resync);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("visibilitychange", resync);
    };
  }, []);

  return now;
}
