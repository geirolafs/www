import type { ReactNode } from "react";
import { LABEL_CLASS, TITLE_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { cn } from "@/lib/utils";

type SectionProps = {
  /** The anchor the top bar links to. */
  id: string;
  /** The section's place in the page, like `01`. */
  number: string;
  label: string;
  /** One line under the title: what the specimen shows. */
  explanation?: string;
  children: ReactNode;
};

/**
 * A numbered section of the playground. On a wide screen the title column
 * stays in view beside the specimen; on a phone the two stack. The title is
 * the section's `h2`; specimens inside it caption themselves with `h3`.
 */
export function Section({ id, number, label, explanation, children }: SectionProps) {
  const titleId = `${id}-title`;

  return (
    <section
      aria-labelledby={titleId}
      className="grid scroll-mt-project gap-x-md gap-y-xl border-border border-t py-project lg:grid-cols-12"
      id={id}
    >
      <header className="flex min-w-0 flex-col gap-xs lg:sticky lg:top-project lg:col-span-4 lg:self-start">
        {/* Tabular figures keep 01 to 07 the same width. */}
        <p
          aria-hidden="true"
          className="font-semibold text-hy-label text-muted tabular-nums"
        >
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
      <div className="flex min-w-0 flex-col gap-project lg:col-span-8">{children}</div>
    </section>
  );
}

type SpecimenProps = {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
};

/** One specimen inside a section, with its `h3` caption above it. */
export function Specimen({ label, hint, children }: SpecimenProps) {
  return (
    <div className="flex flex-col gap-xs">
      <div className="flex flex-col">
        <h3 className={LABEL_CLASS}>{label}</h3>
        {hint ? <p className="font-regular text-label text-muted">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}
