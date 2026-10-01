import { HelpTip } from "@/app/components/localhost/hyphenation/tip";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { EXCEPTION_COUNT, PATTERN_COUNT } from "@/packages/skiptingar/src";

const { hero } = localhostHyphenationContent;

/** Icelandic number format, `.` for thousands. The counts come from the package. */
const COUNTS = {
  patterns: new Intl.NumberFormat("is").format(PATTERN_COUNT),
  exceptions: new Intl.NumberFormat("is").format(EXCEPTION_COUNT),
} as const;

/**
 * The product on its own front page: its name, set in Geist across the full
 * width of the grid with the hyphens typed in, so the page shows what the
 * package does. Under it, one sentence on what skiptingar is and four facts.
 * The section is an `@container`, so `text-hy-hero` sizes the name from the
 * grid's width.
 */
export function Hero() {
  return (
    <section className="@container page-grid pt-group pb-xl">
      {/* The hyphens are part of the picture, so a screen reader gets the word.
          `hy-hero-title` names the view timeline the top bar's page name
          fades in on (globals.css). */}
      <h1
        className="hy-hero-title col-span-full -ml-[0.05em] whitespace-nowrap font-hy-text font-semibold text-foreground text-hy-hero [font-feature-settings:'ss01']"
        lang="is"
      >
        <span className="sr-only">{hero.name}</span>
        <span aria-hidden="true">{hero.title}</span>
      </h1>

      <p className="col-span-full mt-28 text-pretty border-foreground border-t pt-xl font-book font-hy-title text-foreground text-hy-intro">
        {hero.lede}
      </p>

      <dl className="col-span-full grid grid-cols-2 gap-x-sm lg:grid-cols-4 lg:gap-x-md">
        {hero.stats.map(stat => (
          <div className="flex flex-col gap-md pt-xl" key={stat.label}>
            <dt className="flex items-start border-foreground border-t font-semibold text-hy-label text-muted">
              <HelpTip name={stat.label} tip={stat.tip} />
              {stat.label}
            </dt>
            <dd className="font-hy-title font-light text-foreground text-hy-stat">
              {"count" in stat ? COUNTS[stat.count] : stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
