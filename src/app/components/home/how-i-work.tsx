import { SectionWrapper } from "@/app/components/home/section-wrapper";
import { howIWorkContent } from "@/lib/content/home";
import { cn } from "@/lib/utils";

/**
 * The second prose band, below the carousel. Set exactly as the introduction
 * is — `font-book`, `--text-display`, cap-trimmed, `prose-gap` between
 * paragraphs — so the two read as the same voice returning rather than as
 * two different kinds of text.
 *
 * The one difference from the introduction is the pill. By this point the
 * visitor has passed three labelled bands, and an unlabelled block here would
 * read as something that lost its label rather than as a deliberate opening.
 *
 * `lg:col-start-3` looks wrong and is not. `SectionWrapper`'s labelled branch
 * hands its children a subgrid of the page's columns 4–11, so track 3 of that
 * subgrid *is* page column 6 — the introduction's own measure, reached
 * without either component restating a column number. Spanning 6 lands it on
 * 6–11 and holds the 684px that wraps this copy the way the intro's wraps.
 *
 * `reveal="section"` and not `"items"`: the whole band fades as one. The
 * `"items"` variant staggers its children, which is right for a list of rows
 * and wrong for three paragraphs — staggered prose reads as a list. The
 * introduction's exemption from reveal does not apply here either; that
 * exemption exists because it holds the page's LCP element, and this band is
 * below the carousel, off-screen at every width on load.
 */
export function HowIWork() {
  return (
    <SectionWrapper
      id="how-i-work-heading"
      label={howIWorkContent.label}
      reveal="section"
    >
      <div className="lg:col-span-6 lg:col-start-3">
        {howIWorkContent.paragraphs.map((paragraph, index) => (
          <p
            className={cn(
              "cap-trim text-pretty font-book text-display text-foreground leading-prose",
              index > 0 && "prose-gap"
            )}
            key={paragraph}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </SectionWrapper>
  );
}
