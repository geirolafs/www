import { HeroDemo } from "@/app/components/localhost/hyphenation/hero-demo";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { EXCEPTION_COUNT, PATTERN_COUNT, SHORT_WORDS } from "@/packages/skiptingar/src";

const { hero } = localhostHyphenationContent;

/** Icelandic number format, `.` for thousands. The counts come from the package. */
const COUNTS = {
  patterns: new Intl.NumberFormat("is").format(PATTERN_COUNT),
  exceptions: new Intl.NumberFormat("is").format(EXCEPTION_COUNT),
  shortWords: new Intl.NumberFormat("is").format(SHORT_WORDS.length),
} as const;

/**
 * The product on its own front page: its name, set in Geist across the full
 * width of the grid with the hyphens typed in, so the page shows what the
 * package does. Under it, one sentence on what skiptingar is, the same text
 * without and with the package (`HeroDemo`), and four facts, each a number
 * and a sentence on why it matters.
 * The section is an `@container`, so `text-hy-hero` sizes the name from the
 * grid's width.
 */
export function Hero() {
  return (
    <section className="hy-hero @container page-grid pt-project pb-hysection">
      {/* The hyphens are part of the picture, so a screen reader gets the word.
          `hy-hero` on the section names the view timeline the bar's page
          name fades in on (globals.css). */}
      <h1
        className="col-span-full -ml-[0.05em] whitespace-nowrap font-hy-text font-semibold text-foreground text-hy-hero [font-feature-settings:'ss01']"
        lang="is"
      >
        <span className="sr-only">{hero.name}</span>
        <span aria-hidden="true">{hero.title}</span>
      </h1>

      <p className="col-span-full mt-28 text-pretty border-foreground border-t pt-xl font-book font-hy-title text-foreground text-hy-intro">
        {hero.lede}
      </p>

      <HeroDemo />

      {/* Each fact is a number and the sentence that reads on from it, so
          a screen reader hears "23.139 letter patterns from…". */}
      <ul className="col-span-full grid gap-x-sm gap-y-xl pt-xl lg:grid-cols-4 lg:gap-x-md">
        {hero.stats.map(stat => (
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
    </section>
  );
}
