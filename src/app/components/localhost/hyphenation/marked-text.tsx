import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";

const { marks } = localhostHyphenationContent;

const SOFT_HYPHEN = "­";
const NO_BREAK_SPACE = " ";
const NON_BREAKING_HYPHEN = "\u2011";
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
 * Text with its invisible characters made visible: each soft hyphen as a
 * muted dot, each no-break space as a muted open box and each non-breaking
 * hyphen as a dotted hyphen. The marks are hidden from assistive tech; the
 * real character stays in the text for them. A soft hyphen keeps a `<wbr />` after its mark, so the
 * line can still break there; the mark stands in for the hyphen the browser
 * would draw.
 *
 * It has no state or effects, so a server page and a client component can both
 * render it.
 */
export function MarkedText({ text }: { text: string }) {
  return pieces(text).map(piece => {
    if (piece.text === SOFT_HYPHEN) {
      return (
        <span key={piece.id}>
          <span aria-hidden="true" className="text-muted">
            {marks.softHyphen}
          </span>
          <wbr />
        </span>
      );
    }
    if (piece.text === NON_BREAKING_HYPHEN) {
      // The real U+2011 stays for assistive tech and for copying. The mark is
      // a hyphen with a dotted underline, so it reads as a hyphen that cannot
      // break, apart from an ordinary one.
      return (
        <span key={piece.id}>
          <span className="sr-only">{NON_BREAKING_HYPHEN}</span>
          <span
            aria-hidden="true"
            className="text-muted underline decoration-dotted underline-offset-4"
          >
            {marks.nonBreakingHyphen}
          </span>
        </span>
      );
    }
    if (piece.text === NO_BREAK_SPACE) {
      // The real no-break space stays for screen readers, so "1.000 kr." is
      // not read as "1.000kr." It is out of the layout, so only the mark shows.
      return (
        <span key={piece.id}>
          <span className="sr-only">{NO_BREAK_SPACE}</span>
          <span aria-hidden="true" className="text-muted">
            {marks.noBreakSpace}
          </span>
        </span>
      );
    }
    return piece.text;
  });
}
