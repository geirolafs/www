import {
  EDITOR_CLASS,
  TITLE_CLASS,
} from "@/app/components/localhost/fluid-typography/styles";
import {
  HeroFigureSide,
  HighlightStyles,
} from "@/app/components/localhost/skiptingar/hero-figure";
import { PAGE_TYPESET } from "@/app/components/localhost/skiptingar/settings";
import { localhostSkiptingarContent } from "@/lib/content/localhost-skiptingar";
import { cn } from "@/lib/utils";
import { processSegments } from "@/packages/skiptingar/src";

const { demo } = localhostSkiptingarContent.hero;

const title = processed(demo.title);
const text = processed(demo.text);

/** The server's two layers: the patterns, then the typeset rules (the page's defaults). */
function processed(text: string): string {
  const [output = text] = processSegments([text], {
    typeset: PAGE_TYPESET,
    hyphenate: {},
  });
  return output;
}

/**
 * The claim in one look, under the lede: the same title and paragraph as the
 * browser sets it alone and with skiptingar, side by side on one grid. Two
 * columns below `lg`, with each side's notes in a list under it; four from
 * `lg`, the notes in the outer two, each at its line.
 *
 * Both text columns are the same width, start on the same lines (a subgrid,
 * see `HeroFigureSide`) and have rules of the same length, so the only
 * difference between them is the typesetting. A light red area marks what
 * the browser gets wrong and the yellow highlighter what the package fixed,
 * with the changed glyph itself in red. The package's side shows the three
 * layers: hyphenation and typeset, made on the server (the browser lays it
 * out with `hyphens: manual` and ships no JavaScript for either), and CSS
 * `text-balance` on the title and `text-pretty` on the body. The browser's
 * side wraps greedily. The facts follow in their own section (`HeroStats`).
 *
 * Each text column is as wide as it can be, up to `--hero-measure`: the widest
 * measure at which every fault in the browser's text still shows, measured in
 * the browser (`HeroFigureSide`). 17.5rem until then. From `lg` the notes'
 * columns take what is left.
 *
 * `--hero-gap` is the grid's gutter, the page grid's own from `lg`, and the
 * width of the strip the browser's overflowing words fade out in.
 */
export function HeroDemo() {
  return (
    <section
      aria-label={demo.label}
      className="col-span-full mt-hyhead grid grid-cols-[repeat(2,minmax(0,var(--hero-measure,17.5rem)))] gap-x-(--hero-gap) gap-y-md border-foreground border-y py-xl [--hero-gap:var(--spacing-sm)] lg:grid-cols-[minmax(0,1fr)_repeat(2,minmax(0,var(--hero-measure,17.5rem)))_minmax(0,1fr)] lg:[--hero-gap:var(--grid-gutter)]"
      data-hero-grid=""
    >
      <HighlightStyles />
      <HeroFigureSide
        kind="without"
        label={demo.without.label}
        notes={demo.without.notes}
      >
        <p className={cn(TITLE_CLASS, "hyphens-auto text-wrap text-hy-lede")}>
          {demo.title}
        </p>
        <p className={cn(EDITOR_CLASS, "hyphens-auto text-wrap")}>{demo.text}</p>
      </HeroFigureSide>
      <HeroFigureSide kind="with" label={demo.with.label} notes={demo.with.notes}>
        <p className={cn(TITLE_CLASS, "hyphens-manual text-balance text-hy-lede")}>
          {title}
        </p>
        <p className={cn(EDITOR_CLASS, "hyphens-manual text-pretty")}>{text}</p>
      </HeroFigureSide>
    </section>
  );
}
