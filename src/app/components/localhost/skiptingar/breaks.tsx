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
  readonly shown: readonly { readonly label: string; readonly text: string }[];
};

/**
 * Each rule's word under each setting in `rules.shown`, hyphenated once at
 * module load: the words and settings are fixed copy, so no render repeats it.
 * The breaks are never typed.
 */
const ITEMS: readonly Item[] = content.rules.items.map(({ word, ...item }) => ({
  ...item,
  shown: content.rules.shown.map(({ label, options }) => ({
    label,
    text: hyphenate(word, options),
  })),
}));

/** One rule: its name, one plain sentence and its word under each setting. */
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
              <MarkedText text={shown.text} />
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
 * Section B's examples, with the package's own output. The steps a word goes
 * through are explained once, in How it works; the hint links there.
 */
export function Breaks() {
  const { rules } = content;

  return <Rules hint={rules.hint} items={ITEMS} label={rules.label} />;
}
