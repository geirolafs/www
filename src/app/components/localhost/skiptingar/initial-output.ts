import {
  DEFAULT_SETTINGS,
  PAGE_TYPESET,
  rulesFor,
  type Settings,
} from "@/app/components/localhost/skiptingar/settings";
import { processSegments } from "@/packages/skiptingar/src";

/**
 * A text processed with the page's default settings, on the server, so the
 * HTML already holds the processed text and nothing reflows when the engine
 * loads in the browser. `fixed` is a specimen's own override, as in `LiveBlock`.
 */
export function initialOutput(text: string, fixed: Partial<Settings> = {}): string {
  const settings = { ...DEFAULT_SETTINGS, ...fixed };
  const [output = text] = processSegments([text], {
    typeset: settings.typeset ? PAGE_TYPESET : false,
    hyphenate: { rules: rulesFor(settings) },
  });
  return output;
}
