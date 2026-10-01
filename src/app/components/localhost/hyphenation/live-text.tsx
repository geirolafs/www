"use client";

import type { RefObject } from "react";
import { useRef } from "react";
import { firstParagraph } from "@/app/components/localhost/hyphenation/blocks";
import { useMarkOverlay } from "@/app/components/localhost/hyphenation/mark-overlay";
import { usePlayground } from "@/app/components/localhost/hyphenation/playground";
import {
  DEFAULT_SETTINGS,
  jointsFor,
  PAGE_TYPESET,
  ragOptions,
  type Settings,
  wrapClass,
} from "@/app/components/localhost/hyphenation/settings";
import { SettledContent } from "@/app/components/localhost/hyphenation/settled-content";
import { localhostHyphenationClientContent } from "@/lib/content/localhost-hyphenation-client";
import { cn } from "@/lib/utils";
import { useHyphenateAll, useSettledRag } from "@/packages/skiptingar/src/client";

const { liveEditor } = localhostHyphenationClientContent;

type LiveTextProps = {
  /**
   * The text to set. Leave it out to set the first paragraph of the text the
   * editor has handed to the page.
   */
  text?: string;
  /**
   * The server's output for the same text with the default settings and
   * `fixed` (`initialOutput`). Shown until the engine loads, while nothing
   * has changed, so the first paint is already processed.
   */
  initial: string;
  /** Settings this specimen keeps whatever the page says, like a title's `mode`. */
  fixed?: Partial<Settings>;
};

/** The settings that change the output string; the rest only change how it is shown. */
function sameOutputSettings(a: Settings, b: Settings): boolean {
  return (
    a.mode === b.mode && a.rules === b.rules && a.typeset === b.typeset && a.rag === b.rag
  );
}

/**
 * The text set with the page's settings, live: change a setting in the editor
 * or hand it a new text, and every specimen that uses this follows. Returns
 * the processed string and the settings it was made with.
 */
function useLiveOutput({ text, initial, fixed }: LiveTextProps) {
  const { settings: pageSettings, text: pageText } = usePlayground();
  const settings = { ...pageSettings, ...fixed };
  const source = text ?? firstParagraph(pageText);
  const initialSource = text ?? firstParagraph(liveEditor.initialText);

  // At the page's own text and settings the server has already set it
  // (`initial`), so nothing is asked for and hydration matches.
  const atInitial =
    source === initialSource &&
    sameOutputSettings(settings, { ...DEFAULT_SETTINGS, ...fixed });
  const { texts } = useHyphenateAll(
    atInitial
      ? []
      : [
          {
            text: source,
            options: {
              mode: settings.mode,
              rules: settings.rules,
              joints: jointsFor(settings),
              typeset: settings.typeset ? PAGE_TYPESET : false,
            },
          },
        ]
  );
  const output = atInitial ? initial : (texts[0] ?? source);
  return { output, settings };
}

type LiveBlockProps = LiveTextProps & {
  as?: "p" | "h3" | "h4" | "div";
  className?: string;
  /** A title gets `text-balance` and body text `text-pretty`, when the page asks for it. */
  title?: boolean;
};

/**
 * The live text in its own element, with the `text-wrap` the page settings
 * ask for. The element is Icelandic and breaks only at the soft hyphens.
 * With Settle rag on, it measures its own lines and sets the breaks a
 * typesetter would (`useSettledRag`), balancing a title. Show breaks draws
 * its marks in an overlay after the element (`useMarkOverlay`), not in it, so
 * the text wraps the same with them on.
 */
export function LiveBlock({
  as: Element = "p",
  className,
  title = false,
  ...props
}: LiveBlockProps) {
  const ref = useRef<HTMLElement>(null);
  const { output, settings } = useLiveOutput(props);
  const settled = useSettledRag(ref, output, {
    enabled: settings.rag,
    ...ragOptions(settings, title),
  });

  const overlay = useMarkOverlay(
    ref,
    settings.showBreaks,
    `${settled.text}|${JSON.stringify(settled.hangs)}|${JSON.stringify(settled.tightened)}`
  );

  return (
    <>
      <Element
        className={cn("hyphens-manual", wrapClass(settings, title), className)}
        lang="is"
        // A union of element types; each one takes an HTMLElement ref.
        ref={ref as RefObject<never>}
      >
        <SettledContent
          hangs={settled.hangs}
          tightened={settled.tightened}
          text={settled.text}
        />
      </Element>
      {overlay}
    </>
  );
}

/**
 * The first paragraph of the page's text as typed: no soft hyphens, no
 * typesetting. The "without" side of a comparison that follows the editor.
 */
export function PageParagraph() {
  const { text } = usePlayground();
  return firstParagraph(text);
}
