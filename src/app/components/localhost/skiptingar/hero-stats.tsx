import { InlineCode } from "@/app/components/localhost/fluid-typography/code";
import { SECTION_TITLE_CLASS } from "@/app/components/localhost/fluid-typography/styles";
import { NUMBER } from "@/app/components/localhost/skiptingar/format";
import { localhostSkiptingarContent } from "@/lib/content/localhost-skiptingar";
import { cn } from "@/lib/utils";
import {
  LOCALE_RULE_COUNT,
  LOCALE_RULES,
  PATTERN_COUNT,
} from "@/packages/skiptingar/src";

const { stats, statsTitle } = localhostSkiptingarContent.hero;

/** The counts, in the Icelandic number format. They come from the package. */
const COUNTS = {
  patterns: NUMBER.format(PATTERN_COUNT),
  rules: NUMBER.format(LOCALE_RULE_COUNT),
} as const;

/** Which row of the section each fact takes from `lg`, one under the other. */
const ROW = ["lg:row-start-1", "lg:row-start-2", "lg:row-start-3", "lg:row-start-4"];

/**
 * A rule on the number's baseline, across the whole column: the ruled sheet
 * of the figures above, one line of it. The number's line is 1em tall. Areal's
 * ascent is 0.878em and its descent 0.21em (OS/2 typo metrics, flagged for
 * use), so the half-leading is (1 − 1.088) / 2 = −0.044em and the baseline
 * sits 0.834em below the top of the line. The 1px rule starts there, so the
 * figures stand on it. Change the face or the line height and this changes.
 */
const BASELINE =
  "bg-[linear-gradient(to_bottom,transparent_0.834em,color-mix(in_srgb,var(--color-foreground)_14%,transparent)_0.834em_calc(0.834em+1px),transparent_calc(0.834em+1px))]";

/**
 * The rule names under the locale count, as inline code chips read from the
 * package, at the subtitle's size so no chip is larger than it. They sit in
 * a grid under the baseline rule, like the key to a table: each column as
 * wide as its longest name (`max-content`), and each chip as wide as its
 * column, so the columns line up and no cell is cramped. Five across (two
 * rows for ten rules) once the fact is 36rem wide, which the five widest
 * names need at the largest body size, and two across below it. Five and
 * two both divide ten, so no row is left short. The chips have no fill, so
 * the section's gradient shows through (`.hy-code` sets one outside the
 * layers, hence `bg-transparent!`), and a 1px border in the fix blue
 * (`hy-fix`), the colour the figures above set Skiptingar's fixes in. The number stands alone on its
 * rule, as the other facts' numbers do.
 */
function RuleNames() {
  return (
    <ul
      aria-label="The rules"
      className="grid @min-[36rem]:grid-cols-[repeat(5,max-content)] grid-cols-[repeat(2,max-content)] gap-xs text-hy-body"
    >
      {LOCALE_RULES.map(rule => (
        <li className="flex" key={rule}>
          <InlineCode className="w-full border border-hy-fix bg-transparent! px-[0.6em] py-[0.3em]">
            {rule}
          </InlineCode>
        </li>
      ))}
    </ul>
  );
}

/**
 * The facts under the hero's figures, one for each layer (patterns, better
 * breaks, locale rules, and the server's 0 kB), set as the figures above
 * are but not numbered, since they are facts and not figures: a subtitle
 * naming what is counted, in Areal Medium at body size, the number large in
 * Areal with lining figures, standing on a baseline rule that runs the
 * width of its column (the locale count with its rule names under it,
 * `RuleNames`), and a one-line caption. The title is set as every
 * section title on the page is (`Section`): Bespoke Serif Medium at
 * `text-hy-section`.
 *
 * Below `lg` the facts stack under the title. From `lg` the section is laid
 * out as `HeroDemo` is, and as the sections below are: the title takes
 * columns 1–4 and the facts columns 5–12, one fact to a row, its tag, number
 * and caption stacked as a figure's are, and its baseline rule running to
 * the grid's right edge. A screen reader hears each as tag, number, caption.
 */
export function HeroStats() {
  return (
    <section
      aria-labelledby="hero-facts"
      className="col-span-full mt-hyhead grid grid-cols-subgrid gap-y-hyblock border-foreground border-t pt-xl"
    >
      <h2
        className={cn(
          SECTION_TITLE_CLASS,
          "col-span-6 col-start-2 lg:col-span-4 lg:col-start-1 lg:row-span-4 lg:row-start-1"
        )}
        id="hero-facts"
      >
        {statsTitle}
      </h2>
      {/* `contents` lets each fact sit on the section's grid; `role="list"`
          keeps it a list where `contents` would drop that (Safari). */}
      {/* biome-ignore lint/a11y/noRedundantRoles: Safari drops the list role on `display: contents` */}
      <ul className="contents" role="list">
        {stats.map((stat, index) => {
          const value = "count" in stat ? COUNTS[stat.count] : stat.value;
          return (
            <li
              className={cn(
                "@container col-span-6 col-start-2 flex min-w-0 flex-col gap-md lg:col-span-8 lg:col-start-5",
                ROW[index]
              )}
              key={"count" in stat ? stat.count : stat.value}
            >
              <p className="font-hy-text font-medium text-foreground text-hy-body">
                {stat.label}
              </p>
              <p
                className={cn(
                  "font-hy-text font-medium text-foreground text-hy-hero-stat",
                  BASELINE
                )}
              >
                {value}
              </p>
              {"count" in stat && stat.count === "rules" ? <RuleNames /> : null}
              <p className="text-pretty font-book text-hy-note text-muted">
                {stat.caption}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
