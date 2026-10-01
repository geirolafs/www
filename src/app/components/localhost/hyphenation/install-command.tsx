"use client";

import { useId, useState } from "react";
import { CopyCode } from "@/app/components/localhost/hyphenation/copy-code";
import { LABEL_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { localhostHyphenationClientContent } from "@/lib/content/localhost-hyphenation-client";
import { cn } from "@/lib/utils";

const { install: content } = localhostHyphenationClientContent;

type Manager = { readonly id: string; readonly label: string; readonly command: string };

/**
 * The install line, for the package manager you pick. It is a code block like
 * the others, with the choice in its caption: a native radio group, so the
 * arrow keys move between managers. The picked one sits on the page's white,
 * the rest in the code's quietest grey. Copy copies the line shown.
 */
export function InstallCommand({
  label,
  managers,
}: {
  label: string;
  managers: readonly Manager[];
}) {
  const name = useId();
  const [picked, setPicked] = useState(managers[0]?.id);
  const manager = managers.find(item => item.id === picked) ?? managers[0];

  if (!manager) {
    return null;
  }

  return (
    <figure className="hy-code flex min-w-0 flex-col">
      <figcaption className="flex min-h-10 flex-wrap items-center justify-between gap-x-sm gap-y-2xs py-2xs pr-2xs pl-sm">
        <span className={cn(LABEL_CLASS, "text-(--sh-sign)")}>{label}</span>
        <div className="flex items-center gap-xs">
          <fieldset className="flex">
            <legend className="sr-only">{content.managerLabel}</legend>
            {managers.map(item => (
              <label
                className="flex h-7 cursor-pointer items-center px-2xs font-hy-mono font-medium text-(--sh-sign) text-hy-caption hover:text-(--sh-keyword) has-checked:bg-background has-checked:text-(--sh-keyword) has-focus-visible:outline-2 has-focus-visible:outline-foreground has-focus-visible:outline-offset-2"
                key={item.id}
              >
                <input
                  checked={item.id === manager.id}
                  className="sr-only"
                  name={name}
                  onChange={() => setPicked(item.id)}
                  type="radio"
                  value={item.id}
                />
                {item.label}
              </label>
            ))}
          </fieldset>
          <CopyCode code={manager.command} />
        </div>
      </figcaption>
      <pre className="overflow-x-auto px-sm pb-sm font-hy-mono text-meta">
        <code translate="no">{manager.command}</code>
      </pre>
    </figure>
  );
}
