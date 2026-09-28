import type { CSSProperties, ReactNode } from "react";

type SectionLabelProps = {
  id?: string;
  /**
   * Set by `SectionWrapper` only for `reveal="items"` sections, so the pill
   * joins the row stagger at `--index: 0` and leads the cascade. Sections
   * that opt out of reveal entirely never receive this.
   */
  revealItem?: boolean;
  children: ReactNode;
};

/**
 * The pill-shaped section label. Doubles as the section's `<h2>` — the
 * section it labels points `aria-labelledby` back at `id`.
 *
 * Desktop: columns 2–3, flush with the column edge. Mobile: pulled 8 left of
 * the content column so the pill's *text* lines up with the copy below it
 * rather than its border — the frame sets the pill at 56 and its text at
 * 64.75. It also reserves a 66-tall band on mobile (21.75 either side), which
 * with the wrapper's 24 row gap puts the first entry 90 below the section top.
 *
 * Its own box is 22.5: a 20px line plus the 1.25 padding, untrimmed — the
 * frame does not cap-trim this one.
 *
 * The class list is static, so it skips `cn()` — there is nothing to merge.
 */
export function SectionLabel({ id, revealItem, children }: SectionLabelProps) {
  return (
    <h2
      // `self-start` is load-bearing: as a grid item this would otherwise
      // stretch to the full height of the section row and render as a tall
      // outlined box rather than a pill. `w-fit` only constrains the width.
      // Figma strokes this pill inside the frame, so its 110.5 × 22.5 already
      // includes the 1.25 border. A CSS border is always outside the content
      // box, so the padding gives that width back — otherwise the pill renders
      // 2.5px larger in both axes than the frame.
      className="my-[var(--pill-inset)] -ml-2xs w-fit self-start rounded-pill border-[length:var(--pill-border-width)] border-border-strong px-[calc(var(--pill-padding-x)-var(--pill-border-width))] py-[calc(var(--pill-padding-y)-var(--pill-border-width))] font-regular text-foreground text-label lowercase lg:col-span-2 lg:col-start-2 lg:my-0 lg:ml-0"
      data-reveal-item={revealItem ? "" : undefined}
      id={id}
      style={revealItem ? ({ "--index": 0 } as CSSProperties) : undefined}
    >
      {children}
    </h2>
  );
}
