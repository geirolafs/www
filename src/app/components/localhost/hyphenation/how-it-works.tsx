import { CssPairs } from "@/app/components/localhost/hyphenation/css-pairs";
import { MarkedText } from "@/app/components/localhost/hyphenation/marked-text";
import { type Part, RichText } from "@/app/components/localhost/hyphenation/rich-text";
import { Specimen } from "@/app/components/localhost/hyphenation/section";
import { CODE_CLASS, TITLE_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";
import { hyphenate, PATTERN_COUNT } from "@/packages/skiptingar/src";

const { howItWorks: content } = localhostHyphenationContent;

const PATTERNS = new Intl.NumberFormat("is").format(PATTERN_COUNT);

/** Fills in the `{patterns}` placeholder, so the count comes from the package. */
function withCounts(parts: readonly Part[]): Part[] {
  return parts.map(part => ({
    ...part,
    text: part.text.replace("{patterns}", PATTERNS),
  }));
}

/**
 * The stages a text goes through, as a row of boxes that wraps on a phone. The
 * arrows are the `→` character, so no icon or image is needed.
 */
function Pipeline() {
  return (
    <ol
      aria-label={content.pipelineLabel}
      className="flex flex-wrap items-center gap-x-xs gap-y-2xs"
    >
      {content.pipeline.map((stage, index) => (
        <li className="flex items-center gap-xs" key={stage}>
          {index > 0 ? (
            <span aria-hidden="true" className="font-medium text-muted">
              {content.pipelineArrow}
            </span>
          ) : null}
          <span className="block border border-border px-xs py-2xs font-medium text-meta">
            {stage}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Notes on what the platform does for Icelandic and what it does not. */
function Platform() {
  const { platform } = content;

  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-col gap-2xs">
        <h3
          className={cn(TITLE_CLASS, "scroll-mt-project text-foreground text-hy-lede")}
          id={platform.id}
        >
          {platform.title}
        </h3>
        <p className="max-w-3xl text-pretty font-book text-body text-muted">
          {platform.intro}
        </p>
      </div>
      <ul className="flex flex-col">
        {platform.items.map(item => (
          <li
            className="flex flex-col gap-2xs border-border border-t py-sm md:grid md:grid-cols-3 md:gap-x-md"
            key={item.id}
          >
            <p className="font-semibold text-body text-foreground">{item.term}</p>
            <p className="text-pretty font-book text-body text-muted md:col-span-2">
              <RichText parts={item.body} />
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The seven steps, then one usage example with its real output. The output is
 * computed here on the server, the same way the package does it for a page.
 */
export function HowItWorks() {
  const { example } = content;
  const result = hyphenate(example.heading, { mode: "heading" });

  return (
    <div className="flex flex-col gap-xl">
      <Pipeline />

      <ol className="flex flex-col">
        {content.steps.map((step, index) => (
          <li
            // 2rem for the step number: no spacing token is that wide.
            className="grid grid-cols-[2rem_1fr] gap-x-xs border-border border-t py-sm"
            key={step.id}
          >
            {/* Tabular figures keep the step numbers the same width. */}
            <span className="font-medium text-meta text-muted tabular-nums">
              {index + 1}
            </span>
            <div className="flex min-w-0 flex-col gap-2xs">
              <h3 className="font-semibold text-body text-foreground">{step.title}</h3>
              <p className="text-pretty font-book text-body text-muted">
                <RichText parts={withCounts(step.body)} />
              </p>
            </div>
          </li>
        ))}
      </ol>

      <Specimen label={example.label}>
        <pre className="overflow-x-auto border border-border p-sm text-meta">
          {/* The system monospace, so l, I and 1 look different. */}
          <code className={CODE_CLASS} translate="no">
            {example.source}
          </code>
        </pre>
      </Specimen>

      <Specimen hint={example.resultHint} label={example.resultLabel}>
        <p
          className={cn(
            TITLE_CLASS,
            "wrap-break-word hyphens-manual text-balance text-foreground text-hy-title"
          )}
          lang="is"
        >
          <MarkedText text={result} />
        </p>
      </Specimen>

      <CssPairs />

      <Platform />
    </div>
  );
}
