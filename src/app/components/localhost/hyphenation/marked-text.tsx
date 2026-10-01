import { localhostHyphenationClientContent } from "@/lib/content/localhost-hyphenation-client";
import {
  NO_BREAK_SPACE,
  NON_BREAKING_HYPHEN,
  SOFT_HYPHEN,
} from "@/packages/skiptingar/src/client";

const { marks } = localhostHyphenationClientContent;

const INVISIBLE = /([\u00AD\u00A0\u2011])/;

type Piece = { id: number; text: string };

function pieces(text: string): Piece[] {
  let offset = 0;
  return text
    .split(INVISIBLE)
    .filter(part => part !== "")
    .map(part => {
      const piece = { id: offset, text: part };
      offset += part.length;
      return piece;
    });
}

/**
 * Text with its invisible characters made visible: each soft hyphen as a red
 * dot (`hy-signal`: a break must be seen), and each no-break space and
 * non-breaking hyphen as itself on an amber fill (`hy-accent`: glue, quieter
 * than a break). The fill is the mark; no symbol is needed. The marks are hidden from
 * assistive tech; the real character stays in the text for them. A soft
 * hyphen keeps a `<wbr />` after its mark, so the line can still break there;
 * the mark stands in for the hyphen the browser would draw.
 *
 * It has no state or effects, so a server page and a client component can both
 * render it.
 */
export function MarkedText({ text }: { text: string }) {
  return pieces(text).map(piece => {
    if (piece.text === SOFT_HYPHEN) {
      return (
        <span key={piece.id}>
          <span aria-hidden="true" className="font-bold text-hy-signal">
            {marks.softHyphen}
          </span>
          <wbr />
        </span>
      );
    }
    if (piece.text === NON_BREAKING_HYPHEN || piece.text === NO_BREAK_SPACE) {
      // The real character, on an amber fill: it keeps its width and its
      // meaning for screen readers and copying, and the fill shows it.
      return (
        <span className="bg-hy-accent" key={piece.id}>
          {piece.text}
        </span>
      );
    }
    return piece.text;
  });
}
