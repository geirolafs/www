"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { MarkedText } from "@/app/components/localhost/hyphenation/marked-text";
import { SettledContent } from "@/app/components/localhost/hyphenation/settled-content";
import { Stage } from "@/app/components/localhost/hyphenation/stage";
import { LABEL_CLASS } from "@/app/components/localhost/hyphenation/styles";
import type { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";
import {
  SettledText,
  SOFT_HYPHEN,
  useSettledRag,
} from "@/packages/skiptingar/src/client";
import {
  DEFAULT_RAG_OPTIONS,
  isShortWord,
  type MeasuredLine,
  ragCost,
} from "@/packages/skiptingar/src/rag";

type Copy = Omit<(typeof localhostHyphenationContent)["ragSection"]["diagram"], "text">;

/**
 * The face and size of the pipeline's last card, so the eye follows one
 * paragraph across the row.
 */
const TEXT_CLASS = "font-hy-title text-foreground text-hy-body";

/**
 * Every paragraph that wraps in a card: narrow in `em`, so it breaks the same
 * way at any screen size, and greedy (`text-wrap`), which the plan relies on.
 */
const PARAGRAPH =
  "w-[11em] max-w-full hyphens-manual text-wrap font-hy-title text-foreground text-hy-body";

/** The same paragraph, set where the browser lays it out but nobody sees it. */
const HIDDEN = `${PARAGRAPH} invisible absolute top-0 left-0`;

/** Settle rag with no overhang: the browser has no such cheat. */
const NO_OVERHANG = { overhang: 0 } as const;

const LETTER = /\p{L}/u;
const WORD_SEPARATOR = /[  ]/u;

/**
 * Runs `read` now, and again whenever one of the elements changes size and
 * whenever fonts finish loading, since both move the text. Returns the cleanup.
 */
function watch(elements: readonly HTMLElement[], read: () => void): () => void {
  const observer = new ResizeObserver(read);
  for (const element of elements) {
    observer.observe(element);
  }
  const fonts = document.fonts;
  fonts?.addEventListener("loadingdone", read);
  read();
  return () => {
    observer.disconnect();
    fonts?.removeEventListener("loadingdone", read);
  };
}

type Tick = { index: number; x: number };

/**
 * Where each break sits along the unbroken line, in px from the box's left
 * edge: at every space, and at every soft hyphen. A soft hyphen draws nothing,
 * so the next character's start is its place.
 */
function readBreaks(box: HTMLElement, line: HTMLElement): Tick[] {
  const node = line.firstChild;
  if (!(node instanceof Text)) {
    return [];
  }
  const origin = box.getBoundingClientRect().left;
  const range = document.createRange();
  const ticks: Tick[] = [];
  for (let index = 0; index < node.data.length; index += 1) {
    const character = node.data[index];
    if (character !== " " && character !== SOFT_HYPHEN) {
      continue;
    }
    const at = character === SOFT_HYPHEN ? index + 1 : index;
    if (at >= node.data.length) {
      continue;
    }
    range.setStart(node, at);
    range.setEnd(node, at + 1);
    const rect = range.getClientRects()[0];
    if (rect) {
      ticks.push({ index, x: rect.left - origin });
    }
  }
  return ticks;
}

function sameTicks(a: readonly Tick[], b: readonly Tick[]): boolean {
  return (
    a.length === b.length &&
    a.every((tick, at) => tick.index === b[at]?.index && tick.x === b[at]?.x)
  );
}

type Line = { text: string; width: number };

/**
 * The lines the browser set in `element`: each character's rectangle says
 * which line it is on (by its top) and how far along it ends. A character
 * with no rectangle, like a soft hyphen that is not drawn or the space the
 * browser drops at a break, stays with the line before it. A plain space does
 * not count towards the width; the width is from the first drawn character to
 * the last, and a line that ends in a soft hyphen includes the hyphen drawn.
 */
function readLines(element: HTMLElement): Line[] {
  const found: { text: string; top: number; left: number; right: number }[] = [];
  const range = document.createRange();
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const data = node.textContent ?? "";
    for (let index = 0; index < data.length; index += 1) {
      const character = data[index] ?? "";
      range.setStart(node, index);
      range.setEnd(node, index + 1);
      const rect = [...range.getClientRects()].find(entry => entry.width > 0);
      let line = found.at(-1);
      if (rect && character !== " ") {
        const top = Math.round(rect.top);
        if (!line || Math.abs(top - line.top) > rect.height / 2) {
          line = { text: "", top, left: Number.POSITIVE_INFINITY, right: 0 };
          found.push(line);
        }
        line.left = Math.min(line.left, rect.left);
        line.right = Math.max(line.right, rect.right);
      }
      if (line) {
        line.text += character;
      }
    }
  }
  return found.map(line => ({
    text: line.text,
    width: Number.isFinite(line.left) ? line.right - line.left : 0,
  }));
}

/**
 * The letters of the word at one end of `text`, soft hyphens inside it
 * skipped: from the end with `step` -1, from the start with 1. This is what
 * a break there leaves on that side.
 */
function letterCount(text: string, step: 1 | -1): number {
  let letters = 0;
  for (
    let at = step === 1 ? 0 : text.length - 1;
    at >= 0 && at < text.length;
    at += step
  ) {
    const character = text[at] ?? "";
    if (LETTER.test(character)) {
      letters += 1;
    } else if (character !== SOFT_HYPHEN) {
      break;
    }
  }
  return letters;
}

/** The lines as `ragCost` scores them: width, a short word at the end, or a hyphen. */
function measuredLines(lines: readonly Line[]): MeasuredLine[] {
  return lines.map((line, index) => {
    const text = line.text.trimEnd();
    if (text.endsWith(SOFT_HYPHEN)) {
      return {
        width: line.width,
        hyphen: {
          before: letterCount(text.slice(0, -1), -1),
          after: letterCount(lines[index + 1]?.text ?? "", 1),
        },
      };
    }
    // A line that holds the tail of a broken word and no space has no whole
    // last word to judge.
    const continued = lines[index - 1]?.text.trimEnd().endsWith(SOFT_HYPHEN) ?? false;
    // A no-break space ends a word too, as in `shortWordSpaces`: the settled
    // text glues "frelsið og" with one.
    const last = text.split(WORD_SEPARATOR).at(-1) ?? "";
    return {
      width: line.width,
      hangingShortWord:
        !(continued && last === text) && isShortWord(last.replaceAll(SOFT_HYPHEN, "")),
    };
  });
}

type Edge = { bars: number[]; cost: number };

/** The edge of a paragraph: each line's share of the measure, and what the edge costs. */
function readEdge(element: HTMLElement): Edge {
  const style = getComputedStyle(element);
  const measure =
    element.clientWidth -
    (Number.parseFloat(style.paddingLeft) || 0) -
    (Number.parseFloat(style.paddingRight) || 0);
  const lines = readLines(element);
  return {
    bars: lines.map(line => (measure > 0 ? Math.min(1, line.width / measure) : 0)),
    cost: ragCost(measuredLines(lines), measure) + lastLineCost(lines),
  };
}

/**
 * What the last line adds, as `bestBreaks` counts it: one word alone
 * (`runtWeight`), or the tail of a hyphenated word (`lastHyphenWeight`).
 * `ragCost` leaves both out, and without them the card could keep the layout
 * the search did not choose.
 */
function lastLineCost(lines: readonly Line[]): number {
  if (lines.length < 2) {
    return 0;
  }
  let cost = 0;
  if (!WORD_SEPARATOR.test(lines.at(-1)?.text.trim() ?? "")) {
    cost += DEFAULT_RAG_OPTIONS.runtWeight;
  }
  if (lines.at(-2)?.text.trimEnd().endsWith(SOFT_HYPHEN)) {
    cost += DEFAULT_RAG_OPTIONS.lastHyphenWeight;
  }
  return cost;
}

function sameEdge(a: Edge, b: Edge): boolean {
  return a.cost === b.cost && a.bars.join() === b.bars.join();
}

/** Card 2: the text on one line, with a tick where each break is. */
function MeasureCard({ text }: { text: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLParagraphElement>(null);
  const [ticks, setTicks] = useState<Tick[]>([]);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const line = lineRef.current;
    if (!(box && line)) {
      return;
    }
    return watch([box], () => {
      const next = readBreaks(box, line);
      setTicks(previous => (sameTicks(previous, next) ? previous : next));
    });
  }, []);

  return (
    <div className="relative w-full min-w-0 overflow-hidden pb-2" ref={boxRef}>
      <p className={cn(TEXT_CLASS, "w-max whitespace-nowrap")} lang="is" ref={lineRef}>
        {text}
      </p>
      {ticks.map(tick => (
        <span
          aria-hidden="true"
          className="absolute bottom-0 h-2 w-px bg-hy-signal"
          key={tick.index}
          // Where the break is in the text, a live measure, not a design token.
          style={{ left: tick.x }}
        />
      ))}
      {/* The line runs on past the card: it fades out rather than being cut. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-r from-transparent to-background"
      />
    </div>
  );
}

/** One column of card 3: a name, the edge as bars, its cost, and whether it is kept. */
function EdgeColumn({
  label,
  edge,
  copy,
  kept,
}: {
  label: string;
  edge: Edge | null;
  copy: Copy;
  kept: boolean;
}) {
  return (
    // Four rows of the card's grid, shared with the other column, so the bars
    // start on one line even when a label wraps.
    <div className="row-span-4 grid min-w-0 grid-rows-subgrid">
      <span className={cn(LABEL_CLASS, "text-muted")}>{label}</span>
      {/* A fixed height, so nothing jumps when the lines are read. The bars
          are decoration; the cost below is the real text. */}
      <div aria-hidden="true" className="flex min-h-16 flex-col gap-0.5">
        {edge?.bars.map((bar, index) => (
          <span
            className="h-1.5 bg-foreground"
            // The bars are the lines, in order; a line's place is its identity.
            // biome-ignore lint/suspicious/noArrayIndexKey: see above
            key={index}
            // The line's share of the measure, a live value, not a design token.
            style={{ width: `${bar * 100}%` }}
          />
        ))}
      </div>
      <span className="font-book text-foreground text-hy-note tabular-nums">
        {edge ? `${edge.cost.toFixed(2)} ${copy.cost}` : " "}
      </span>
      <span className={cn(LABEL_CLASS, !kept && "invisible")}>{copy.kept}</span>
    </div>
  );
}

/**
 * Card 3: the paragraph's edge as the browser sets it line by line, and as
 * Settle rag sets it. Two hidden copies are laid out in the card (greedy, and
 * the settled text), their lines are read from the page and scored with
 * `ragCost`, so the numbers are the package's own.
 */
function WeighCard({ hyphenated, copy }: { hyphenated: string; copy: Copy }) {
  const greedyRef = useRef<HTMLParagraphElement>(null);
  const settledRef = useRef<HTMLParagraphElement>(null);
  const settled = useSettledRag(settledRef, hyphenated, NO_OVERHANG);
  const [edges, setEdges] = useState<{ greedy: Edge; whole: Edge } | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: the settled text reaches this effect through the DOM, which static analysis cannot follow; the lines are read again when it changes
  useLayoutEffect(() => {
    const greedy = greedyRef.current;
    const whole = settledRef.current;
    if (!(greedy && whole)) {
      return;
    }
    return watch([greedy, whole], () => {
      const next = { greedy: readEdge(greedy), whole: readEdge(whole) };
      setEdges(previous =>
        previous &&
        sameEdge(previous.greedy, next.greedy) &&
        sameEdge(previous.whole, next.whole)
          ? previous
          : next
      );
    });
  }, [settled.text]);

  const wholeKept = edges !== null && edges.whole.cost <= edges.greedy.cost;

  return (
    <div className="relative grid w-full min-w-0 grid-cols-2 grid-rows-[repeat(4,auto)] gap-x-sm gap-y-2xs">
      <p aria-hidden="true" className={HIDDEN} lang="is" ref={greedyRef}>
        {hyphenated}
      </p>
      <p aria-hidden="true" className={HIDDEN} lang="is" ref={settledRef}>
        {settled.text}
      </p>
      <EdgeColumn
        copy={copy}
        edge={edges?.greedy ?? null}
        kept={edges !== null && !wholeKept}
        label={copy.greedy}
      />
      <EdgeColumn
        copy={copy}
        edge={edges?.whole ?? null}
        kept={wholeKept}
        label={copy.whole}
      />
    </div>
  );
}

/** Card 4: the settled text, with each forbidden break drawn as glue. */
function GlueCard({ hyphenated }: { hyphenated: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const settled = useSettledRag(ref, hyphenated, NO_OVERHANG);

  return (
    <p className={PARAGRAPH} lang="is" ref={ref}>
      <SettledContent
        hangs={settled.hangs}
        marks
        text={settled.text}
        tightened={settled.tightened}
      />
    </p>
  );
}

/**
 * How Settle rag works, as one paragraph through five stages: where it may
 * break, where each break sits, which breaks win, what the browser is told,
 * and the lines it sets. Every number is read from the page and scored by the
 * package. The copy and the hyphenated text come from the server, which keeps
 * the page's other copy out of this client chunk.
 */
export function RagDiagram({ hyphenated, copy }: { hyphenated: string; copy: Copy }) {
  const { stages } = copy;

  return (
    <figure className="col-span-full flex flex-col gap-sm">
      <figcaption className={LABEL_CLASS}>{copy.label}</figcaption>
      {/* The bracket: one stage on the server, four in the browser. */}
      <div aria-hidden="true" className="hidden gap-md lg:grid lg:grid-cols-5">
        <span className={cn(LABEL_CLASS, "border-border border-t pt-2xs text-muted")}>
          {copy.server}
        </span>
        <span
          className={cn(
            LABEL_CLASS,
            "col-span-4 border-border border-t pt-2xs text-muted"
          )}
        >
          {copy.browser}
        </span>
      </div>
      <ol className="grid gap-xl lg:grid-cols-5 lg:gap-md">
        <Stage
          note={stages.breaks.note}
          number={1}
          title={stages.breaks.title}
          where={copy.server}
        >
          {/* Exact marks: the dots take no room, so these are the browser's own
              greedy lines, the "Line by line" edge in card 3. */}
          <p className={PARAGRAPH} lang="is">
            <MarkedText exact text={hyphenated} />
          </p>
        </Stage>
        <Stage
          note={stages.measure.note}
          number={2}
          title={stages.measure.title}
          where={copy.browser}
        >
          <MeasureCard text={hyphenated} />
        </Stage>
        <Stage
          note={stages.weigh.note}
          number={3}
          title={stages.weigh.title}
          where={copy.browser}
        >
          <WeighCard copy={copy} hyphenated={hyphenated} />
        </Stage>
        <Stage
          note={stages.glue.note}
          number={4}
          title={stages.glue.title}
          where={copy.browser}
        >
          <GlueCard hyphenated={hyphenated} />
        </Stage>
        <Stage
          last
          note={stages.line.note}
          number={5}
          title={stages.line.title}
          where={copy.browser}
        >
          <SettledText
            as="p"
            // The dashed edge is drawn just outside the box, so the measure
            // stays the same 11em as in cards 3 and 4.
            className={cn(
              PARAGRAPH,
              "relative after:absolute after:inset-y-0 after:left-full after:border-border after:border-l after:border-dashed"
            )}
            lang="is"
            options={NO_OVERHANG}
            text={hyphenated}
          />
        </Stage>
      </ol>
    </figure>
  );
}
