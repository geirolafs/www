import { RichText } from "@/app/components/localhost/fluid-typography/rich-text";
import {
  BODY_CLASS,
  ITEM_TITLE_CLASS,
  LABEL_CLASS,
} from "@/app/components/localhost/fluid-typography/styles";
import { NUMBER } from "@/app/components/localhost/skiptingar/format";
import { localhostSkiptingarContent } from "@/lib/content/localhost-skiptingar";
import { cn } from "@/lib/utils";
import tests from "@/packages/skiptingar/tests.json";

const { reference } = localhostSkiptingarContent;

const fill = (template: string, values: Record<string, number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => NUMBER.format(values[key] ?? 0));

/**
 * The test count from the last run (`bun run tests:count`). Failures are never
 * left out: when a test failed, the line says how many passed of how many ran,
 * and an error outside any test is added after it.
 */
function testsLine(): string {
  const values = { n: tests.total, pass: tests.pass };
  const counted = fill(
    tests.fail === 0 ? reference.testsAllPass : reference.testsSomeFail,
    values
  );
  if (tests.errors === 0) {
    return counted;
  }
  const errors = fill(
    tests.errors === 1 ? reference.testsErrorOne : reference.testsErrorMany,
    { n: tests.errors }
  );
  return `${counted} ${errors}`;
}

/**
 * What is left of section H's reference after the pattern table, the install
 * requirements and the cost chart: the source of the one-letter rules, what
 * the browser and the font must support, and how the numbers on this page
 * were measured. The same rows as `Related`: a name
 * on the left and a plain line on the right, in groups.
 */
export function Reference() {
  return (
    <div className="flex flex-col gap-hyblock">
      {reference.groups.map(group => (
        <section
          aria-labelledby={`reference-${group.id}`}
          className="flex flex-col gap-sm"
          key={group.id}
        >
          <h3 className={LABEL_CLASS} id={`reference-${group.id}`}>
            {group.label}
          </h3>
          <ul className="flex flex-col">
            {group.items.map(item => (
              <li
                className="flex flex-col gap-1 border-border border-t py-md md:grid md:grid-cols-3 md:gap-x-md"
                key={item.id}
              >
                <p className={ITEM_TITLE_CLASS}>{item.term}</p>
                <p className={cn(BODY_CLASS, "max-w-measure md:col-span-2")}>
                  {"counts" in item ? `${testsLine()} ` : null}
                  <RichText parts={item.body} />
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
