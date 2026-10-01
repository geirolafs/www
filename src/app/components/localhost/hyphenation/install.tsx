import type { ReactNode } from "react";
import { CodeBlock, InlineCode } from "@/app/components/localhost/hyphenation/code";
import { CostChart } from "@/app/components/localhost/hyphenation/cost-chart";
import { InstallCommand } from "@/app/components/localhost/hyphenation/install-command";
import { RichText } from "@/app/components/localhost/hyphenation/rich-text";
import {
  BODY_CLASS,
  INTRO_CLASS,
  ITEM_TITLE_CLASS,
  LABEL_CLASS,
  NOTE_CLASS,
  SUBTITLE_CLASS,
} from "@/app/components/localhost/hyphenation/styles";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";

const { install } = localhostHyphenationContent;

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
 * How to install the package and start: the install line for your package
 * manager, a first page, the three entry points, and what is planned before
 * and after v1. The package is not on npm yet, and the first line says so:
 * this is how it will work.
 */
export function Install() {
  const { quickStart, entries, cost, roadmap } = install;

  return (
    <>
      <div className="flex flex-col gap-md">
        <p className={cn(NOTE_CLASS, "max-w-measure")}>{install.status}</p>
        <InstallCommand label={install.commandLabel} managers={install.managers} />
      </div>

      <Part
        id={quickStart.id}
        intro={<RichText parts={quickStart.intro} />}
        title={quickStart.title}
      >
        <CodeBlock code={quickStart.source} label={quickStart.label} />
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
