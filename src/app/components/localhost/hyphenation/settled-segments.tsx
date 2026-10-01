"use client";

import { useRef } from "react";
import { usePlayground } from "@/app/components/localhost/hyphenation/playground";
import { ragOptions, wrapClass } from "@/app/components/localhost/hyphenation/settings";
import { SettledContent } from "@/app/components/localhost/hyphenation/settled-content";
import { cn } from "@/lib/utils";
import { applyRag, useRagPlan } from "@/packages/skiptingar/src/client";

export type Segment = {
  /** Already processed on the server: hyphenated and typeset, or left alone. */
  text: string;
  /** A language other than the paragraph's, such as `en`. */
  lang?: string;
};

/**
 * A paragraph of fixed, server-processed segments, with every mark shown and
 * its rag settled when the page's Settle rag is on. The rag is judged on the
 * whole paragraph, then each segment takes the forbidden breaks that fall
 * inside it, so a segment in another language keeps its own `lang`.
 */
export function SettledSegments({
  segments,
  className,
}: {
  segments: readonly Segment[];
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { settings } = usePlayground();
  const text = segments.map(segment => segment.text).join("");
  const plan = useRagPlan(ref, text, { enabled: settings.rag, ...ragOptions(settings) });

  // Each segment takes the forbidden breaks and the hangs that fall inside it.
  let start = 0;
  const pieces = segments.map((segment, index) => {
    const from = start;
    start += segment.text.length;
    const inside = (at: number) => at >= from && at < start;
    const settled = applyRag(
      segment.text,
      plan.forbidden.filter(inside).map(at => at - from),
      plan.hangs
        .filter(hang => inside(hang.index))
        .map(hang => ({ ...hang, index: hang.index - from }))
    );
    return { id: index, lang: segment.lang, ...settled };
  });

  return (
    <p
      className={cn("hyphens-manual", wrapClass(settings, false), className)}
      lang="is"
      ref={ref}
    >
      {pieces.map(piece =>
        piece.lang ? (
          <span key={piece.id} lang={piece.lang}>
            <SettledContent hangs={piece.hangs} marks={false} text={piece.text} />
          </span>
        ) : (
          <SettledContent hangs={piece.hangs} key={piece.id} marks text={piece.text} />
        )
      )}
    </p>
  );
}
