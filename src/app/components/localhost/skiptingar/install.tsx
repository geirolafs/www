import type { ReactNode } from "react";
import { CodeBlock, InlineCode } from "@/app/components/localhost/fluid-typography/code";
import { InstallCommand } from "@/app/components/localhost/fluid-typography/install-command";
import { RichText } from "@/app/components/localhost/fluid-typography/rich-text";
import {
  BODY_CLASS,
  INTRO_CLASS,
  ITEM_TITLE_CLASS,
  LABEL_CLASS,
  NOTE_CLASS,
  SUBTITLE_CLASS,
} from "@/app/components/localhost/fluid-typography/styles";
import { CostChart } from "@/app/components/localhost/skiptingar/cost-chart";
import { localhostSkiptingarContent } from "@/lib/content/localhost-skiptingar";
import { cn } from "@/lib/utils";

const { install } = localhostSkiptingarContent;

/** A part of the section: its serif subtitle, the intro under it, then the rest. */
function Part({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-xl">
      <div className="flex flex-col gap-xs">
        <h3 className={cn(SUBTITLE_CLASS, "scroll-mt-project")} id={id}>
          {title}
        </h3>
        <p className={cn(INTRO_CLASS, "max-w-measure")}>{intro}</p>
      </div>
      {children}
    </div>
  );
}

/**
 * How to install the package and start: the install line for the package
 * manager you pick (bun first), a first page, what `<Hyphenate>` changes, the
 * three entry points, what each setup costs a browser, and what is planned.
 * Under the install line, the version, the project links and a note that the
 * API may still change.
 */
export function Install() {
  const { quickStart, changes, entries, cost, roadmap } = install;

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

      <Part id={entries.id} intro={entries.intro} title={entries.title}>
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
        <p className={cn(NOTE_CLASS, "max-w-measure")}>{install.requirements}</p>
      </Part>

      <Part id={cost.id} intro={cost.intro} title={cost.title}>
        <CostChart />
      </Part>

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
    </>
  );
}
