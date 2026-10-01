"use client";

import type { ReactNode, RefObject } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { localhostHyphenationClientContent } from "@/lib/content/localhost-hyphenation-client";
import {
  NO_BREAK_SPACE,
  NON_BREAKING_HYPHEN,
  SOFT_HYPHEN,
} from "@/packages/skiptingar/src/client";

const { marks: markContent } = localhostHyphenationClientContent;

/** How far below a tightened line's text its bar sits, in px. */
const BAR_OFFSET = 4;

/**
 * One mark, in px from the overlay's own top left corner: a dot at a soft
 * hyphen (`x` is its centre, `y` and `height` are the character's), an amber
 * fill over a glued character or an overhanging one, and an amber bar under a
 * tightened line.
 */
type Mark =
  | { kind: "dot"; x: number; y: number; height: number }
  | { kind: "fill"; x: number; y: number; width: number; height: number }
  | { kind: "bar"; x: number; y: number; width: number };

const round = (value: number) => Math.round(value * 100) / 100;

/** Icelandic, or with no `lang` at all: the text the page processed. */
function isIcelandic(node: Node): boolean {
  const element = node instanceof Element ? node : node.parentElement;
  const lang = element?.closest("[lang]")?.getAttribute("lang");
  return lang == null || lang.toLowerCase().startsWith("is");
}

/** The rectangle of one character, if the browser drew it. */
function characterRect(range: Range, node: Text, index: number): DOMRect | undefined {
  range.setStart(node, index);
  range.setEnd(node, index + 1);
  return [...range.getClientRects()].find(rect => rect.width > 0);
}

/**
 * Where the marks go for the text in `target`, read from the page: the same
 * `Range` technique as the rag diagram. Every position is measured against
 * the overlay's own corner (`root`), so it holds whatever the overlay's
 * containing block is, and scrolling cannot shift it.
 */
function readMarks(target: HTMLElement, root: HTMLElement): Mark[] {
  const origin = root.getBoundingClientRect();
  const found: Mark[] = [];
  const range = document.createRange();

  const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    nodes.push(node as Text);
  }

  // The first character drawn after `index` in `nodes[at]`, in this node or a later one.
  const nextRect = (at: number, index: number): DOMRect | undefined => {
    for (let n = at; n < nodes.length; n += 1) {
      const node = nodes[n] as Text;
      for (let i = n === at ? index : 0; i < node.length; i += 1) {
        const rect = characterRect(range, node, i);
        if (rect) {
          return rect;
        }
      }
    }
    return undefined;
  };

  nodes.forEach((node, at) => {
    if (!isIcelandic(node)) {
      return;
    }
    for (let index = 0; index < node.length; index += 1) {
      const character = node.data[index];
      if (character === SOFT_HYPHEN) {
        // A hyphen drawn at a line end has a rectangle of its own: the dot
        // sits at its start. Otherwise the soft hyphen draws nothing, and the
        // next character's start is its place.
        const own = characterRect(range, node, index);
        const rect = own ?? nextRect(at, index + 1);
        if (rect) {
          found.push({
            kind: "dot",
            x: round(rect.left - origin.left),
            y: round(rect.top - origin.top),
            height: round(rect.height),
          });
        }
      } else if (character === NO_BREAK_SPACE || character === NON_BREAKING_HYPHEN) {
        const rect = characterRect(range, node, index);
        if (rect) {
          found.push({
            kind: "fill",
            x: round(rect.left - origin.left),
            y: round(rect.top - origin.top),
            width: round(rect.width),
            height: round(rect.height),
          });
        }
      }
    }
  });

  for (const element of target.querySelectorAll("[data-hang]")) {
    const rect = element.getBoundingClientRect();
    found.push({
      kind: "fill",
      x: round(rect.left - origin.left),
      y: round(rect.top - origin.top),
      width: round(rect.width),
      height: round(rect.height),
    });
  }

  for (const element of target.querySelectorAll("[data-tightened]")) {
    // One rectangle per line the element sits on.
    for (const rect of element.getClientRects()) {
      if (rect.width > 0) {
        found.push({
          kind: "bar",
          x: round(rect.left - origin.left),
          y: round(rect.bottom - origin.top + BAR_OFFSET),
          width: round(rect.width),
        });
      }
    }
  }
  return found;
}

/** The font and line height of `from` on `to`, so a dot's glyph matches the text. */
function copyType(from: CSSStyleDeclaration, to: HTMLElement): void {
  if (from.font) {
    to.style.font = from.font;
  } else {
    to.style.fontFamily = from.fontFamily;
    to.style.fontSize = from.fontSize;
    to.style.fontWeight = from.fontWeight;
    to.style.fontStyle = from.fontStyle;
  }
  to.style.lineHeight = from.lineHeight;
}

/**
 * The marks of Show breaks, drawn over the text in `ref` and not in it: a dot
 * at each soft hyphen, an amber fill on each no-break space, non-breaking
 * hyphen and overhanging line end, and an amber bar under each tightened line.
 *
 * Settled text is planned from measurements of the plain text, so anything
 * put inside the line, even out of the flow, can change where it wraps. The
 * overlay is therefore a sibling: render the returned node right after the
 * text element, never inside it. It is out of the flow and takes no part in
 * layout, and the marks are measured from the text (`readMarks`) and drawn
 * where the characters are. It finds a hang by `data-hang` and a tightened
 * line by `data-tightened` on the spans of `SettledContent`.
 *
 * `enabled` false returns `null`. `key` is what the text is made of: the
 * marks are measured again when it changes, when the element is resized and
 * when fonts finish loading. Until the first measurement the overlay is empty,
 * so the server and the first client render match. Text inside an element
 * with another `lang` is left unmarked.
 */
export function useMarkOverlay(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  key: string
): ReactNode {
  const overlayRef = useRef<HTMLSpanElement>(null);
  const [marks, setMarks] = useState<Mark[]>([]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` is the text and plan, which reach the effect through the DOM; the marks are measured again when it changes
  useLayoutEffect(() => {
    const target = ref.current;
    const root = overlayRef.current;
    if (!(enabled && target && root)) {
      return;
    }
    const measure = () => {
      copyType(getComputedStyle(target), root);
      const next = readMarks(target, root);
      // Nothing changed: no update, so no render loop.
      setMarks(previous =>
        JSON.stringify(previous) === JSON.stringify(next) ? previous : next
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(target);
    const fonts = document.fonts;
    fonts?.addEventListener("loadingdone", measure);
    measure();
    return () => {
      observer.disconnect();
      fonts?.removeEventListener("loadingdone", measure);
    };
  }, [ref, enabled, key]);

  if (!enabled) {
    return null;
  }
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 select-none"
      ref={overlayRef}
    >
      {marks.map(mark => {
        const id = `${mark.kind}-${mark.x}-${mark.y}`;
        if (mark.kind === "dot") {
          return (
            <span
              className="absolute -translate-x-1/2 whitespace-nowrap font-bold text-hy-signal"
              key={id}
              // Where the character is, live values, not design tokens. The
              // line height is the character's own height, so the dot sits in
              // it as the text does.
              style={{
                left: mark.x,
                top: mark.y,
                height: mark.height,
                lineHeight: `${mark.height}px`,
              }}
            >
              {markContent.softHyphen}
            </span>
          );
        }
        if (mark.kind === "fill") {
          return (
            <span
              className="absolute bg-hy-accent mix-blend-multiply"
              key={id}
              style={{
                left: mark.x,
                top: mark.y,
                width: mark.width,
                height: mark.height,
              }}
            />
          );
        }
        return (
          <span
            className="absolute h-0.5 bg-hy-accent"
            key={id}
            style={{ left: mark.x, top: mark.y, width: mark.width }}
          />
        );
      })}
    </span>
  );
}
