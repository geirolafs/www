import type { ReactNode } from "react";
import { InlineCode } from "@/app/components/localhost/hyphenation/code";
import {
  ITEM_TITLE_CLASS,
  LABEL_CLASS,
} from "@/app/components/localhost/hyphenation/styles";
import { Tip } from "@/app/components/localhost/hyphenation/tip";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";

const { typography } = localhostHyphenationContent;

type TypographyFeatureProps = {
  label: string;
  /** The `typeset()` option, or a name for the rule, shown as code. */
  tag: string;
  /** What the rule does, in a line. */
  tip: string;
  /** The text as written. */
  off: ReactNode;
  /** The typeset text, computed on the server. */
  on: ReactNode;
};

/** The text on one side of a row, with its caption for a phone and a screen reader. */
function Side({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2xs lg:col-span-4">
      {/* From `lg` up the captions sit once above the columns (`Typography`). */}
      <span className={cn(LABEL_CLASS, "lg:sr-only")}>{caption}</span>
      <p className="font-book text-foreground text-prose" lang="is">
        {children}
      </p>
    </div>
  );
}

/**
 * One typesetting rule as a row, like a font's OpenType feature list: the
 * name in columns 1–4, the text as written in 5–8 and typeset in 9–12, so
 * the two compare side by side. Both strings come from the server.
 */
export function TypographyFeature({ label, tag, tip, off, on }: TypographyFeatureProps) {
  return (
    <div className="col-span-full flex flex-col gap-y-xs border-border border-t pt-sm lg:grid lg:grid-cols-subgrid">
      <div className="flex flex-col lg:col-span-4">
        <span className={ITEM_TITLE_CLASS}>{label}</span>
        <span>
          <Tip tip={tip}>
            <span className="text-hy-note">
              <InlineCode>{tag}</InlineCode>
            </span>
          </Tip>
        </span>
      </div>
      <Side caption={typography.off}>{off}</Side>
      <Side caption={typography.on}>{on}</Side>
    </div>
  );
}
