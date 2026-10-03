"use client";

import type { RefObject } from "react";
import { useRef } from "react";
import { useHyphenateAll } from "skiptingar/client";
import { firstParagraph } from "@/app/components/localhost/skiptingar/blocks";
import { useMarkOverlay } from "@/app/components/localhost/skiptingar/mark-overlay";
import { usePlayground } from "@/app/components/localhost/skiptingar/playground";
import {
  DEFAULT_SETTINGS,
  outputOptions,
  type Settings,
  wrapClass,
} from "@/app/components/localhost/skiptingar/settings";
import { localhostSkiptingarClientContent } from "@/lib/content/localhost-skiptingar-client";
import { cn } from "@/lib/utils";

const { liveEditor } = localhostSkiptingarClientContent;

type LiveTextProps = {
  /**
   * The text to set. Leave it out to set the first paragraph of the text the
   * editor has handed to the page.
   */
  text?: string;
  /**
   * The server's output for the same text with the default settings
   * (`initialOutput`). Shown until the engine loads, while nothing has
   * changed, so the first paint is already processed.
   */
  initial: string;
};

/** The settings that change the output string; the rest only change how it is shown. */
function sameOutputSettings(a: Settings, b: Settings): boolean {
  return a.localeDetails === b.localeDetails && a.betterBreaks === b.betterBreaks;
}

/**
 * The text set with the page's settings, live: change a setting in the editor
 * or hand it a new text, and every specimen that uses this follows. Returns
 * the processed string and the settings it was made with.
 */
function useLiveOutput({ text, initial }: LiveTextProps) {
  const { settings, text: pageText } = usePlayground();
  const source = text ?? firstParagraph(pageText);
  const initialSource = text ?? firstParagraph(liveEditor.initialText);

  // At the page's own text and settings the server has already set it
  // (`initial`), so nothing is asked for and hydration matches.
  const atInitial =
    source === initialSource && sameOutputSettings(settings, DEFAULT_SETTINGS);
  const { texts } = useHyphenateAll(
    atInitial
      ? []
      : [
          {
            text: source,
            options: outputOptions(settings),
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
 * Show breaks draws its marks in an overlay after the element
 * (`useMarkOverlay`), not in it, so the text wraps the same with them on.
 */
export function LiveBlock({
  as: Element = "p",
  className,
  title = false,
  ...props
}: LiveBlockProps) {
  const ref = useRef<HTMLElement>(null);
  const { output, settings } = useLiveOutput(props);

  const overlay = useMarkOverlay(
    ref,
    settings.showBreaks,
    // text-wrap moves lines without changing the text, so it is part of the key.
    `${output}|${settings.pretty}`
  );

  return (
    <>
      <Element
        className={cn("hyphens-manual", wrapClass(settings, title), className)}
        lang="is"
        // A union of element types; each one takes an HTMLElement ref.
        ref={ref as RefObject<never>}
      >
        {output}
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
