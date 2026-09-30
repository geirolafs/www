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
 * The product on its own front page: its name, set huge in Geist with the
 * hyphens typed in, so the page shows what the package does. Under it, one
 * line on what skiptingar is and four facts.
 */
export function Hero() {
  return (
    <section className="flex flex-col pt-group pb-xl">
      {/* The hyphens are part of the picture, so a screen reader gets the word. */}
      <h1 className="font-hy-text font-medium text-foreground text-hy-hero" lang="is">
        <span className="sr-only">{hero.name}</span>
        <span aria-hidden="true">{hero.title}</span>
      </h1>

      <p className="mt-xl max-w-3xl text-pretty font-bold font-hy-title text-foreground text-hy-title">
        {hero.lede}
      </p>

      <dl className="grid grid-cols-2 gap-x-md gap-y-md md:grid-cols-4">
        {hero.stats.map(stat => (
          <div className="flex flex-col gap-md pt-xl" key={stat.label}>
            <dt className="border-foreground border-t py-1.5 font-semibold text-hy-label text-muted">
              {stat.label}
            </dt>
            <dd className="flex flex-col gap-md">
              {/* Tabular figures, so the four numbers line up in their column. */}
              <span className="font-hy-text font-light text-foreground text-hy-stat tabular-nums">
                {"count" in stat ? COUNTS[stat.count] : stat.value}
              </span>
              <div className="flex border-foreground border-t">
                <HelpTip name={stat.label} tip={stat.tip} />
              </div>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
