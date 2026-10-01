"use client";

import { useId } from "react";
import {
  useDraft,
  usePlayground,
} from "@/app/components/localhost/hyphenation/playground";
import { FOCUS_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { localhostHyphenationClientContent } from "@/lib/content/localhost-hyphenation-client";
import { cn } from "@/lib/utils";

const { examples, liveEditor } = localhostHyphenationClientContent;
const CUSTOM = "custom";

/**
 * Picks one of the example texts. Picking one is a choice in itself, so
 * it goes to the whole page at once, with no confirm step. It is a native
 * `select`, drawn as a field with a chevron, so the keyboard and the phone's
 * own picker come for free. Where the browser allows it, its list is styled
 * too (`.hy-select` in globals.css). Once the draft matches no example it
 * reads "Your text".
 */
export function ExampleSelect({ className }: { className?: string }) {
  const id = useId();
  const { commit } = usePlayground();
  const { draft } = useDraft();
  const current = examples.find(example => example.text === draft)?.id ?? CUSTOM;

  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <label className="sr-only" htmlFor={id}>
        {liveEditor.composer.exampleLabel}
      </label>
      <select
        className={cn(
          "hy-select h-8 min-w-36 cursor-pointer appearance-none border border-hy-track bg-background pr-8 pl-2.5 font-medium text-foreground text-hy-control shadow-hy-control hover:bg-hy-surface",
          FOCUS_CLASS
        )}
        id={id}
        onChange={event => {
          const example = examples.find(item => item.id === event.target.value);
          if (example) {
            commit(example.text);
          }
        }}
        value={current}
      >
        {current === CUSTOM ? (
          <option disabled value={CUSTOM}>
            {liveEditor.composer.customLabel}
          </option>
        ) : null}
        {examples.map(example => (
          <option key={example.id} lang="is" value={example.id}>
            {example.label}
          </option>
        ))}
      </select>
      {/* The chevron is drawn over the select and lets clicks through. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 size-3.5 text-muted"
        fill="none"
        viewBox="0 0 16 16"
      >
        <path
          d="m4 6 4 4 4-4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    </span>
  );
}
