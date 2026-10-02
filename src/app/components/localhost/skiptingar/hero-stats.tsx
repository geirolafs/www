import { LABEL_CLASS } from "@/app/components/localhost/fluid-typography/styles";
import { localhostSkiptingarContent } from "@/lib/content/localhost-skiptingar";
import { cn } from "@/lib/utils";
import { PATTERN_COUNT } from "@/packages/skiptingar/src";

const { stats, statsTitle } = localhostSkiptingarContent.hero;

/** Icelandic number format, `.` for thousands. The counts come from the package. */
const COUNTS = {
  patterns: new Intl.NumberFormat("is").format(PATTERN_COUNT),
} as const;

/**
 * The facts under the hero's figure, flush left on the page grid. From `lg`
 * the title takes columns 1–4 and each fact takes four from column 5. Below
 * it the title sits on top and the facts stack, since two of the large
 * numbers do not fit side by side on a phone. Each sentence sits 24px under
 * its number, so the two read as one thing: the number carries the fact and
 * the sentence is small and quiet. A screen reader hears it as one line:
 * "23.139 letter patterns from…".
 */
export function HeroStats() {
  return (
    <div className="grid gap-x-sm pt-hyhead lg:col-span-full lg:grid-cols-subgrid">
      <h2 className={cn(LABEL_CLASS, "pb-md lg:col-span-4 lg:pb-0")}>{statsTitle}</h2>
      <ul className="grid gap-y-xl lg:col-span-8 lg:grid-cols-subgrid lg:gap-y-0">
        {stats.map(stat => (
          <li
            className="flex flex-col items-start gap-md text-left lg:col-span-4"
            key={"count" in stat ? stat.count : stat.value}
          >
            <span className="font-hy-text font-medium text-foreground text-hy-stat [font-variation-settings:'MONO'_50]">
              {"count" in stat ? COUNTS[stat.count] : stat.value}{" "}
            </span>
            <span className="max-w-[34ch] text-pretty text-hy-note text-muted leading-snug">
              {stat.description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
