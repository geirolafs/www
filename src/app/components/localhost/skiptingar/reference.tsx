import tests from "skiptingar/tests.json";
import { RichText } from "@/app/components/localhost/fluid-typography/rich-text";
import {
  BODY_CLASS,
  ITEM_TITLE_CLASS,
  LABEL_CLASS,
} from "@/app/components/localhost/fluid-typography/styles";
import { CostChart } from "@/app/components/localhost/skiptingar/cost-chart";
import { NUMBER } from "@/app/components/localhost/skiptingar/format";
import { Part } from "@/app/components/localhost/skiptingar/part";
import { localhostSkiptingarContent } from "@/lib/content/localhost-skiptingar";
import { cn } from "@/lib/utils";

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
 * The reference at the end of section H, after the pattern table and the
 * related work: what each setup costs a browser, then the notes (data and
 * rules, support, how it is checked), then what is planned. The notes use the
 * same rows as `Related`: a name on the left and a plain line on the right,
 * in groups.
 */
export function Reference() {
  const { cost, roadmap } = reference;

  return (
    <div className="flex flex-col gap-hyblock">
      <Part id={cost.id} intro={<RichText parts={cost.intro} />} title={cost.title}>
        <CostChart />
      </Part>

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

      <Part id={roadmap.id} intro={roadmap.intro} title={roadmap.title}>
        <div className="flex flex-col gap-xl">
          {roadmap.groups.map(group => (
            <section
              aria-labelledby={`${roadmap.id}-${group.id}`}
              className="flex flex-col gap-sm"
              key={group.id}
            >
              <h4 className={LABEL_CLASS} id={`${roadmap.id}-${group.id}`}>
                {group.label}
              </h4>
              <ul className="flex flex-col">
                {group.items.map(item => (
                  <li
                    className="flex flex-col gap-1 border-border border-t py-md md:grid md:grid-cols-3 md:gap-x-md"
                    key={item.id}
                  >
                    <p className={ITEM_TITLE_CLASS}>{item.title}</p>
                    <p className={cn(BODY_CLASS, "max-w-measure md:col-span-2")}>
                      {item.body}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Part>
    </div>
  );
}
