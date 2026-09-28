import { SectionWrapper } from "@/app/components/home/section-wrapper";
import { introductionContent } from "@/lib/content/home";
import { cn } from "@/lib/utils";

/**
 * Book-weight paragraphs on page columns 6–11. `prose-gap` compensates for
 * cap trimming so paragraph spacing also works without text-box.
 */
export function Introduction() {
  return (
    // No top gap of its own: it is the first band inside the stripe wrapper,
    // and that wrapper carries the rhythm so the stripe starts level with this
    // text rather than one section gap above it.
    <SectionWrapper gapVariant="none">
      <div className="lg:col-span-6 lg:col-start-6">
        {introductionContent.paragraphs.map((paragraph, index) => (
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
