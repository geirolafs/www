import { MarkedText } from "@/app/components/localhost/hyphenation/marked-text";
import { Stage } from "@/app/components/localhost/hyphenation/stage";
import { LABEL_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";
import { hyphenate, patternPoints, SOFT_HYPHEN } from "@/packages/skiptingar/src";

const { diagram } = localhostHyphenationContent.howItWorks;

/**
 * The word in the editor's serif at the editor's size, the same in every
 * stage, so the eye can follow one word across the row.
 */
const WORD_CLASS = "font-hy-title text-foreground text-hy-editor";

/**
 * The word's letters with the winning pattern digit in each slot, the way
 * Liang writes them: `þ2j` and so on. A slot with no digit shows none.
 */
function PatternWord({ word }: { word: string }) {
  const letters = [...word];
  const points = patternPoints(word);

  return (
    <span className={cn(WORD_CLASS, "wrap-anywhere")} lang="is">
      {letters.map((letter, index) => {
        // The slot after letter `index + 1` is `points[index + 2]`.
        const digit = index < letters.length - 1 ? (points[index + 2] ?? 0) : 0;
        const odd = digit % 2 === 1;
        return (
          // The letters are the word, in order; a letter's place is its identity.
          // biome-ignore lint/suspicious/noArrayIndexKey: see above
          <span key={index}>
            {letter}
            {digit > 0 ? (
              // Set in `em`, so the digits stay in proportion to the word, and
              // small, so the word still reads as a word. An odd digit allows
              // a break, so it is red, like the break marks in stage 3; an even
              // one forbids it, so it is grey.
              <sup
                className={cn(
                  "font-hy-text text-[0.5em] tabular-nums",
                  odd ? "font-bold text-hy-signal-ink" : "font-medium text-muted"
                )}
              >
                {digit}
              </sup>
            ) : null}
          </span>
        );
      })}
    </span>
  );
}

/** The hyphenated word as the HTML holds it, with each soft hyphen written out. */
function HtmlWord({ hyphenated }: { hyphenated: string }) {
  const parts = hyphenated.split(SOFT_HYPHEN);
  return (
    <code
      className="hy-code hy-inline-code wrap-anywhere text-hy-body"
      lang="is"
      translate="no"
    >
      {parts.map((part, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: the parts are the word, in order.
        <span key={index}>
          {part}
          {index < parts.length - 1 ? (
            // Underlined in red, like the break marks in stage 3: each one
            // is a break.
            <span className="font-semibold text-foreground underline decoration-2 decoration-hy-signal underline-offset-4">
              {diagram.softHyphen}
            </span>
          ) : null}
        </span>
      ))}
    </code>
  );
}

/**
 * How it works, as one word through five stages: the word, its pattern
 * digits, the breaks the rules keep, the soft hyphens in the HTML, and the
 * line the browser sets. Every value is computed by the package here on the
 * server, so the diagram cannot drift from what the package does. A bracket
 * above the cards shows which stages run on the server and which in the
 * browser.
 */
export function PipelineDiagram() {
  const { word, line, stages } = diagram;
  const hyphenated = hyphenate(word);

  return (
    <figure className="col-span-full flex flex-col gap-sm">
      <figcaption className={LABEL_CLASS}>{diagram.label}</figcaption>
      {/* The bracket: four stages on the server, one in the browser. */}
      <div aria-hidden="true" className="hidden gap-md lg:grid lg:grid-cols-5">
        <span
          className={cn(
            LABEL_CLASS,
            "col-span-4 border-border border-t pt-2xs text-muted"
          )}
        >
          {diagram.server}
        </span>
        <span className={cn(LABEL_CLASS, "border-border border-t pt-2xs text-muted")}>
          {diagram.browser}
        </span>
      </div>
      <ol className="grid gap-xl lg:grid-cols-5 lg:gap-md">
        <Stage
          note={stages.word.note}
          number={1}
          title={stages.word.title}
          where={diagram.server}
        >
          <span className={WORD_CLASS} lang="is">
            {word}
          </span>
        </Stage>
        <Stage
          note={stages.patterns.note}
          number={2}
          title={stages.patterns.title}
          where={diagram.server}
        >
          <PatternWord word={word} />
        </Stage>
        <Stage
          note={stages.rules.note}
          number={3}
          title={stages.rules.title}
          where={diagram.server}
        >
          <span className={WORD_CLASS} lang="is">
            <MarkedText text={hyphenated} />
          </span>
        </Stage>
        <Stage
          note={stages.html.note}
          number={4}
          title={stages.html.title}
          where={diagram.server}
        >
          <HtmlWord hyphenated={hyphenated} />
        </Stage>
        <Stage
          last
          note={stages.line.note}
          number={5}
          title={stages.line.title}
          where={diagram.browser}
        >
          {/* Narrow in `em`, so the line breaks inside the word at any screen size. */}
          <p
            className="w-[7.5em] hyphens-manual border-border border-r border-dashed font-hy-title text-foreground text-hy-body"
            lang="is"
          >
            {hyphenate(line)}
          </p>
        </Stage>
      </ol>
    </figure>
  );
}
