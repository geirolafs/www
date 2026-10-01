import type { CSSProperties } from "react";
import { MarkedText } from "@/app/components/localhost/hyphenation/marked-text";
import { cn } from "@/lib/utils";
import {
  type Hang,
  splitSettled,
  type Tightened,
} from "@/packages/skiptingar/src/client";

/**
 * Settled text, drawn: the plain runs, with their marks when `marks` is on,
 * and each overhanging line end in a span with a negative `letter-spacing`
 * of the overhang, so the line fits and its last character's end sits past
 * the edge. Nothing follows it on its line, so nothing overlaps it. With marks
 * on, it gets the amber fill, so the cheat is as visible as the glue. Each
 * tightened line is a span with a negative `word-spacing` (and a negative
 * `letter-spacing` when the line needed it); with marks on it is underlined in
 * amber, quieter than a fill, since it covers a whole line.
 */
export function SettledContent({
  text,
  hangs,
  tightened,
  marks,
}: {
  text: string;
  hangs: readonly Hang[];
  tightened: readonly Tightened[];
  marks: boolean;
}) {
  // Exact marks: the plan was made for the text without them.
  const run = (part: string) => (marks ? <MarkedText exact text={part} /> : part);
  if (hangs.length === 0 && tightened.length === 0) {
    return run(text);
  }
  const pieces = splitSettled(text, hangs, tightened);

  return pieces.map(piece => {
    if (piece.hang !== undefined) {
      return (
        <span
          className={cn(marks && "bg-hy-accent")}
          key={`hang-${piece.start}`}
          // The overhang in px, a live value, not a design token. Negative
          // letter-spacing shrinks the character's advance, which the line
          // breaker counts, and the glyph still draws in full past the edge.
          style={{ letterSpacing: -piece.hang } as CSSProperties}
        >
          {piece.text}
        </span>
      );
    }
    if (piece.wordSpacing !== undefined) {
      return (
        <span
          className={cn(
            marks && "underline decoration-2 decoration-hy-accent underline-offset-4"
          )}
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
          {run(piece.text)}
        </span>
      );
    }
    return <span key={`run-${piece.start}`}>{run(piece.text)}</span>;
  });
}
