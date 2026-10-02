/**
 * The settings the live editor sets for the whole page. A plain module, not a
 * client one, so the server can read the defaults for its first render.
 */
import { localhostSkiptingarClientContent } from "@/lib/content/localhost-skiptingar-client";

const { liveEditor: content } = localhostSkiptingarClientContent;

export type Mode = (typeof content.mode.options)[number]["value"];
export type Rules = (typeof content.rules.options)[number]["value"];

export type Settings = {
  mode: Mode;
  rules: Rules;
  typeset: boolean;
  showBreaks: boolean;
  /** `text-pretty` for body text and `text-balance` for titles; off wraps greedily. */
  pretty: boolean;
};

/** What the page renders on the server, before anyone changes a setting. */
export const DEFAULT_SETTINGS: Settings = {
  ...content.initial,
  showBreaks: false,
  pretty: true,
};

/**
 * The typeset rules the Typeset setting turns on: the defaults plus en dashes,
 * so "1990-2010" in an example is set as Ritreglur §26.2.1 asks.
 */
export const PAGE_TYPESET = { dashes: true } as const;

/** How heading mode treats compound joints: only them, never as a preference. */
export const JOINTS = "only";

/**
 * The `text-wrap` class the settings ask for, for a title or for body text:
 * `text-balance` for a title and `text-pretty` for body text when the page asks
 * for it, plain greedy wrapping when it does not.
 */
export function wrapClass(settings: Pick<Settings, "pretty">, title: boolean): string {
  if (!settings.pretty) {
    return "text-wrap";
  }
  return title ? "text-balance" : "text-pretty";
}
