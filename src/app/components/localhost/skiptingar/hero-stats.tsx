import { localhostSkiptingarContent } from "@/lib/content/localhost-skiptingar";
import { EXCEPTION_COUNT, PATTERN_COUNT } from "@/packages/skiptingar/src";

const { stats } = localhostSkiptingarContent.hero;

/** Icelandic number format, `.` for thousands. The counts come from the package. */
const COUNTS = {
  patterns: new Intl.NumberFormat("is").format(PATTERN_COUNT),
  exceptions: new Intl.NumberFormat("is").format(EXCEPTION_COUNT),
} as const;

/**
 * The facts under the hero's demo: each a number and the sentence that reads
 * on from it, so a screen reader hears "23.139 letter patterns from…".
 */
export function HeroStats() {
  return (
    <ul className="col-span-full grid gap-x-sm gap-y-xl pt-xl lg:grid-cols-3 lg:gap-x-md">
      {stats.map(stat => (
        <li
          className="flex flex-col gap-md border-foreground border-t pt-md"
          key={"count" in stat ? stat.count : stat.value}
        >
          <span className="font-hy-title font-light text-foreground text-hy-stat">
            {"count" in stat ? COUNTS[stat.count] : stat.value}
          </span>
          <span className="max-w-96 text-pretty font-book text-hy-body text-muted">
            {stat.description}
          </span>
        </li>
      ))}
    </ul>
  );
}
