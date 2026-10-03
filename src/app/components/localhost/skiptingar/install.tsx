import { CodeBlock, InlineCode } from "@/app/components/localhost/fluid-typography/code";
import { InstallCommand } from "@/app/components/localhost/fluid-typography/install-command";
import { RichText } from "@/app/components/localhost/fluid-typography/rich-text";
import {
  BODY_CLASS,
  ITEM_TITLE_CLASS,
  LABEL_CLASS,
  NOTE_CLASS,
} from "@/app/components/localhost/fluid-typography/styles";
import { Part } from "@/app/components/localhost/skiptingar/part";
import { localhostSkiptingarContent } from "@/lib/content/localhost-skiptingar";
import { cn } from "@/lib/utils";

const { install } = localhostSkiptingarContent;

/**
 * How to install the package and start: the install line for the package
 * manager you pick (bun first), a first page, what `<Hyphenate>` changes and
 * the three entry points, with the requirements under them. What each setup
 * costs a browser and what is planned are in the reference (section H). Under
 * the install line, the version, the project links and a note that the API may
 * still change.
 */
export function Install() {
  const { quickStart, changes, entries } = install;

  return (
    <>
      <div className="flex flex-col gap-xs">
        <InstallCommand label={install.commandLabel} managers={install.managers} />
        <p className={cn(NOTE_CLASS, "max-w-measure")}>
          <RichText parts={install.status} />
        </p>
      </div>

      <Part
        id={quickStart.id}
        intro={<RichText parts={quickStart.intro} />}
        title={quickStart.title}
      >
        <CodeBlock code={quickStart.source} label={quickStart.label} />
      </Part>

      <Part id={changes.id} intro={changes.intro} title={changes.title}>
        <ul className="flex flex-col">
          {changes.items.map(item => (
            <li
              className="flex flex-col gap-1 border-border border-t py-md md:grid md:grid-cols-3 md:gap-x-md"
              key={item.id}
            >
              <p className={ITEM_TITLE_CLASS}>{item.title}</p>
              <p className={cn(BODY_CLASS, "max-w-measure md:col-span-2")}>
                <RichText parts={item.body} />
              </p>
            </li>
          ))}
        </ul>
      </Part>

      <Part
        id={entries.id}
        intro={<RichText parts={entries.intro} />}
        title={entries.title}
      >
        <ul className="flex flex-col">
          {entries.items.map(item => (
            <li
              className="flex flex-col gap-xs border-border border-t py-md md:grid md:grid-cols-3 md:gap-x-md"
              key={item.id}
            >
              <div className="flex flex-col items-start gap-1">
                <InlineCode className="text-hy-copy">{item.path}</InlineCode>
                <span className={NOTE_CLASS}>{item.where}</span>
              </div>
              <p className={cn(BODY_CLASS, "md:col-span-2")}>
                <RichText parts={item.body} />
              </p>
            </li>
          ))}
        </ul>
        <section aria-labelledby={entries.endpoint.id} className="flex flex-col gap-sm">
          <h4 className={LABEL_CLASS} id={entries.endpoint.id}>
            {entries.endpoint.title}
          </h4>
          <p className={cn(BODY_CLASS, "max-w-measure")}>
            <RichText parts={entries.endpoint.body} />
          </p>
          <CodeBlock code={entries.endpoint.source} label={entries.endpoint.label} />
        </section>
        <p className={cn(NOTE_CLASS, "max-w-measure")}>
          <RichText parts={install.requirements} />
        </p>
      </Part>
    </>
  );
}
