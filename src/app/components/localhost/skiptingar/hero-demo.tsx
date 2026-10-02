import { processSegments, SOFT_HYPHEN } from "skiptingar";
import {
  SECTION_TITLE_CLASS,
  TITLE_CLASS,
} from "@/app/components/localhost/fluid-typography/styles";
import { PAGE_LOCALE_DETAILS } from "@/app/components/localhost/skiptingar/settings";
import { localhostSkiptingarContent } from "@/lib/content/localhost-skiptingar";
import { cn } from "@/lib/utils";

const { demo } = localhostSkiptingarContent.hero;

type Row = {
  readonly id: string;
  readonly parts: readonly { readonly text: string; readonly mark?: boolean }[];
  readonly measure: string;
  readonly caption: string;
  /** The browser's side runs past the measure. */
  readonly overflow?: boolean;
  /** No dimension line: the measure is the wider of two settings. */
  readonly bare?: boolean;
};
type Kind = "without" | "with";

/** The samples' face and size: the serif, tight, so 1.1em is one line. */
const SAMPLE_CLASS = cn(TITLE_CLASS, "text-hy-title leading-[1.1]");

/** The small labels on the drawing, in Areal. */
const TAG_CLASS = "font-medium text-hy-caption text-muted";

/**
 * A rule on the baseline of every line of the sample, across the whole panel:
 * the ruled sheet the text is set on. Each line is 1.1em tall. Bespoke Serif's
 * ascent is 1.01em and its descent 0.27em (OS/2 typo metrics, which the font
 * flags for use, and hhea agrees), so the half-leading is (1.1 − 1.28) / 2 =
 * −0.09em and the baseline sits 0.92em below the top of each line. The 1px
 * rule starts there, so the letters stand on it. Change the face or the line
 * height and this number must change too.
 */
const RULED =
  "bg-[repeating-linear-gradient(to_bottom,transparent_0_0.92em,color-mix(in_srgb,var(--color-foreground)_14%,transparent)_0.92em_calc(0.92em+1px),transparent_calc(0.92em+1px)_1.1em)]";

/**
 * What the package fixes is set in blue (`hy-fix`), the glyph itself. The
 * browser draws the hyphen at a soft hyphen in the colour of the element
 * holding it, so the hyphens the package adds come out blue too.
 */
const FIX = "text-hy-fix";

/** Red hatching past the measure, where the browser's line runs out of room. */
const HATCH =
  "after:absolute after:inset-y-0 after:left-full after:w-screen after:bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,var(--color-hy-signal)_45%,transparent)_0_1px,transparent_1px_7px)]";

/**
 * Where each figure sits from `lg`: two to a row in columns 5–12, each pair
 * on four shared rows. The second pair starts on row 5, a block further down
 * (`mt-hyblock`), so each pair reads as its own row of figures.
 */
const PLACE = [
  "lg:col-start-5 lg:row-start-1",
  "lg:col-start-9 lg:row-start-1",
  "lg:col-start-5 lg:row-start-5 lg:mt-hyblock",
  "lg:col-start-9 lg:row-start-5 lg:mt-hyblock",
];

/**
 * The row's parts as the server sets them with the page's defaults:
 * hyphenation, then the locale details. The parts go in as segments, so a rule
 * that spans two parts (a no-break space) still applies and each part keeps
 * its own mark.
 */
function processed(row: Row): string[] {
  return processSegments(
    row.parts.map(part => part.text),
    { localeDetails: PAGE_LOCALE_DETAILS, hyphenate: {} }
  );
}

const ROWS: readonly Row[] = demo.rows;

/** Each row set once, at module load: the copy is fixed, so no render repeats it. */
const PROCESSED = new Map(ROWS.map(row => [row, processed(row)]));

/**
 * The text with each soft hyphen in a blue span. The browser draws the
 * hyphen at a soft hyphen it breaks at in the style of the element holding
 * the soft hyphen, so the hyphens the package adds come out blue, with
 * no measuring. A soft hyphen the browser does not use draws nothing.
 */
function colourHyphens(text: string, key: number) {
  return text.split(SOFT_HYPHEN).flatMap((piece, index) =>
    index === 0
      ? [piece]
      : [
          // biome-ignore lint/suspicious/noArrayIndexKey: the pieces are fixed copy and never reorder
          <span className={FIX} key={`${key}-${index}`}>
            {SOFT_HYPHEN}
          </span>,
          piece,
        ]
  );
}

/**
 * The parts; a `mark`ed one in red on the browser's side, blue on the
 * package's, where the hyphens it adds are blue too.
 */
function Parts({ row, kind }: { row: Row; kind: Kind }) {
  const texts =
    (kind === "with" && PROCESSED.get(row)) || row.parts.map(part => part.text);
  return row.parts.map((part, index) => {
    const raw = texts[index] ?? part.text;
    const text = kind === "with" ? colourHyphens(raw, index) : raw;
    return part.mark ? (
      <span
        className={kind === "with" ? FIX : "text-hy-signal"}
        // biome-ignore lint/suspicious/noArrayIndexKey: the parts are fixed copy and never reorder
        key={index}
      >
        {text}
      </span>
    ) : (
      text
    );
  });
}

/**
 * The invisible copy of the measure that sets a column's width. A box holding
 * it and a `w-0 min-w-full` child is as wide as the measure in any font.
 */
function Ghost({ text }: { text: string }) {
  return (
    <span
      aria-hidden="true"
      className="invisible col-start-1 row-start-1 h-0 whitespace-nowrap"
    >
      {text}
    </span>
  );
}

/** The measure drawn as a dimension line over the figure, with ticks at both ends. */
function Dimension({ row }: { row: Row }) {
  return (
    <div aria-hidden="true" className={cn(SAMPLE_CLASS, "grid w-max max-w-full")}>
      <Ghost text={row.measure} />
      <span className="relative col-start-1 row-start-1 h-2 w-0 min-w-full border-foreground border-x">
        <span className="absolute inset-x-0 top-1/2 h-px bg-foreground" />
      </span>
    </div>
  );
}

/**
 * One side of a figure: its tag, then the sample on the ruled sheet, as wide
 * as the measure. A dashed rule marks the measure's edge and runs a little
 * past the text. On the browser's side of an `overflow` figure the rule is
 * red, the ground past it is hatched red, and what runs past it is red: the
 * sample is set twice in the same cell, one copy clipped at the rule and a red
 * copy clipped to what lies past it. On the package's side each hyphen the
 * browser drew at a soft hyphen is blue (`colourHyphens`).
 */
function Panel({ row, kind }: { row: Row; kind: Kind }) {
  const fault = kind === "without" && row.overflow;
  const bare = row.bare;
  const text = <Parts kind={kind} row={row} />;
  const sample = (
    <p
      className={cn(
        "relative grid w-max max-w-full [hyphenate-character:'-']",
        !bare && "before:absolute before:-inset-y-2xs before:right-0 before:border-r",
        fault && cn("before:border-hy-signal", HATCH),
        !(fault || bare) && "before:border-foreground/50 before:border-dashed",
        kind === "with" ? "hyphens-manual" : "hyphens-auto"
      )}
      lang="is"
    >
      <Ghost text={row.measure} />
      <span
        className={cn(
          "relative z-1 col-start-1 row-start-1 w-0 min-w-full",
          fault && "[clip-path:inset(-1em_0_-1em_-1em)]"
        )}
      >
        {text}
      </span>
      {fault ? (
        <span
          aria-hidden="true"
          className="relative z-1 col-start-1 row-start-1 w-0 min-w-full text-hy-signal [clip-path:inset(-1em_-100vw_-1em_100%)]"
        >
          {text}
        </span>
      ) : null}
    </p>
  );
  return (
    <div className="flex flex-col gap-2xs">
      <p className={TAG_CLASS}>{kind === "with" ? demo.with : demo.without}</p>
      <div className={cn(SAMPLE_CLASS, RULED, "overflow-x-clip")}>{sample}</div>
    </div>
  );
}

/**
 * What the package fixes, under the lede, drawn as figures in a technical
 * manual. Each figure is one problem: the measure as a dimension line, then
 * the same text set at that measure on a ruled sheet, by the browser alone and
 * with Skiptingar, and a one-line numbered caption. Red is the fault, blue
 * the fix. The title is set as the facts' title is (`HeroStats`).
 *
 * Below `lg` the figures stack under the title. From `lg` each figure's four
 * parts (measure, browser, Skiptingar, caption) sit on four rows the two
 * figures share (`grid-rows-subgrid`), so matching parts line up across them
 * however many lines a sample takes. From `lg` the title takes
 * columns 1–4 and the figures four columns each from column 5, two to a row,
 * the same columns the facts use below.
 */
export function HeroDemo() {
  return (
    <section
      aria-labelledby="hero-fixes"
      className="col-span-full mt-hyhead grid grid-cols-subgrid gap-y-hyblock border-foreground border-t pt-xl lg:gap-y-md"
    >
      <h2
        className={cn(
          SECTION_TITLE_CLASS,
          "col-span-6 col-start-2 lg:col-span-4 lg:col-start-1 lg:row-span-4 lg:row-start-1"
        )}
        id="hero-fixes"
      >
        {demo.title}
      </h2>
      {ROWS.map((row, index) => (
        <figure
          className={cn(
            "col-span-6 col-start-2 flex min-w-0 flex-col gap-md lg:col-span-4 lg:row-span-4 lg:grid lg:grid-rows-subgrid",
            PLACE[index]
          )}
          key={row.id}
        >
          {/* A bare figure keeps the row, empty, so its parts stay on the
              rows the figure beside it uses. */}
          {row.bare ? <div aria-hidden="true" /> : <Dimension row={row} />}
          <Panel kind="without" row={row} />
          <Panel kind="with" row={row} />
          <figcaption className="text-pretty font-book text-hy-note text-muted">
            <span className="font-medium text-foreground">
              {demo.figureLabel} {index + 1}
            </span>{" "}
            {row.caption}
          </figcaption>
        </figure>
      ))}
    </section>
  );
}
