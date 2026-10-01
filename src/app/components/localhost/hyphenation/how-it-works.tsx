import { CodeBlock } from "@/app/components/localhost/hyphenation/code";
import { CssPairs } from "@/app/components/localhost/hyphenation/css-pairs";
import { MarkedText } from "@/app/components/localhost/hyphenation/marked-text";
import { PipelineDiagram } from "@/app/components/localhost/hyphenation/pipeline-diagram";
import { type Part, RichText } from "@/app/components/localhost/hyphenation/rich-text";
import { Specimen } from "@/app/components/localhost/hyphenation/section";
import {
  BODY_CLASS,
  ITEM_TITLE_CLASS,
  TITLE_CLASS,
} from "@/app/components/localhost/hyphenation/styles";
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
 * The diagram across the full width, then the steps, one usage example with
 * its real output, the CSS it pairs with and the platform notes in the
 * content column (5–12), in the section's `wide` layout. The output is
 * computed here on the server, the same way the package does it for a page.
 */
export function HowItWorks() {
  const { example } = content;
  const result = hyphenate(example.heading, { mode: "heading" });

  return (
    <>
      <PipelineDiagram />

      <div className="col-span-full flex min-w-0 flex-col gap-hyblock lg:col-span-8 lg:col-start-5">
        <ol className="flex flex-col">
          {content.steps.map((step, index) => (
            <li
              // 2rem for the step number: no spacing token is that wide.
              className="grid grid-cols-[2rem_1fr] gap-x-xs border-border border-t py-md"
              key={step.id}
            >
              {/* Tabular figures keep the step numbers the same width. */}
              <span className="font-medium text-hy-copy text-muted tabular-nums">
                {index + 1}
              </span>
              <div className="flex min-w-0 max-w-measure flex-col gap-1">
                <h3 className={ITEM_TITLE_CLASS}>{step.title}</h3>
                <p className={BODY_CLASS}>
                  <RichText parts={withCounts(step.body)} />
                </p>
              </div>
            </li>
          ))}
        </ol>

        <CodeBlock code={example.source} label={example.label} />

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
      </div>
    </>
  );
}
