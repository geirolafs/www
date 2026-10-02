import {
  type Part,
  RichText,
} from "@/app/components/localhost/fluid-typography/rich-text";
import { Specimen } from "@/app/components/localhost/fluid-typography/section";
import {
  BODY_CLASS,
  ITEM_TITLE_CLASS,
  NOTE_CLASS,
} from "@/app/components/localhost/fluid-typography/styles";
import { MarkedText } from "@/app/components/localhost/skiptingar/marked-text";
import { localhostSkiptingarContent } from "@/lib/content/localhost-skiptingar";
import { hyphenate } from "@/packages/skiptingar/src";

const { breaksSection: content } = localhostSkiptingarContent;

type Item = {
  readonly id: string;
  readonly title: string;
  readonly body: readonly Part[];
  readonly word: string;
  readonly shown: readonly {
    readonly label: string;
    readonly options: Parameters<typeof hyphenate>[1];
  }[];
};

/**
 * One rule: its name, one plain sentence and its word, hyphenated here on the
 * server under each setting in `shown`. The breaks are never typed.
 */
function Rule({ item }: { item: Item }) {
  return (
    <li className="flex flex-col gap-sm border-border border-t py-md">
      <div className="flex min-w-0 max-w-measure flex-col gap-1">
        <h4 className={ITEM_TITLE_CLASS}>{item.title}</h4>
        <p className={BODY_CLASS}>
          <RichText parts={item.body} />
        </p>
      </div>
      <dl className="flex flex-wrap gap-x-xl gap-y-sm">
        {item.shown.map(shown => (
          <div className="flex min-w-0 flex-col gap-1" key={shown.label}>
            <dt className={NOTE_CLASS}>{shown.label}</dt>
            <dd
              className="wrap-break-word hyphens-manual font-hy-title text-foreground text-hy-lede"
              lang="is"
            >
              <MarkedText text={hyphenate(item.word, shown.options)} />
            </dd>
          </div>
        ))}
      </dl>
    </li>
  );
}

/** A titled list of rules, each with its example. */
function Rules({
  items,
  label,
  hint,
}: {
  items: readonly Item[];
  label: string;
  hint: readonly Part[];
}) {
  return (
    <Specimen hint={<RichText parts={hint} />} label={label}>
      <ul className="flex flex-col">
        {items.map(item => (
          <Rule item={item} key={item.id} />
        ))}
      </ul>
    </Specimen>
  );
}

/**
 * Section B's text: the order a word gets its breaks in (patterns, the
 * Ritreglur minimums, soft hyphens on the server), and examples with the
 * package's own output. Two specimens, one after the other, in the section's
 * `side` layout.
 */
export function Breaks() {
  const { order, rules } = content;

  return (
    <>
      <Specimen label={order.label}>
        <ol className="flex flex-col">
          {order.steps.map((step, index) => (
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
                <h4 className={ITEM_TITLE_CLASS}>{step.title}</h4>
                <p className={BODY_CLASS}>
                  <RichText parts={step.body} />
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Specimen>
      <Rules hint={rules.hint} items={rules.items} label={rules.label} />
    </>
  );
}
