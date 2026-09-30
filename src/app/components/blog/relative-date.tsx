"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const MILLISECONDS_PER_DAY = 86400000;
const DAYS_PER_MONTH = 30;
const DAYS_PER_YEAR = 365;

function formatRelativeDate(date: string): string {
  const currentDate = new Date();
  let dateString = date;
  if (!dateString.includes("T")) {
    dateString = `${dateString}T00:00:00`;
  }
  const targetDate = new Date(dateString);

  if (Number.isNaN(targetDate.getTime())) {
    return date;
  }

  const diffTime = currentDate.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffTime / MILLISECONDS_PER_DAY);

  if (diffDays > DAYS_PER_YEAR) {
    const years = Math.floor(diffDays / DAYS_PER_YEAR);
    return `${years}y ago`;
  }
  if (diffDays > DAYS_PER_MONTH) {
    const months = Math.floor(diffDays / DAYS_PER_MONTH);
    return `${months}mo ago`;
  }
  if (diffDays > 0) {
    return `${diffDays}d ago`;
  }
  if (diffDays === 0) {
    return "Today";
  }
  return "Soon";
}

type Props = {
  date: string;
  className?: string;
};

/**
 * Client component for displaying relative dates.
 * Renders the absolute date on server, hydrates with relative date on client.
 */
export function RelativeDate({ date, className }: Props) {
  const [relativeDate, setRelativeDate] = useState<string | null>(null);

  useEffect(() => {
    setRelativeDate(formatRelativeDate(date));
  }, [date]);

  // Date-only strings parse as UTC midnight; format in UTC too, or a browser
  // west of UTC would hydrate the day before the server's HTML.
  const absoluteDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    // Tabular so the SSR date and the relative date it hydrates into sit on
    // the same digit widths, and so a stack of "2mo ago" / "11mo ago" in the
    // notes list does not wobble — Same Univers' `1` is 40% narrower than its
    // other digits.
    <time className={cn("tabular-nums", className)} dateTime={date}>
      {relativeDate ?? absoluteDate}
    </time>
  );
}
