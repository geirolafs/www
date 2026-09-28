import { SectionWrapper } from "@/app/components/home/section-wrapper";
import { heroContent } from "@/lib/content/home";

/**
 * Name (the page's one `<h1>`) + role. Desktop: columns 6–12. Mobile: the
 * content column, like everything else.
 *
 * The two frames build this pair differently, so the trim is desktop-only.
 *
 * Desktop measures both lines as cap boxes with 24 between them — that is what
 * makes the pair occupy 68 rather than 107, and the whole page's rhythm hangs
 * off it. Mobile stacks them as plain consecutive lines with no gap at all:
 * 32 + 64 = the frame's 96. Trimming there would pull the role up a line and
 * lift every section below it by 16.
 */
export function NameRole() {
  return (
    <SectionWrapper gapVariant="hero">
      <div className="lg:col-span-7 lg:col-start-6">
        <h1 className="lg:cap-trim text-balance font-regular text-display text-foreground">
          {heroContent.name}
        </h1>
        <p className="lg:cap-trim text-balance font-regular text-display text-muted lg:mt-md">
          {heroContent.role}
        </p>
      </div>
    </SectionWrapper>
  );
}
