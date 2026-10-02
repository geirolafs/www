import type { CSSProperties, ReactNode } from "react";
import { marked } from "@/app/components/localhost/fluid-typography/title";
import { cn } from "@/lib/utils";

type HeroProps = {
  /** The page's name for a screen reader, without the typed hyphens. */
  name: string;
  /** The page's name as it shows, hyphens typed in where it should break. */
  title: string;
  tagline: string;
  lede: string;
  /** The language of the name, when it is not the page's own: `is` for Icelandic. */
  lang?: string;
  /**
   * How many `100cqi` the title is wide, in font sizes. `text-hy-hero` is
   * sized so "Skipt-ing-ar" fills the grid (5.543); a different word sets its
   * own number so it fills the grid too. Both depend on the stylistic sets on
   * `.hy-areal`.
   */
  fit?: number;
  /** The page's own demo, set under the lede: the same text without and with the package. */
  demo?: ReactNode;
  /** The facts, set under the demo: a `<ul>` of numbers, each with a sentence. */
  stats?: ReactNode;
  /**
   * Lay the wash under the hero (`hy-hero-wash`, globals.css): a gradient
   * multiplied over the page colour, so the hero reads apart from the
   * sections under it.
   */
  wash?: boolean;
};

/**
 * The front of a fluid-typography page: its name, set in Geist across the full
 * width of the grid, then one paragraph in the serif: the tagline, then what it is.
 * A page can set a demo and a row of facts under the lede; without them the
 * hero ends at the lede, and the specimens come in the sections below.
 * The section is an `@container`, so `text-hy-hero` sizes the name from the
 * grid's width.
 */
export function Hero({
  name,
  title,
  tagline,
  lede,
  lang,
  fit,
  demo,
  stats,
  wash,
}: HeroProps) {
  return (
    <section
      className={cn(
        "hy-hero @container page-grid pt-project pb-hysection",
        wash && "hy-hero-wash"
      )}
    >
      {/* The hyphens are part of the picture, so a screen reader gets the word.
          `hy-hero` on the section names the view timeline the bar's page
          name fades in on (globals.css). Setting `--text-hy-hero` here, on the
          element, overrides the theme's value for this title alone. */}
      <h1
        className="col-span-full -ml-[0.05em] whitespace-nowrap font-hy-text font-semibold text-foreground text-hy-hero"
        lang={lang}
        style={
          fit
            ? ({ "--text-hy-hero": `calc(100cqi / ${fit})` } as CSSProperties)
            : undefined
        }
      >
        <span className="sr-only">{name}</span>
        <span aria-hidden="true">{marked(title)}</span>
      </h1>

      <p className="col-span-full mt-28 text-pretty border-foreground border-t pt-xl font-book font-hy-title text-foreground text-hy-intro">
        {tagline} {lede}
      </p>

      {demo}

      {stats}
    </section>
  );
}
