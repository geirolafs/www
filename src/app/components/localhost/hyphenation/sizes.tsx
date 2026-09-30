import { Specimen } from "@/app/components/localhost/hyphenation/section";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";
import { Hyphenate } from "@/packages/skiptingar/src/react";

const { sizes } = localhostHyphenationContent;

/** Written out in full so Tailwind can see every class. */
const SIZE_CLASS = {
  display: "text-display",
  prose: "text-prose",
  meta: "text-meta",
} as const;

/**
 * One paragraph at three sizes, all in the same measure. The measure is in rem
 * on purpose: a smaller size fits more letters per line, so the breaks land in
 * different places.
 */
export function Sizes() {
  return (
    <div className="flex flex-col gap-xl">
      {sizes.items.map(item => (
        <Specimen key={item.id} label={item.label}>
          <Hyphenate>
            {/* The same narrow measure at every size, on purpose. */}
            <p
              className={cn(
                SIZE_CLASS[item.id],
                "max-w-[20rem] hyphens-manual text-pretty font-book text-foreground"
              )}
              lang="is"
            >
              {sizes.text}
            </p>
          </Hyphenate>
        </Specimen>
      ))}
    </div>
  );
}
