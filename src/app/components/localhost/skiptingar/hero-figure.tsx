"use client";

import { type ReactNode, type RefObject, useEffect, useRef, useState } from "react";
import { LABEL_CLASS } from "@/app/components/localhost/fluid-typography/styles";
import { cn } from "@/lib/utils";
// deep import: the client barrel re-exports code this page must not load; a slimmer `exports` entry replaces this at publish
import { NO_BREAK_SPACE, SOFT_HYPHEN } from "@/packages/skiptingar/src/characters";

/** A note in the margin, at the height of the line it points at. */
type Placed = { id: string; label: string; top: number };

/** One block of the column: its text without soft hyphens, and a way back to the DOM. */
type Block = { text: string; range: (start: number, end: number) => Range };

type Word = { start: number; end: number; text: string };

/** What a finder saw: the text it marks, and the line its note sits on. */
type Found = { id: string; ranges: Range[]; anchor: DOMRect };

/** What the server knows about the text that the laid-out text no longer shows. */
export type Known = {
  /** The start of each compound up to a joint. */
  joints: readonly string[];
  /** The phrases the typeset rules glued, each space a plain space. */
  glued: readonly string[];
};

type Finder = (blocks: readonly Block[], column: DOMRect, known: Known) => Found[];

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

function matches(block: Block, pattern: RegExp): Word[] {
  return [...block.text.matchAll(pattern)].map(match => ({
    start: match.index,
    end: match.index + match[0].length,
    text: match[0],
  }));
}

/** Words between spaces. A no-break space counts as one, so glued words are separate. */
const words = (block: Block) => matches(block, /\S+/g);

const rects = (range: Range) =>
  [...range.getClientRects()].filter(rect => rect.width > 0);

/**
 * Whether the character `after` sits on a line below the one `before` ends
 * on. A character just after a soft-hyphen break also reports a box on the
 * line above, so its last box is the one that counts.
 */
function breaksBetween(before: Range, after: Range): boolean {
  const end = rects(before).at(-1);
  const start = rects(after).at(-1);
  return Boolean(end && start && start.top > end.top + end.height / 2);
}

/** A note for the ranges, at the first one's first line. Nothing found, no note. */
function found(id: string, ranges: Range[], anchor?: DOMRect): Found[] {
  const first = anchor ?? (ranges[0] && rects(ranges[0])[0]);
  return first ? [{ id, ranges, anchor: first }] : [];
}

/** The browser's own faults, each only where this layout shows it. */
const findProblems: Finder = (blocks, column) => {
  const overflow: Range[] = [];
  let overflowAt: DOMRect | undefined;
  const quotes: Range[] = [];
  for (const block of blocks) {
    for (const word of words(block)) {
      const range = block.range(word.start, word.end);
      const past = rects(range).find(rect => rect.right > column.right + 1);
      if (past) {
        overflow.push(range);
        overflowAt ??= past;
      }
    }
    for (const quote of matches(block, /"/g)) {
      quotes.push(block.range(quote.start, quote.end));
    }
  }
  return [...found("overflow", overflow, overflowAt), ...found("quotes", quotes)];
};

/** What the package did, each only where this layout shows it. */
const findFixes: Finder = (blocks, _column, { joints, glued }) => {
  const joint: Range[] = [];
  let jointAt: DOMRect | undefined;
  const glue: Range[] = [];
  const quotes: Range[] = [];
  for (const block of blocks) {
    for (const word of words(block)) {
      // Broken right after a joint: the part before it ends one line and
      // the letter after it starts the next. The note sits on the line
      // that ends in the hyphen.
      for (const prefix of joints) {
        const cut = word.start + prefix.length;
        if (!word.text.startsWith(prefix) || cut >= word.end) {
          continue;
        }
        const before = block.range(word.start, cut);
        if (breaksBetween(before, block.range(cut, cut + 1))) {
          joint.push(block.range(word.start, word.end));
          jointAt ??= rects(before).at(-1);
          break;
        }
      }
    }
    // The glued phrases come from the server's text, each space a plain one.
    const plain = block.text.replaceAll(NO_BREAK_SPACE, " ");
    for (const phrase of glued) {
      for (let at = plain.indexOf(phrase); at >= 0; at = plain.indexOf(phrase, at + 1)) {
        glue.push(block.range(at, at + phrase.length));
      }
    }
    for (const quote of matches(block, /[„“]/g)) {
      quotes.push(block.range(quote.start, quote.end));
    }
  }
  return [
    ...found("joint", joint, jointAt),
    ...found("glue", glue),
    ...found("quotes", quotes),
  ];
};

const SIDES = {
  without: { find: findProblems, highlight: "hy-problem" },
  with: { find: findFixes, highlight: "hy-fix" },
} as const;

/** The least distance between two notes' centres, a little over one line of `text-hy-note`. */
const NOTE_PITCH = 26;

/**
 * Finds the side's notes in the column as it is laid out, marks their text
 * (a CSS custom highlight, so the marks change no layout) and places each
 * note at its line. It looks again whenever the column's size or text
 * changes, which covers a resize and the fonts arriving.
 */
function useNotes(
  columnRef: RefObject<HTMLDivElement | null>,
  kind: keyof typeof SIDES,
  labels: Readonly<Record<string, string>>,
  known: Known
): Placed[] {
  const [notes, setNotes] = useState<Placed[]>([]);

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
        const blocks = [...column.children].map(indexBlock);
        const all = find(blocks, box, known).filter(note => labels[note.id]);
        if (typeof Highlight !== "undefined" && CSS.highlights) {
          CSS.highlights.set(
            highlight,
            new Highlight(...all.flatMap(note => note.ranges))
          );
        }
        // In reading order, each at least a pitch below the one before.
        let floor = Number.NEGATIVE_INFINITY;
        const placed = all
          .map(note => ({
            id: note.id,
            label: labels[note.id] ?? "",
            top: note.anchor.top + note.anchor.height / 2 - box.top,
          }))
          .sort((a, b) => a.top - b.top)
          .map(note => {
            const top = Math.max(note.top, floor + NOTE_PITCH);
            floor = top;
            return { ...note, top };
          });
        setNotes(previous =>
          JSON.stringify(previous) === JSON.stringify(placed) ? previous : placed
        );
      });
    };

    const resize = new ResizeObserver(measure);
    resize.observe(column);
    const mutation = new MutationObserver(measure);
    mutation.observe(column, { subtree: true, childList: true, characterData: true });
    document.fonts.ready.then(measure);
    measure();

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      CSS.highlights?.delete(highlight);
    };
  }, [columnRef, kind, labels, known]);

  return notes;
}

const NOTHING_KNOWN: Known = { joints: [], glued: [] };

/**
 * The marks in the text, as custom highlights: the same as `.hy-problem-mark`
 * and `.hy-fix-mark` in globals.css. They are here, not there, because the
 * build's CSS minifier does not know `::highlight()` and drops the rule.
 */
const HIGHLIGHT_CSS = `::highlight(hy-problem){text-decoration:underline wavy var(--color-hy-signal)}::highlight(hy-fix){text-decoration:underline var(--color-hy-accent);text-decoration-thickness:.4em;text-underline-offset:-.25em;text-decoration-skip-ink:none}`;

/** The highlight rules, once per page however many sides render them. */
export function HighlightStyles() {
  return (
    <style href="hy-hero-highlights" precedence="default">
      {HIGHLIGHT_CSS}
    </style>
  );
}

/** A note's label, drawn the way its text is marked: a red wave for a fault, the yellow band for a fix (globals.css). */
function Note({ label, kind }: { label: string; kind: keyof typeof SIDES }) {
  return (
    <span
      className={cn(
        "whitespace-nowrap font-medium text-foreground text-hy-note",
        kind === "with" ? "hy-fix-mark" : "hy-problem-mark"
      )}
    >
      {label}
    </span>
  );
}

/**
 * One side of the hero figure: a caption, the text in a narrow column whose
 * right edge is drawn, and notes on what this layout shows. From `sm` up the
 * notes sit in a margin beside the column, each at its line; the Without side
 * mirrors at `xl`, so the two columns face each other across the middle and
 * the notes sit outside. Below `sm` the notes are a list under the column,
 * keyed to the text by their marks.
 */
export function HeroFigureSide({
  kind,
  label,
  notes: labels,
  known = NOTHING_KNOWN,
  children,
}: {
  kind: keyof typeof SIDES;
  label: string;
  notes: Readonly<Record<string, string>>;
  known?: Known;
  children: ReactNode;
}) {
  const columnRef = useRef<HTMLDivElement>(null);
  const notes = useNotes(columnRef, kind, labels, known);
  const mirror = kind === "without";

  return (
    <figure
      className={cn(
        "grid min-w-0 grid-cols-[minmax(0,17.5rem)] gap-y-md",
        "sm:grid-cols-[17.5rem_minmax(0,1fr)]",
        mirror
          ? "sm:gap-x-project xl:grid-cols-[minmax(0,1fr)_17.5rem] xl:gap-x-md"
          : "sm:gap-x-md",
        // Clipped at the figure's edge: an overflowing word never widens the
        // page. At `xl` it runs into the gap between the two columns.
        "overflow-x-clip xl:overflow-x-visible"
      )}
    >
      <figcaption className={cn(LABEL_CLASS, "row-start-1", mirror && "xl:col-start-2")}>
        {label}
      </figcaption>

      <div className={cn("relative row-start-2", mirror && "xl:col-start-2")} lang="is">
        {/* The measure's right edge: the line the text is set against. */}
        <span
          aria-hidden="true"
          className="absolute -inset-y-sm right-0 w-px bg-border"
        />
        {/* On the Without side the text may run past the edge, into a strip
            as wide as the gap that fades out, so a cut-off word reads as
            running on rather than as a glitch. */}
        <div
          className={cn(
            mirror &&
              "-mr-project overflow-x-clip pr-project [mask-image:linear-gradient(to_left,transparent,black_4rem)]"
          )}
        >
          <div className="flex flex-col gap-sm" ref={columnRef}>
            {children}
          </div>
        </div>
      </div>

      <ul
        aria-label={label}
        className={cn("relative row-start-2 hidden sm:block", mirror && "xl:col-start-1")}
      >
        {notes.map(note => (
          <li
            className={cn(
              "absolute -translate-y-1/2",
              mirror ? "left-0 xl:right-0 xl:left-auto" : "left-0"
            )}
            key={note.id}
            // The line's height in px, measured from the layout.
            style={{ top: note.top }}
          >
            <Note kind={kind} label={note.label} />
          </li>
        ))}
      </ul>

      <ul aria-label={label} className="row-start-3 flex flex-col gap-2xs sm:hidden">
        {notes.map(note => (
          <li key={note.id}>
            <Note kind={kind} label={note.label} />
          </li>
        ))}
      </ul>
    </figure>
  );
}
