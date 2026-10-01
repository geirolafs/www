"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ExampleSelect } from "@/app/components/localhost/hyphenation/example-select";
import {
  useDraft,
  usePlayground,
} from "@/app/components/localhost/hyphenation/playground";
import { EDITOR_CLASS, FOCUS_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { localhostHyphenationClientContent } from "@/lib/content/localhost-hyphenation-client";
import { cn } from "@/lib/utils";

const { liveEditor } = localhostHyphenationClientContent;
const { composer: content } = liveEditor;

const WORDS = /\S+/g;

/**
 * The editor's text box, drawn as a composer: the text on top, and a bar
 * under it with the example picker on the left and the button that hands the
 * text to the rest of the page on the right. The text field sizes itself
 * (`field-sizing: content`) between a floor and a ceiling, then scrolls. A
 * wrapper follows its height through a `ResizeObserver` and transitions to
 * it, so the box eases to its new height instead of snapping (the one
 * `height` animation AGENTS.md allows).
 *
 * Nothing follows the keystrokes: the result and the rest of the page wait
 * for the button, or Ctrl/⌘ + Enter, so typing stays quick.
 */
export function Composer() {
  const id = useId();
  const statusId = useId();
  const { text, commit } = usePlayground();
  const { draft, setDraft } = useDraft();
  const pending = draft !== text;
  const words = draft.match(WORDS)?.length ?? 0;
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  // `null` until measured: the server and the first paint use the field's
  // own height, so nothing animates on load.
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry?.borderBoxSize[0]?.blockSize ?? field.offsetHeight);
    });
    observer.observe(field);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col gap-xs">
      <label className="sr-only" htmlFor={id}>
        {liveEditor.textLabel}
      </label>
      <div className="flex flex-col border border-hy-track bg-background shadow-hy-control focus-within:border-foreground hover:border-border">
        <div
          className="overflow-hidden transition-[height] duration-200 ease-out motion-reduce:transition-none"
          // The field's measured height, a live value, not a design token.
          style={height === null ? undefined : { height }}
        >
          <textarea
            aria-describedby={statusId}
            className={cn(
              EDITOR_CLASS,
              // Grows from four lines to twelve on a phone, twenty from `lg`
              // up, then scrolls.
              "field-sizing-content max-h-[12lh] min-h-[4lh] w-full resize-none bg-transparent px-sm pt-sm pb-2xs outline-none lg:max-h-[20lh]"
            )}
            id={id}
            lang="is"
            onChange={event => setDraft(event.target.value)}
            onKeyDown={event => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                commit(draft);
              }
            }}
            ref={fieldRef}
            value={draft}
          />
        </div>
        <div className="flex items-center gap-xs px-xs pb-xs">
          <ExampleSelect className="mr-auto sm:mr-0" />
          <span className="font-book text-hy-control text-muted tabular-nums max-sm:sr-only">
            {content.words(words)}
          </span>
          <span className="font-regular text-hy-control text-muted max-md:sr-only">
            {content.hint}
          </span>
          <span
            aria-live="polite"
            className="ml-auto flex items-center gap-2xs font-book text-hy-control text-muted max-sm:sr-only"
            id={statusId}
          >
            {/* Amber while the page still shows the older text: a quiet nudge
                to press the arrow. */}
            {pending ? (
              <span aria-hidden="true" className="size-2 shrink-0 bg-hy-accent" />
            ) : null}
            {pending ? content.unused : content.used}
          </span>
          <button
            aria-keyshortcuts="Control+Enter Meta+Enter"
            aria-label={content.use}
            className={cn(
              "grid size-8 shrink-0 place-items-center",
              pending
                ? "cursor-pointer bg-foreground text-background shadow-hy-control hover:bg-foreground/85"
                : "cursor-not-allowed bg-hy-surface text-muted/60",
              FOCUS_CLASS
            )}
            disabled={!pending}
            onClick={() => commit(draft)}
            title={`${content.use} (${content.useShortcut})`}
            type="button"
          >
            <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
              <path
                d="M8 13V3M3.5 7.5 8 3l4.5 4.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.75"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
