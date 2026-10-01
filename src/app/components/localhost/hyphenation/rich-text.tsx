import { InlineCode } from "@/app/components/localhost/hyphenation/code";
import { FOCUS_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { cn } from "@/lib/utils";

export type Part = {
  readonly text: string;
  readonly href?: string;
  /** Code: a highlighted chip in the monospace. */
  readonly code?: true;
  /** Icelandic sample text, like `þjóð-fé-lags-um-ræða`: set in the editor's serif, not as code. */
  readonly sample?: true;
};

const LINK_CLASS = cn(
  "underline decoration-border underline-offset-4 hover:decoration-foreground",
  FOCUS_CLASS
);

/** Each part's key is where it starts in the line, so repeated text stays unique. */
function withOffsets(parts: readonly Part[]) {
  let offset = 0;
  return parts.map(part => {
    const keyed = { ...part, offset };
    offset += part.text.length;
    return keyed;
  });
}

/**
 * A line of text built from parts: plain text, links, code and Icelandic
 * samples. The copy stays in the content file, and the markup stays here.
 */
export function RichText({ parts }: { parts: readonly Part[] }) {
  return withOffsets(parts).map(part => {
    if (part.href) {
      return (
        <a className={LINK_CLASS} href={part.href} key={part.offset}>
          {part.text}
        </a>
      );
    }
    if (part.code) {
      return <InlineCode key={part.offset}>{part.text}</InlineCode>;
    }
    if (part.sample) {
      return (
        <span className="font-hy-title text-foreground" key={part.offset} lang="is">
          {part.text}
        </span>
      );
    }
    return <span key={part.offset}>{part.text}</span>;
  });
}
