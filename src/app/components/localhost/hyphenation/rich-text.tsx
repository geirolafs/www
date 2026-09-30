import { CODE_CLASS, FOCUS_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { cn } from "@/lib/utils";

export type Part = {
  readonly text: string;
  readonly href?: string;
  readonly code?: true;
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
 * A line of text built from parts: plain text, links and code. The copy stays
 * in the content file, and the markup stays here. Code is marked
 * `translate="no"`, so a translator leaves it alone.
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
      return (
        <code
          className={cn(CODE_CLASS, "text-foreground")}
          key={part.offset}
          translate="no"
        >
          {part.text}
        </code>
      );
    }
    return <span key={part.offset}>{part.text}</span>;
  });
}
