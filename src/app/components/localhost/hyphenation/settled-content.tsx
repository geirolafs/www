import type { CSSProperties } from "react";
import { MarkedText } from "@/app/components/localhost/hyphenation/marked-text";
import { cn } from "@/lib/utils";
import { type Hang, hangCharacter } from "@/packages/skiptingar/src/rag";

/**
 * Settled text, drawn: the plain runs, with their marks when `marks` is on,
 * and each overhanging line end in a span with a negative `letter-spacing`
 * of the overhang, so the line fits and its last character's end sits past
 * the edge. Nothing follows it on its line, so nothing overlaps it. With marks
 * on, it gets the amber fill, so the cheat is as visible as the glue.
 */
export function SettledContent({
  text,
  hangs,
  marks,
}: {
  text: string;
  hangs: readonly Hang[];
  marks: boolean;
}) {
  // Exact marks: the plan was made for the text without them.
  const run = (part: string) => (marks ? <MarkedText exact text={part} /> : part);
  if (hangs.length === 0) {
    return run(text);
  }
  const pieces: { id: number; text: string; hang?: number }[] = [];
  let from = 0;
  for (const hang of hangs) {
    const character = hangCharacter(text, hang.index);
    pieces.push({ id: from, text: text.slice(from, hang.index) });
    pieces.push({ id: hang.index, text: character, hang: hang.width });
    from = hang.index + character.length;
  }
  pieces.push({ id: from, text: text.slice(from) });

  return pieces.map(piece =>
    piece.hang === undefined ? (
      <span key={`run-${piece.id}`}>{run(piece.text)}</span>
    ) : (
      <span
        className={cn(marks && "bg-hy-accent")}
        key={`hang-${piece.id}`}
        // The overhang in px, a live value, not a design token. Negative
        // letter-spacing shrinks the character's advance, which the line
        // breaker counts, and the glyph still draws in full past the edge.
        style={{ letterSpacing: -piece.hang } as CSSProperties}
      >
        {piece.text}
      </span>
    )
  );
}
