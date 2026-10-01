import { initialOutput } from "@/app/components/localhost/hyphenation/initial-output";
import { LiveBlock } from "@/app/components/localhost/hyphenation/live-text";
import { Measure } from "@/app/components/localhost/hyphenation/measure";
import { PAIR_BOX, Pair } from "@/app/components/localhost/hyphenation/pair";
import type { Settings } from "@/app/components/localhost/hyphenation/settings";
import { SettledSegments } from "@/app/components/localhost/hyphenation/settled-segments";
import {
  LABEL_CLASS,
  NOTE_CLASS,
  TITLE_CLASS,
} from "@/app/components/localhost/hyphenation/styles";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";
import { processSegments } from "@/packages/skiptingar/src";

const { samplesSection: content } = localhostHyphenationContent;

/** The "without" side never breaks inside a word and wraps greedily. */
const WITHOUT = "hyphens-manual text-wrap";

/** Hyphenated and typeset with the defaults, for the specimens that show their marks. */
function processed(text: string): string {
  const [output = text] = processSegments([text], { typeset: {}, hyphenate: {} });
  return output;
}

function Credit({ children }: { children: string }) {
  return (
    <p className={NOTE_CLASS} lang="is">
      {children}
    </p>
  );
}

const HEADING: Partial<Settings> = { mode: "heading" };

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
      stack
      with={
        <div className={cn(PAIR_BOX, "flex flex-col gap-md")}>
          {headings.map(heading => (
            <LiveBlock
              as="h4"
              className={headingClass}
              fixed={HEADING}
              initial={initialOutput(heading, HEADING)}
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

/**
 * One paragraph as a pair: the browser alone, then with skiptingar. Each
 * caller's `initial` width was picked by measuring the rag of both sides
 * across the slider's range in Chrome, where the difference is clearest.
 */
function ParagraphPair({
  text,
  className,
  initial,
}: {
  text: string;
  className: string;
  initial: number;
}) {
  return (
    <Pair
      initial={initial}
      max={560}
      min={180}
      with={
        <LiveBlock
          className={cn(PAIR_BOX, className)}
          initial={initialOutput(text)}
          text={text}
        />
      }
      without={
        <p className={cn(PAIR_BOX, WITHOUT, className)} lang="is">
          {text}
        </p>
      }
    />
  );
}

export function ShortParagraph() {
  return (
    <>
      {/* Weight 300 is a scoped exception for this route (see AGENTS.md). */}
      <ParagraphPair
        className="font-light text-foreground text-hy-lede"
        initial={320}
        text={content.short.text}
      />
      <Credit>{content.short.credit}</Credit>
    </>
  );
}

export function LongParagraph() {
  return (
    <>
      <ParagraphPair
        className="font-book text-foreground text-prose"
        initial={360}
        text={content.long.text}
      />
      <Credit>{content.long.credit}</Credit>
    </>
  );
}

export function LawText() {
  const { articles } = content.law;
  const article = "flex flex-col gap-2xs";
  const number = cn(LABEL_CLASS, "text-muted tabular-nums");
  const text = "font-book text-foreground text-prose";

  return (
    <>
      <Pair
        initial={340}
        max={560}
        min={180}
        with={
          <div className={cn(PAIR_BOX, "flex flex-col gap-sm")}>
            {articles.map(item => (
              <div className={article} key={item.number}>
                <p className={number} lang="is">
                  {item.number}
                </p>
                <LiveBlock
                  className={text}
                  initial={initialOutput(item.text)}
                  text={item.text}
                />
              </div>
            ))}
          </div>
        }
        without={
          <div className={cn(PAIR_BOX, "flex flex-col gap-sm")} lang="is">
            {articles.map(item => (
              <div className={article} key={item.number}>
                <p className={number}>{item.number}</p>
                <p className={cn(text, WITHOUT)}>{item.text}</p>
              </div>
            ))}
          </div>
        }
      />
      <Credit>{content.law.credit}</Credit>
    </>
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

const NAME: Partial<Settings> = { mode: "heading", showBreaks: true };

/**
 * Names in heading mode with their breaks always shown, each broken at the
 * joint before its ending. They follow the page's rules, so switching to
 * Ritreglur makes the shorter names break too.
 */
export function Names() {
  return (
    <ul className="flex flex-col gap-2xs">
      {content.names.names.map(name => (
        <li key={name}>
          <LiveBlock
            className={cn(TITLE_CLASS, "wrap-break-word text-foreground text-hy-title")}
            fixed={NAME}
            initial={initialOutput(name, NAME)}
            text={name}
            title
          />
        </li>
      ))}
    </ul>
  );
}

/**
 * Icelandic with two English phrases in it. The Icelandic parts are processed
 * and the English ones are not, the way `<Hyphenate>` treats a nested `lang`,
 * and every mark is shown, so the difference is visible. The rag is settled
 * in the browser when the page asks for it.
 */
export function MixedLanguages() {
  const { mixed } = content;
  return (
    <Measure initial={320} max={560} min={180}>
      <SettledSegments
        className={cn(PAIR_BOX, "font-book text-prose")}
        segments={[
          { text: processed(mixed.before) },
          { text: mixed.word, lang: "en" },
          { text: processed(mixed.middle) },
          { text: mixed.quote, lang: "en" },
          { text: processed(mixed.after) },
        ]}
      />
    </Measure>
  );
}

/** The acronyms, with every mark shown: none in UNESCO, several in the long one. */
export function Acronyms() {
  return (
    <Measure initial={260} max={560} min={160}>
      <SettledSegments
        className={cn(PAIR_BOX, "font-book text-prose")}
        segments={[{ text: processed(content.acronyms.text) }]}
      />
    </Measure>
  );
}
