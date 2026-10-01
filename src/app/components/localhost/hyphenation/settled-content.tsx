import type { CSSProperties } from "react";
import {
  type Hang,
  splitSettled,
  type Tightened,
} from "@/packages/skiptingar/src/client";

/**
 * Settled text, drawn: the plain runs, and each overhanging line end in a
 * span with a negative `letter-spacing` of the overhang, so the line fits and
 * its last character's end sits past the edge. Each tightened line is a span
 * with a negative `word-spacing` (and a negative `letter-spacing` when the
 * line needed it).
 *
 * The text and the spans are the same whether Show breaks is on or not, since
 * the plan was made for them. A hang span carries `data-hang` and a tightened
 * span `data-tightened`, which change nothing in the layout; the mark overlay
 * (`useMarkOverlay`) finds them there and draws the amber on top.
 */
export function SettledContent({
  text,
  hangs,
  tightened,
}: {
  text: string;
  hangs: readonly Hang[];
  tightened: readonly Tightened[];
}) {
  if (hangs.length === 0 && tightened.length === 0) {
    return text;
  }
  const pieces = splitSettled(text, hangs, tightened);

  return pieces.map(piece => {
    if (piece.hang !== undefined) {
      return (
        <span
          data-hang=""
          key={`hang-${piece.start}`}
          // The overhang in px, a live value, not a design token. Negative
          // letter-spacing shrinks the character's advance, which the line
          // breaker counts, and the glyph still draws in full past the edge.
          // The plan's own value includes the element's tracking.
          style={{ letterSpacing: piece.letterSpacing ?? -piece.hang } as CSSProperties}
        >
          {piece.text}
        </span>
      );
    }
    if (piece.wordSpacing !== undefined) {
      return (
        <span
          data-tightened=""
          key={`tight-${piece.start}`}
          // The spacing in px, live values, not design tokens. A negative
          // word space shortens the line the breaker counts. Letter spacing
          // is left alone unless the line needed it, so a line's own tracking
          // is not reset.
          style={
            {
              wordSpacing: piece.wordSpacing,
              letterSpacing: piece.letterSpacing || undefined,
            } as CSSProperties
          }
        >
          {piece.text}
        </span>
      );
    }
    return <span key={`run-${piece.start}`}>{piece.text}</span>;
  });
}
