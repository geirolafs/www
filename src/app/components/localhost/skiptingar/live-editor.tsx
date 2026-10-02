"use client";

import { useMemo, useRef } from "react";
import { NO_BREAK_SPACE, SOFT_HYPHEN, useHyphenateAll } from "skiptingar/client";

import { Measure } from "@/app/components/localhost/fluid-typography/measure";
import {
  EDITOR_CLASS,
  TITLE_CLASS,
} from "@/app/components/localhost/fluid-typography/styles";
import { Tip } from "@/app/components/localhost/fluid-typography/tip";
import { parseBlocks } from "@/app/components/localhost/skiptingar/blocks";
import { Composer } from "@/app/components/localhost/skiptingar/composer";
import { useMarkOverlay } from "@/app/components/localhost/skiptingar/mark-overlay";
import { usePlayground } from "@/app/components/localhost/skiptingar/playground";
import {
  DEFAULT_SETTINGS,
  outputOptions,
  type Settings,
  wrapClass,
} from "@/app/components/localhost/skiptingar/settings";
import { SettingsPanel } from "@/app/components/localhost/skiptingar/settings-panel";
import { localhostSkiptingarClientContent } from "@/lib/content/localhost-skiptingar-client";
import { cn } from "@/lib/utils";

const { liveEditor: content, tips } = localhostSkiptingarClientContent;

/** The id the settings dock watches: it shows once these controls are out of view. */
export const EDITOR_SETTINGS_ID = "editor-settings";

function count(texts: readonly string[], character: string): number {
  return texts.reduce((total, text) => total + text.split(character).length - 1, 0);
}

/**
 * One block of the result. A title is set large, and balanced when the
 * text-wrap setting is on.
 */
function EditorBlock({
  output,
  settings,
  title,
}: {
  output: string;
  settings: Settings;
  title: boolean;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  // Show breaks draws its marks after the paragraph, not in it: a mark inside
  // the line can change its width.
  const overlay = useMarkOverlay(
    ref,
    settings.showBreaks,
    // text-wrap moves lines without changing the text, so it is part of the key.
    `${output}|${settings.pretty}`
  );

  return (
    <>
      <p
        className={cn(
          "hyphens-manual",
          title ? cn(TITLE_CLASS, "text-hy-title") : EDITOR_CLASS,
          wrapClass(settings, title)
        )}
        ref={ref}
      >
        {output}
      </p>
      {overlay}
    </>
  );
}

type LiveEditorProps = {
  /**
   * The output of each block of the initial text, processed on the server
   * with the default settings. Until the engine has loaded, and while nothing
   * has changed, the result shows these, so the first paint is processed and
   * nothing reflows when the engine arrives.
   */
  initialOutputs: readonly string[];
};

/**
 * The composer, the page settings and the result. A `# ` line is a title,
 * set large with `text-balance`; the rest follows the settings.
 * The result and the rest of the page follow the text once it is handed on,
 * not the draft as it is typed.
 */
export function LiveEditor({ initialOutputs }: LiveEditorProps) {
  // The committed text, not the draft: the result waits for the arrow, so
  // typing never re-sets the whole result on every keystroke.
  const { settings, text } = usePlayground();
  const blocks = useMemo(() => parseBlocks(text), [text]);

  const atInitial =
    text === content.initialText &&
    settings.typeset === DEFAULT_SETTINGS.typeset &&
    settings.typographic === DEFAULT_SETTINGS.typographic;

  // At the page's own text and settings the server has already set every
  // block (`initialOutputs`), so nothing is asked for.
  const processed = useHyphenateAll(
    atInitial
      ? []
      : blocks.map(block => ({
          text: block.text,
          options: outputOptions(settings),
        }))
  );
  const outputs = atInitial ? initialOutputs : processed.texts;

  return (
    // `contents`: the three parts below are items of the section's grid (its
    // `free` layout). The DOM order is the phone's order: the text, the
    // settings, then the result. From `lg` up the settings sit in columns
    // 1–4 under the header and stay in view beside the result.
    <div className="contents">
      <div className="col-span-full lg:col-span-8 lg:col-start-5 lg:row-start-2">
        <Composer />
      </div>

      <div
        className="col-span-full lg:sticky lg:top-project lg:col-span-4 lg:col-start-1 lg:row-start-3 lg:self-start"
        id={EDITOR_SETTINGS_ID}
      >
        <SettingsPanel layout="column" />
      </div>

      <div className="col-span-full flex min-w-0 flex-col gap-md lg:col-span-8 lg:col-start-5 lg:row-start-3">
        <Measure
          initial={content.width.initial}
          name={content.outputLabel}
          max={content.width.max}
          min={content.width.min}
        >
          <section
            aria-label={content.outputLabel}
            className="flex w-(--measure) max-w-full flex-col gap-sm border border-border border-dashed p-sm text-foreground"
            lang="is"
          >
            {blocks.map((block, index) => (
              <EditorBlock
                key={block.id}
                output={outputs[index] ?? block.text}
                settings={settings}
                title={block.kind === "title"}
              />
            ))}
          </section>
        </Measure>

        <p className="flex flex-wrap gap-x-md font-book text-hy-note text-muted">
          <Tip className="min-h-6" tip={tips.softHyphen}>
            {content.breaks(count(outputs, SOFT_HYPHEN))}
          </Tip>
          <Tip className="min-h-6" tip={tips.noBreakSpace}>
            {content.noBreakSpaces(count(outputs, NO_BREAK_SPACE))}
          </Tip>
        </p>
      </div>
    </div>
  );
}
