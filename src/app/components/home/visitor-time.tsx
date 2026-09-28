"use client";

import { useMinuteTick } from "@/lib/hooks/use-minute-tick";

const MINUTES_PER_HOUR = 60;

/** "4h", "5h 30m", "45m" — whole hours dropped when there are none. */
function formatOffset(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;

  if (hours === 0) {
    return `${minutes}m`;
  }
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

type Props = {
  className?: string;
  /** Shown before the visitor's zone is known, and to anyone already on UTC+0. */
  fallback: string;
};

/**
 * Turns the static timezone label into the fact a visitor actually wants: how
 * far their day is from mine. It does not print their local time — they are
 * already looking at a clock, and the only number here they cannot read off
 * their own screen is the gap.
 *
 * The zone comes from `Intl`, not the Geolocation API — it is the OS timezone
 * setting, so there is no permission prompt, no dialog to decline, and nothing
 * to explain.
 *
 * Reykjavík is permanently UTC+0, so the gap is just the visitor's own UTC
 * offset — no second zone conversion needed. Anyone already at UTC+0 (Iceland,
 * winter UK, Lisbon) sees the plain label instead, since "0h behind" is noise.
 */
export function VisitorTime({ className, fallback }: Props) {
  const now = useMinuteTick();

  if (!now) {
    return <p className={className}>{fallback}</p>;
  }

  // getTimezoneOffset counts minutes *behind* UTC, so the sign is inverted.
  const offsetMinutes = -now.getTimezoneOffset();

  if (offsetMinutes === 0) {
    return <p className={className}>{fallback}</p>;
  }

  const direction = offsetMinutes > 0 ? "ahead of" : "behind";
  const distance = formatOffset(Math.abs(offsetMinutes));

  // Proportional digits, unlike the clock next to it. The offset only moves at
  // a DST boundary, so there is no per-minute width jog to pin down, and this
  // is running prose — tabular figures would just read gappy inside a sentence.
  return (
    <p className={className}>
      You are {distance} {direction} me
    </p>
  );
}
