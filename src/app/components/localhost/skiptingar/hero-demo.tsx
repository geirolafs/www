import {
  EDITOR_CLASS,
  TITLE_CLASS,
} from "@/app/components/localhost/fluid-typography/styles";
import {
  HeroFigureSide,
  HighlightStyles,
  type Known,
} from "@/app/components/localhost/skiptingar/hero-figure";
import { PAGE_TYPESET } from "@/app/components/localhost/skiptingar/settings";
import { localhostSkiptingarContent } from "@/lib/content/localhost-skiptingar";
import { cn } from "@/lib/utils";
import { NO_BREAK_SPACE, processSegments, SOFT_HYPHEN } from "@/packages/skiptingar/src";

const { demo } = localhostSkiptingarContent.hero;

const title = processed(demo.title);
const text = processed(demo.text);

/**
 * What the figure's notes need from the server's text: the phrases the typeset
 * rules glued. A glued phrase is a run of words joined by no-break spaces, so
 * the laid-out text no longer shows it as a phrase.
 */
const known: Known = {
  glued: [title, text].flatMap(output =>
    [...output.replaceAll(SOFT_HYPHEN, "").matchAll(/[^ ]+(?:\u00A0[^ ]+)+/g)].map(
      match => match[0].replaceAll(NO_BREAK_SPACE, " ")
    )
  ),
};

/** The server's two layers: the patterns, then the typeset rules (the page's defaults). */
function processed(text: string): string {
  const [output = text] = processSegments([text], {
    typeset: PAGE_TYPESET,
    hyphenate: {},
  });
  return output;
}

/**
 * The claim in one look, under the lede, drawn as a figure rather than a
 * specimen: the same title and paragraph in the same narrow column, as the
 * browser sets it alone and with skiptingar. Each side marks what this
 * layout shows, faults with a red wave and fixes with a yellow band, and
 * names each in its margin at the line it happens on (`HeroFigureSide`). The
 * package's side shows the three layers: hyphenation and typeset, made on
 * the server (the browser lays it out with `hyphens: manual` and ships no
 * JavaScript for either), and CSS `text-balance` on the title and
 * `text-pretty` on the body. The browser's side wraps greedily. No slider: the
 * column is narrow enough that the difference shows at any screen width.
 */
export function HeroDemo() {
  return (
    <section
      aria-label={demo.label}
      className="col-span-full grid gap-x-project gap-y-xl pt-hyhead xl:grid-cols-2"
    >
      <HighlightStyles />
      <HeroFigureSide
        kind="without"
        label={demo.without.label}
        notes={demo.without.notes}
      >
        <p className={cn(TITLE_CLASS, "hyphens-auto text-wrap text-hy-lede")}>
          {demo.title}
        </p>
        <p className={cn(EDITOR_CLASS, "hyphens-auto text-wrap")}>{demo.text}</p>
      </HeroFigureSide>
      <HeroFigureSide
        kind="with"
        known={known}
        label={demo.with.label}
        notes={demo.with.notes}
      >
        <p className={cn(TITLE_CLASS, "hyphens-manual text-balance text-hy-lede")}>
          {title}
        </p>
        <p className={cn(EDITOR_CLASS, "hyphens-manual text-pretty")}>{text}</p>
      </HeroFigureSide>
    </section>
  );
}
