import { hyphenate, PATTERN_COUNT } from "skiptingar";
import {
  type Part,
  RichText,
} from "@/app/components/localhost/fluid-typography/rich-text";
import { Specimen } from "@/app/components/localhost/fluid-typography/section";
import {
  BODY_CLASS,
  ITEM_TITLE_CLASS,
  TITLE_CLASS,
} from "@/app/components/localhost/fluid-typography/styles";
import { CssPairs } from "@/app/components/localhost/skiptingar/css-pairs";
import { NUMBER } from "@/app/components/localhost/skiptingar/format";
import { MarkedText } from "@/app/components/localhost/skiptingar/marked-text";
import { PipelineDiagram } from "@/app/components/localhost/skiptingar/pipeline-diagram";
import { localhostSkiptingarContent } from "@/lib/content/localhost-skiptingar";
import { cn } from "@/lib/utils";

const { howItWorks: content } = localhostSkiptingarContent;

const PATTERNS = NUMBER.format(PATTERN_COUNT);

/** Fills in the `{patterns}` placeholder, so the count comes from the package. */
function withCounts(parts: readonly Part[]): Part[] {
  return parts.map(part => ({
    ...part,
    text: part.text.replace("{patterns}", PATTERNS),
  }));
}

/**
 * The diagram across the full width, then the explanation of each layer, the
 * real output for the first-page heading and the CSS it pairs with in the
 * content column (5–12), in the section's `wide` layout. Only the diagram is
 * numbered. The output is computed here on the server, the same way the
 * package does it for a page.
 */
export function HowItWorks() {
  const { example } = content;
  const result = hyphenate(example.heading);

  return (
    <>
      <PipelineDiagram />

      <div className="col-span-full flex min-w-0 flex-col gap-hyblock lg:col-span-8 lg:col-start-5">
        <ul className="flex flex-col">
          {content.steps.map(step => (
            <li
              className="flex min-w-0 max-w-measure flex-col gap-1 border-border border-t py-md"
              key={step.id}
            >
              <h3 className={ITEM_TITLE_CLASS}>{step.title}</h3>
              <p className={BODY_CLASS}>
                <RichText parts={withCounts(step.body)} />
              </p>
            </li>
          ))}
        </ul>

        <Specimen
          hint={<RichText parts={example.resultHint} />}
          label={example.resultLabel}
        >
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
