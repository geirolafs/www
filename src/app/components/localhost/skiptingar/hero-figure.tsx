"use client";

import { type ReactNode, type RefObject, useEffect, useRef, useState } from "react";
import { LABEL_CLASS } from "@/app/components/localhost/fluid-typography/styles";
import { cn } from "@/lib/utils";
// deep import: the client barrel re-exports code this page must not load; a slimmer `exports` entry replaces this at publish
import { NO_BREAK_SPACE, SOFT_HYPHEN } from "@/packages/skiptingar/src/characters";

/** The font a mark copies from the text it sits on, so its glyph matches. */
type Font = { family: string; size: string; weight: string; style: string };

/**
 * One mark drawn over the text, in px from the column's top left corner: a
 * tinted area behind what changed (red where the browser gets it wrong,
 * yellow where the package fixes it), a red hyphen over a hyphen the browser
 * drew at a soft hyphen, a small bracket under a no-break space, and a red
 * tick on the column's edge where a line runs past it.
 */
type Mark =
  | { kind: "area"; tone: Tone; x: number; y: number; width: number; height: number }
  | { kind: "hyphen"; x: number; y: number; height: number; font: Font }
  | { kind: "space"; x: number; y: number; width: number; height: number }
  | { kind: "edge"; y: number; height: number };

/** A fault the reader should see, or the package's fix for it. */
type Tone = "problem" | "fix";

/** What a finder saw: each note at the height its first mark shows, the glyphs to colour and the marks to draw. */
type Found = { notes: { id: string; at: number }[]; glyphs: Range[]; marks: Mark[] };

/** The column, its box and its measure's right edge (the box less the overflow strip). */
type Finder = (column: HTMLElement, box: DOMRect, edge: number) => Found;

/** One block of the column: its text without soft hyphens, and a way back to the DOM. */
type Block = { text: string; range: (start: number, end: number) => Range };

/** A character the browser drew, with its range and its rectangle. */
type Drawn = { node: Text; range: Range; rect: DOMRect };

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * The block's text with its soft hyphens left out, so a word reads whole, and
 * a `Range` for any run of it. The text is read node by node.
 */
function indexBlock(element: Element): Block {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const at: [Text, number][] = [];
  let text = "";
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const data = (node as Text).data;
    for (let index = 0; index < data.length; index++) {
      if (data[index] !== SOFT_HYPHEN) {
        text += data[index];
        at.push([node as Text, index]);
      }
    }
  }
  return {
    text,
    range: (start, end) => {
      const range = document.createRange();
      const [startNode, startOffset] = at[start] as [Text, number];
      const [endNode, endOffset] = at[end - 1] as [Text, number];
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset + 1);
      return range;
    },
  };
}

const rects = (range: Range) =>
  [...range.getClientRects()].filter(rect => rect.width > 0);

/** Words between spaces. */
function words(block: Block): Range[] {
  return [...block.text.matchAll(/\S+/g)].map(match =>
    block.range(match.index, match.index + match[0].length)
  );
}

/**
 * Each character in the column that passes `test` and that the browser drew.
 * A soft hyphen is drawn only where a line breaks at it, so a test for one
 * finds the hyphens the reader sees.
 */
function drawn(column: HTMLElement, test: (character: string) => boolean): Drawn[] {
  const found: Drawn[] = [];
  const walker = document.createTreeWalker(column, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text;
    for (let index = 0; index < text.length; index++) {
      if (!test(text.data[index] as string)) {
        continue;
      }
      const range = document.createRange();
      range.setStart(text, index);
      range.setEnd(text, index + 1);
      const rect = rects(range)[0];
      if (rect) {
        found.push({ node: text, range, rect });
      }
    }
  }
  return found;
}

/** A note at the first of the things found, if any. */
function note(id: string, found: readonly { rect: DOMRect }[]) {
  const first = found[0];
  return first ? [{ id, at: first.rect.top + first.rect.height / 2 }] : [];
}

function fontOf(node: Text): Font {
  const style = getComputedStyle(node.parentElement ?? document.body);
  return {
    family: style.fontFamily,
    size: style.fontSize,
    weight: style.fontWeight,
    style: style.fontStyle,
  };
}

/**
 * The area behind a run of text, a little wider than its glyphs, cut at
 * `right` (px from the column's left) so it never runs past the visible text.
 */
function area(
  tone: Tone,
  rect: DOMRect,
  box: DOMRect,
  right = Number.POSITIVE_INFINITY
): Mark {
  const x = rect.left - box.left - 2;
  return {
    kind: "area",
    tone,
    x: round(x),
    y: round(rect.top - box.top),
    width: round(Math.min(rect.width + 4, right - x)),
    height: round(rect.height),
  };
}

/** Letters a title word needs to count as one of its long compounds. */
const LONG_WORD = 12;

/**
 * The widest measure at which every fault still shows: 1px under the natural
 * width of the narrowest long compound in the browser's title, so each of
 * them still runs past the edge. A wider column would let one fit, and its
 * fault would be gone. Undefined until the title is laid out.
 */
function faultMeasure(column: HTMLElement): number | undefined {
  const title = column.children[0];
  if (!title) {
    return undefined;
  }
  const widths = words(indexBlock(title))
    .filter(word => word.toString().length >= LONG_WORD)
    .map(word => rects(word)[0]?.width ?? 0)
    .filter(width => width > 0);
  return widths.length > 0 ? Math.floor(Math.min(...widths)) - 1 : undefined;
}

/** The browser's own faults, each only where this layout shows it. */
const findProblems: Finder = (column, box, edge) => {
  // Each word that runs past the edge, and each line it does it on, once.
  const lines = new Map<number, DOMRect>();
  const past: DOMRect[] = [];
  for (const block of [...column.children].map(indexBlock)) {
    for (const word of words(block)) {
      for (const rect of rects(word)) {
        if (rect.right > edge + 1) {
          lines.set(Math.round(rect.top), rect);
          past.push(rect);
        }
      }
    }
  }
  const overflow = [...lines.values()].map(rect => ({ rect }));
  const quotes = drawn(column, character => character === '"');
  return {
    notes: [...note("overflow", overflow), ...note("quotes", quotes)],
    glyphs: quotes.map(quote => quote.range),
    marks: [
      // The overflowing word, cut where its fade ends.
      ...past.map(rect => area("problem", rect, box, box.width)),
      ...quotes.map(({ rect }) => area("problem", rect, box)),
      ...overflow.map(
        ({ rect }): Mark => ({
          kind: "edge",
          y: round(rect.top - box.top),
          height: round(rect.height),
        })
      ),
    ],
  };
};

/** What the package did, each only where this layout shows it. */
const findFixes: Finder = (column, box) => {
  const hyphens = drawn(column, character => character === SOFT_HYPHEN);
  const spaces = drawn(column, character => character === NO_BREAK_SPACE);
  const quotes = drawn(column, character => character === "„" || character === "“");
  return {
    notes: [
      ...note("split", hyphens),
      ...note("glue", spaces),
      ...note("quotes", quotes),
    ],
    // The drawn hyphen is coloured too where the browser paints a highlight
    // on it; the mark over it makes it red where it does not.
    glyphs: [...hyphens, ...quotes].map(found => found.range),
    marks: [
      ...[...hyphens, ...spaces, ...quotes].map(({ rect }) => area("fix", rect, box)),
      ...hyphens.map(
        ({ node, rect }): Mark => ({
          kind: "hyphen",
          x: round(rect.left - box.left),
          y: round(rect.top - box.top),
          height: round(rect.height),
          font: fontOf(node),
        })
      ),
      ...spaces.map(
        ({ rect }): Mark => ({
          kind: "space",
          x: round(rect.left - box.left),
          y: round(rect.top - box.top),
          width: round(rect.width),
          height: round(rect.height),
        })
      ),
    ],
  };
};

/** A no-break space as the reader is shown it: a small bracket open at the top, ␣. */
const SPACE_MARK = "border-hy-signal border-x-[1.5px] border-b-[1.5px]";

/**
 * Each side: where it sits in the shared grid, what it finds, the highlight
 * that colours its glyphs, and the sample each note shows, drawn as the mark
 * in the text is.
 */
const SIDES = {
  without: {
    column: "col-start-1 lg:col-start-2",
    margin: "lg:col-start-1",
    tone: "problem",
    find: findProblems,
    highlight: "hy-glyph-without",
    samples: {
      overflow: <span className="h-[1em] w-0.5 bg-hy-signal" />,
      quotes: '"',
    },
  },
  with: {
    column: "col-start-2 lg:col-start-3",
    margin: "lg:col-start-4",
    tone: "fix",
    find: findFixes,
    highlight: "hy-glyph-with",
    samples: {
      split: "-",
      glue: (
        <span className={cn("h-[0.3em] w-[0.6em] translate-y-[0.25em]", SPACE_MARK)} />
      ),
      quotes: "„“",
    },
  },
} as const satisfies Record<
  string,
  {
    column: string;
    margin: string;
    tone: Tone;
    find: Finder;
    highlight: string;
    samples: Readonly<Record<string, ReactNode>>;
  }
>;

type Side = keyof typeof SIDES;

/** A note, at the height of the line it points at (px from the column's top). */
type Placed = { id: string; label: string; top: number };

/** The least distance between two notes' centres, a little over one line of `text-hy-note`. */
const NOTE_PITCH = 26;

/**
 * Finds the side's notes and marks in the column as it is laid out, colours
 * its glyphs (a CSS custom highlight) and returns the marks to draw over it.
 * Neither changes the layout. It looks again whenever the column's size or
 * text changes, which covers a resize and the fonts arriving.
 */
function useMarks(
  columnRef: RefObject<HTMLDivElement | null>,
  kind: Side,
  labels: Readonly<Record<string, string>>
): { notes: Placed[]; marks: Mark[] } {
  const [state, setState] = useState<{ notes: Placed[]; marks: Mark[] }>({
    notes: [],
    marks: [],
  });

  useEffect(() => {
    const column = columnRef.current;
    if (!column) {
      return;
    }
    const { find, highlight } = SIDES[kind];
    let frame = 0;

    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = column.getBoundingClientRect();
        const edge = box.right - Number.parseFloat(getComputedStyle(column).paddingRight);
        const { notes, glyphs, marks } = find(column, box, edge);
        let floor = Number.NEGATIVE_INFINITY;
        // The browser's side sets the measure both columns share.
        const cap = kind === "without" ? faultMeasure(column) : undefined;
        if (cap) {
          column
            .closest<HTMLElement>("[data-hero-grid]")
            ?.style.setProperty("--hero-measure", `${cap}px`);
        }
        if (typeof Highlight !== "undefined" && CSS.highlights) {
          CSS.highlights.set(highlight, new Highlight(...glyphs));
        }
        // In reading order: where each first shows.
        const next = {
          notes: notes
            .filter(found => labels[found.id])
            .map(found => ({
              id: found.id,
              label: labels[found.id] ?? "",
              top: found.at - box.top,
            }))
            .sort((a, b) => a.top - b.top)
            .map(placed => {
              // Each at least a pitch below the one before.
              const top = round(Math.max(placed.top, floor + NOTE_PITCH));
              floor = top;
              return { ...placed, top };
            }),
          // A run's rectangles can repeat (one per node it spans), so each
          // mark is kept once.
          marks: [...new Map(marks.map(mark => [JSON.stringify(mark), mark])).values()],
        };
        setState(previous =>
          JSON.stringify(previous) === JSON.stringify(next) ? previous : next
        );
      });
    };

    const resize = new ResizeObserver(measure);
    resize.observe(column);
    const mutation = new MutationObserver(measure);
    mutation.observe(column, { subtree: true, childList: true, characterData: true });
    document.fonts.ready.then(measure);
    // The title's size is fluid: it can grow while a capped column keeps its
    // width, so the window's own resize is watched too.
    window.addEventListener("resize", measure);
    measure();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      resize.disconnect();
      mutation.disconnect();
      CSS.highlights?.delete(highlight);
    };
  }, [columnRef, kind, labels]);

  return state;
}

/**
 * The coloured glyphs, as custom highlights. They are here, not in
 * globals.css, because the build's CSS minifier does not know `::highlight()`
 * and drops the rule.
 */
const HIGHLIGHT_CSS =
  "::highlight(hy-glyph-without),::highlight(hy-glyph-with){color:var(--color-hy-signal)}";

/** The highlight rules, once per page however many sides render them. */
export function HighlightStyles() {
  return (
    <style href="hy-hero-highlights" precedence="default">
      {HIGHLIGHT_CSS}
    </style>
  );
}

/**
 * The tint of an area: a light red for a fault, the yellow highlighter for a
 * fix. Multiplied into the page, so the text over it stays its own colour.
 */
const TONES = {
  problem: "bg-hy-signal/20",
  fix: "bg-hy-accent",
} as const satisfies Record<Tone, string>;

function DrawnMark({ mark }: { mark: Mark }) {
  if (mark.kind === "area") {
    return (
      <span
        className={cn("absolute rounded-[2px] mix-blend-multiply", TONES[mark.tone])}
        // The text's place and size, measured from the layout.
        style={{ left: mark.x, top: mark.y, width: mark.width, height: mark.height }}
      />
    );
  }
  if (mark.kind === "edge") {
    return (
      <span
        className="absolute right-0 w-0.5 translate-x-1/2 bg-hy-signal"
        // The line's place and height, measured from the layout.
        style={{ top: mark.y, height: mark.height }}
      />
    );
  }
  if (mark.kind === "space") {
    return (
      <span
        className={cn("absolute", SPACE_MARK)}
        // Under the space, from just above the baseline to just below it.
        style={{
          left: mark.x + mark.width * 0.15,
          width: mark.width * 0.7,
          top: mark.y + mark.height * 0.68,
          height: mark.height * 0.16,
        }}
      />
    );
  }
  return (
    <span
      className="absolute whitespace-nowrap text-hy-signal"
      // The hyphen's own box and font, so the red glyph covers the drawn one.
      style={{
        left: mark.x,
        top: mark.y,
        height: mark.height,
        lineHeight: `${mark.height}px`,
        fontFamily: mark.font.family,
        fontSize: mark.font.size,
        fontWeight: mark.font.weight,
        fontStyle: mark.font.style,
      }}
    >
      -
    </span>
  );
}

/**
 * A note: the mark as the text shows it (the glyph on its tint), then its
 * name. `mirror` puts the mark last, next to the column a left margin faces.
 */
function Note({
  label,
  sample,
  tone,
  mirror = false,
}: {
  label: string;
  sample: ReactNode;
  tone: Tone;
  mirror?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-2xs whitespace-nowrap font-medium text-foreground text-hy-note",
        mirror && "flex-row-reverse"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-[1.4em] min-w-[1.6em] shrink-0 items-center justify-center rounded-[2px] px-0.5 font-bold text-hy-signal leading-none",
          TONES[tone]
        )}
      >
        {sample}
      </span>
      {label}
    </span>
  );
}

/**
 * One side of the hero figure, laid into the grid `HeroDemo` sets: the
 * caption in row 1, the text in rows 2 and 3 (a subgrid, so both sides' titles
 * and paragraphs start on the same lines), the notes in row 4. The figure is
 * `display: contents`, so its parts are items of that one grid, and both
 * columns share their top edge and the rule beside them.
 *
 * Only the glyphs that changed are marked: a hyphen, a quote, a small bracket
 * under a no-break space, a red tick on the edge where a line runs past it.
 * The marks are drawn over the text, never in it, so they change no line.
 * The notes under the column show the same marks.
 */
export function HeroFigureSide({
  kind,
  label,
  notes: labels,
  children,
}: {
  kind: Side;
  label: string;
  notes: Readonly<Record<string, string>>;
  children: ReactNode;
}) {
  const columnRef = useRef<HTMLDivElement>(null);
  const { notes, marks } = useMarks(columnRef, kind, labels);
  const { column, margin, tone, samples } = SIDES[kind];
  const sampleOf = (id: string): ReactNode =>
    (samples as Readonly<Record<string, ReactNode>>)[id];

  return (
    <figure className="contents">
      <figcaption className={cn(LABEL_CLASS, column, "row-start-1")}>{label}</figcaption>

      <div
        className={cn(
          column,
          "row-span-2 row-start-2 grid min-w-0 grid-rows-subgrid gap-y-sm",
          // On the Without side the text may run past the edge, into a strip
          // as wide as the gap that fades out, so a cut-off word reads as
          // running on rather than as a glitch.
          kind === "without" &&
            "-mr-(--hero-gap) overflow-x-clip pr-(--hero-gap) [mask-image:linear-gradient(to_left,transparent,black_var(--hero-gap))]"
        )}
        lang="is"
        ref={columnRef}
      >
        {children}
      </div>

      <div
        aria-hidden="true"
        className={cn(
          column,
          "pointer-events-none relative row-span-2 row-start-2 select-none"
        )}
      >
        {/* The measure's right edge: the line the text is set against. */}
        <span className="absolute -inset-y-sm right-0 w-px bg-border" />
        {marks.map(mark => (
          // A mark is all its values; `useMarks` keeps each only once.
          <DrawnMark key={JSON.stringify(mark)} mark={mark} />
        ))}
      </div>

      {/* From `lg`: in the margin beside the column, each at its line. */}
      <ul
        aria-label={label}
        className={cn(margin, "relative row-span-2 row-start-2 hidden lg:block")}
      >
        {notes.map(placed => (
          <li
            className={cn(
              "absolute -translate-y-1/2",
              kind === "without" ? "right-0" : "left-0"
            )}
            key={placed.id}
            // The line's height in px, measured from the layout.
            style={{ top: placed.top }}
          >
            <Note
              label={placed.label}
              mirror={kind === "without"}
              sample={sampleOf(placed.id)}
              tone={tone}
            />
          </li>
        ))}
      </ul>

      {/* Below `lg`: a list under the column. */}
      <ul
        aria-label={label}
        className={cn(column, "row-start-4 flex flex-col gap-2xs pt-sm lg:hidden")}
      >
        {notes.map(placed => (
          <li key={placed.id}>
            <Note label={placed.label} sample={sampleOf(placed.id)} tone={tone} />
          </li>
        ))}
      </ul>
    </figure>
  );
}
