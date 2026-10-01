import { firstParagraph } from "@/app/components/localhost/hyphenation/blocks";
import { initialOutput } from "@/app/components/localhost/hyphenation/initial-output";
import { LiveBlock } from "@/app/components/localhost/hyphenation/live-text";
import { Measure } from "@/app/components/localhost/hyphenation/measure";
import { LABEL_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";

const { sizes, liveEditor } = localhostHyphenationContent;

/** Written out in full so Tailwind can see every class. */
const SIZE_CLASS = {
  display: "text-display",
  prose: "text-prose",
  meta: "text-meta",
} as const;

/**
 * The first paragraph of the editor's text at three sizes, side by side, all
 * at the one width the slider sets. A smaller size fits more letters per
 * line, so the breaks land in different places. The text and the settings
 * are the page's.
 */
export function Sizes() {
  const initial = initialOutput(firstParagraph(liveEditor.initialText));

  return (
    <Measure className="col-span-full" initial={320} max={480} min={200} name="Sizes">
      <div className="flex flex-col gap-y-hyhead lg:grid lg:grid-cols-3 lg:gap-x-md">
        {sizes.items.map(item => (
          <figure className="flex min-w-0 flex-col gap-sm" key={item.id}>
            <figcaption className={LABEL_CLASS}>{item.label}</figcaption>
            <LiveBlock
              className={cn(
                SIZE_CLASS[item.id],
                "w-(--measure) max-w-full font-book text-foreground"
              )}
              initial={initial}
            />
          </figure>
        ))}
      </div>
    </Measure>
  );
}
