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
 * Picks one of the three example texts. Picking one is a choice in itself, so
 * it goes to the whole page at once, with no confirm step. It is a native
 * `select`, drawn as a pill with a chevron, so the keyboard and the phone's
 * own picker come for free. Once the draft matches no example it reads "Your
 * text".
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
          "h-8 cursor-pointer appearance-none bg-hy-surface pr-7 pl-2.5 font-medium text-foreground text-hy-control hover:bg-hy-track",
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
        className="pointer-events-none absolute right-2.5 size-3 text-muted"
        fill="none"
        viewBox="0 0 12 12"
      >
        <path
          d="M3.5 4.75 6 2.25l2.5 2.5M3.5 7.25 6 9.75l2.5-2.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.25"
        />
      </svg>
    </span>
  );
}
