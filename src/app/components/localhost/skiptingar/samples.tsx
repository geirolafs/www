import { Measure } from "@/app/components/localhost/fluid-typography/measure";
import { PAIR_BOX, Pair } from "@/app/components/localhost/fluid-typography/pair";
import { TITLE_CLASS } from "@/app/components/localhost/fluid-typography/styles";
import { initialOutput } from "@/app/components/localhost/skiptingar/initial-output";
import { LiveBlock } from "@/app/components/localhost/skiptingar/live-text";
import { MarkedText } from "@/app/components/localhost/skiptingar/marked-text";
import { localhostSkiptingarContent } from "@/lib/content/localhost-skiptingar";
import { cn } from "@/lib/utils";
import { hyphenate } from "@/packages/skiptingar/src";

const { samplesSection: content } = localhostSkiptingarContent;

/** The "without" side never breaks inside a word and wraps greedily. */
const WITHOUT = "hyphens-manual text-wrap";

/**
 * Two headings in a phone-width box, one above the other: without the
 * package the long compound runs out of the box, so the two sides are
 * stacked and the overflow has room to show.
 */
export function HeadingSample() {
  const { headings } = content.heading;
  const headingClass = cn(TITLE_CLASS, "text-foreground text-hy-title");

  return (
    <Pair
      initial={320}
      max={560}
      min={200}
      name={content.heading.label}
      stack
      with={
        <div className={cn(PAIR_BOX, "flex flex-col gap-md")}>
          {headings.map(heading => (
            <LiveBlock
              as="h4"
              className={headingClass}
              initial={initialOutput(heading)}
              key={heading}
              text={heading}
              title
            />
          ))}
        </div>
      }
      without={
        <div className={cn(PAIR_BOX, "flex flex-col gap-md")} lang="is">
          {headings.map(heading => (
            <h4 className={cn(headingClass, WITHOUT)} key={heading}>
              {heading}
            </h4>
          ))}
        </div>
      }
    />
  );
}

/** Three narrow cards a row. Stacked, so an overflowing name has room to show. */
export function CardGrid() {
  const { items } = content.cards;
  const grid = "grid w-(--measure) max-w-full grid-cols-3 gap-xs";
  const card = "flex min-w-0 flex-col gap-2xs border border-border p-xs";
  const label = "font-medium text-body text-foreground";
  const description = "font-book text-hy-note text-muted";

  return (
    <Pair
      initial={480}
      max={720}
      min={300}
      name={content.cards.label}
      stack
      with={
        <ul className={grid}>
          {items.map(item => (
            <li className={card} key={item.label}>
              <LiveBlock
                className={label}
                initial={initialOutput(item.label)}
                text={item.label}
                title
              />
              <LiveBlock
                className={description}
                initial={initialOutput(item.description)}
                text={item.description}
              />
            </li>
          ))}
        </ul>
      }
      without={
        <ul className={grid} lang="is">
          {items.map(item => (
            <li className={card} key={item.label}>
              <p className={cn(label, WITHOUT)}>{item.label}</p>
              <p className={cn(description, WITHOUT)}>{item.description}</p>
            </li>
          ))}
        </ul>
      }
    />
  );
}

/**
 * Icelandic with two English phrases in it. The Icelandic parts get breaks and
 * the English ones do not, the way `<Hyphenate>` treats a nested `lang`, and
 * every mark is shown, so the difference is visible. Hyphenation alone: the
 * specimen does not depend on the optional typeset layer.
 */
export function MixedLanguages() {
  const { mixed } = content;
  return (
    <Measure initial={320} max={560} min={180} name={mixed.label}>
      <p
        className={cn(PAIR_BOX, "hyphens-manual text-pretty font-book text-prose")}
        lang="is"
      >
        <MarkedText text={hyphenate(mixed.before)} />
        <span lang="en">{mixed.word}</span>
        <MarkedText text={hyphenate(mixed.middle)} />
        <span lang="en">{mixed.phrase}</span>
        <MarkedText text={hyphenate(mixed.after)} />
      </p>
    </Measure>
  );
}
