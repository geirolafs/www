import { localhostSkiptingarContent } from "@/lib/content/localhost-skiptingar";
import { PATTERN_COUNT } from "@/packages/skiptingar/src";

const { stats, statsTitle } = localhostSkiptingarContent.hero;

/** Icelandic number format, `.` for thousands. The counts come from the package. */
const COUNTS = {
  patterns: new Intl.NumberFormat("is").format(PATTERN_COUNT),
} as const;

/**
 * The facts under the hero's figure, flush left on the page grid. The title
 * is Areal Medium at 40px, its line as tall as the number (`--text-hy-hero-stat`,
 * 136px at most), so it sits on the numbers' line. From
 * `lg` the title takes columns 1–4 and each fact takes four from column 5. Below
 * it the title sits on top and the facts stack, since two of the large
 * numbers do not fit side by side on a phone. Each sentence sits 24px under
 * its number, so the two read as one thing: the number, large in
 * Areal, carries the fact, and the sentence reads on from it in Bespoke
 * Serif. Both use oldstyle figures. A screen reader hears it as one line:
 * "23.139 letter patterns from…".
 */
export function HeroStats() {
  return (
    <div className="col-span-full mt-hyhead grid gap-x-sm border-foreground border-t pt-xl lg:grid-cols-subgrid">
      <h2 className="pb-md font-hy-text font-medium text-[2.5rem] text-foreground leading-(--text-hy-hero-stat) lg:col-span-4 lg:pb-0">
        {statsTitle}
      </h2>
      <ul className="grid gap-y-xl lg:col-span-8 lg:grid-cols-subgrid lg:gap-y-0">
        {stats.map(stat => (
          <li
            className="flex flex-col items-start gap-md text-left oldstyle-nums lg:col-span-4"
            key={"count" in stat ? stat.count : stat.value}
          >
            <span className="font-hy-text font-medium text-foreground text-hy-hero-stat">
              {"count" in stat ? COUNTS[stat.count] : stat.value}{" "}
            </span>
            <span className="max-w-[30ch] text-pretty font-book font-hy-title text-foreground text-hy-lede">
              {stat.description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
