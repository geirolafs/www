import type { ReactNode } from "react";
import {
  LABEL_CLASS,
  NOTE_CLASS,
  TITLE_CLASS,
} from "@/app/components/localhost/hyphenation/styles";
import { cn } from "@/lib/utils";

/**
 * How a section lays out its specimen on a wide screen. On a phone every
 * section is one column: the header, then the specimen.
 *
 * - `side`: the header stays in view in columns 1–4, beside one specimen in
 *   columns 5–12. For a tool or a text read in order.
 * - `wide`: the header sits on top in columns 1–4, and the specimen runs
 *   under it across all 12 columns, so things to compare stand side by side.
 *   The specimen is a subgrid of the page's columns; its children place
 *   themselves with `lg:col-span-*`.
 * - `free`: the children are items of the section's own grid and place
 *   themselves, for a specimen that puts its controls in the header column.
 */
export type SectionLayout = "side" | "wide" | "free";

type SectionProps = {
  /** The anchor the top bar links to. */
  id: string;
  /** The section's letter in the page, like `A`. */
  number: string;
  label: string;
  /** One line under the title: what the specimen shows. */
  explanation?: string;
  layout: SectionLayout;
  /**
   * Leave the top rule out but keep its space: the first section sits right
   * under the bar, whose own rule already divides it from the hero.
   */
  hideRule?: boolean;
  children: ReactNode;
};

/**
 * A lettered section of the playground on the site's `page-grid`. The title
 * is the section's `h2`; specimens inside it caption themselves with `h3`.
 */
export function Section({
  id,
  number,
  label,
  explanation,
  layout,
  hideRule,
  children,
}: SectionProps) {
  const titleId = `${id}-title`;

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "page-grid scroll-mt-project pb-hysection",
        // The rule sits closer to its own header than to the section above,
        // so it reads as this section's top. `free` sets its text box and its
        // controls a step apart, so its rows are closer; the rule's margin
        // makes up the rest of the space above the header.
        layout === "free" ? "gap-y-md" : "gap-y-hyhead"
      )}
      id={id}
    >
      {/* The rule runs across the columns only, not into the page margin. */}
      <div
        aria-hidden="true"
        className={cn(
          "col-span-full border-t",
          hideRule ? "border-transparent" : "border-border",
          layout === "free" && "mb-[calc(var(--spacing-hyhead)-var(--spacing-md))]"
        )}
      />
      <header
        className={cn(
          "col-span-full flex min-w-0 flex-col gap-xs lg:col-span-4",
          layout === "side" && "lg:sticky lg:top-project lg:self-start",
          // A `free` specimen places its parts on explicit rows, and the grid
          // places those before any auto-placed item, so the header needs a
          // fixed spot too.
          layout === "free" && "lg:col-start-1 lg:row-start-2"
        )}
      >
        <p aria-hidden="true" className="font-semibold text-hy-label text-muted">
          {number}
        </p>
        <h2
          className={cn(TITLE_CLASS, "text-balance text-foreground text-hy-title")}
          id={titleId}
        >
          {label}
        </h2>
        {explanation ? (
          <p className="text-pretty font-book text-hy-body text-muted">{explanation}</p>
        ) : null}
      </header>
      {layout === "free" ? (
        children
      ) : (
        <div
          className={cn(
            "col-span-full flex min-w-0 flex-col gap-y-hyblock",
            layout === "side" && "lg:col-span-8",
            layout === "wide" && "lg:grid lg:grid-cols-subgrid"
          )}
        >
          {children}
        </div>
      )}
    </section>
  );
}

type SpecimenProps = {
  label: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** One specimen inside a section, with its `h3` caption above it. */
export function Specimen({ label, hint, className, children }: SpecimenProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-md", className)}>
      <div className="flex flex-col gap-1">
        <h3 className={LABEL_CLASS}>{label}</h3>
        {hint ? <p className={cn(NOTE_CLASS, "max-w-measure")}>{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}
