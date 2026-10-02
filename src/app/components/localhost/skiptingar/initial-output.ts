import { processSegments } from "skiptingar";
import {
  DEFAULT_SETTINGS,
  outputOptions,
} from "@/app/components/localhost/skiptingar/settings";

/**
 * A text processed with the page's default settings, on the server, so the
 * HTML already holds the processed text and nothing reflows when the engine
 * loads in the browser.
 */
export function initialOutput(text: string): string {
  const { rules, typeset } = outputOptions(DEFAULT_SETTINGS);
  const [output = text] = processSegments([text], {
    typeset,
    hyphenate: { rules },
  });
  return output;
}
