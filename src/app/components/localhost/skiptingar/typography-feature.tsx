import type { ReactNode } from "react";
import { InlineCode } from "@/app/components/localhost/fluid-typography/code";
import {
  ITEM_TITLE_CLASS,
  LABEL_CLASS,
  NOTE_CLASS,
} from "@/app/components/localhost/fluid-typography/styles";
import { cn } from "@/lib/utils";

type TypographyFeatureProps = {
  label: string;
  /** The `typeset()` option that turns the rule on or off, shown as code. */
  tag: string;
  /** What the rule does, in a line. */
  tip: string;
  /** The text as written. */
  off: ReactNode;
  /** The typeset text, computed on the server. */
  on: ReactNode;
  /** The captions over the two sides, for a phone and a screen reader. */
  captions: { off: string; on: string };
  /** A column width in em where the two sides wrap differently, if there is one. */
  measure?: number;
};

/** The text on one side of a row, with its caption for a phone and a screen reader. */
function Side({
  caption,
  measure,
  children,
}: {
  caption: string;
  measure?: number;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 lg:col-span-4">
      {/* From `lg` up the captions sit once above the columns (`Typography`). */}
      <span className={cn(LABEL_CLASS, "lg:sr-only")}>{caption}</span>
      <p
        className={cn(
          "max-w-full font-book text-foreground text-prose",
          // The column's edge, so it is clear why a line breaks where it does.
          measure !== undefined &&
            "box-content border-border border-r border-dashed pr-xs"
        )}
        lang="is"
        // A width in em from the content, not a design token.
        style={measure === undefined ? undefined : { width: `${measure}em` }}
      >
        {children}
      </p>
    </div>
  );
}

/**
 * One typesetting rule as a row, like a font's OpenType feature list: the
 * name, its option and what it does in columns 1–4, the text as written in
 * 5–8 and typeset in 9–12, so the two compare side by side. Both strings come
 * from the server.
 */
export function TypographyFeature({
  label,
  tag,
  tip,
  off,
  on,
  captions,
  measure,
}: TypographyFeatureProps) {
  return (
    <div className="col-span-full flex flex-col gap-y-sm border-border border-t pt-md pb-xl lg:grid lg:grid-cols-subgrid">
      <div className="flex flex-col items-start gap-xs lg:col-span-4 lg:pr-xl">
        <div className="flex flex-wrap items-baseline gap-x-xs gap-y-1">
          <span className={ITEM_TITLE_CLASS}>{label}</span>
          <span className="text-hy-caption">
            <InlineCode>{tag}</InlineCode>
          </span>
        </div>
        <p className={NOTE_CLASS}>{tip}</p>
      </div>
      <Side caption={captions.off} measure={measure}>
        {off}
      </Side>
      <Side caption={captions.on} measure={measure}>
        {on}
      </Side>
    </div>
  );
}
