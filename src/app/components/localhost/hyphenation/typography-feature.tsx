"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Switch } from "@/app/components/localhost/hyphenation/choice-group";
import { CODE_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { Tip } from "@/app/components/localhost/hyphenation/tip";
import { cn } from "@/lib/utils";

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

/**
 * One typesetting rule as an Off/On feature, like a font's OpenType feature
 * list. Both strings come from the server, so the core never reaches the
 * client bundle.
 */
export function TypographyFeature({ label, tag, tip, off, on }: TypographyFeatureProps) {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="flex flex-col gap-xs border-border border-t pt-sm xl:grid xl:grid-cols-4 xl:gap-x-md">
      <div className="flex flex-col">
        <span className="font-semibold text-body text-foreground">{label}</span>
        <span>
          <Tip tip={tip}>
            <code className={cn(CODE_CLASS, "text-label text-muted")}>{tag}</code>
          </Tip>
        </span>
      </div>
      <Switch checked={enabled} hideLabel label={label} onChange={setEnabled} />
      <p className="font-book text-foreground text-prose xl:col-span-2" lang="is">
        {enabled ? on : off}
      </p>
    </div>
  );
}
