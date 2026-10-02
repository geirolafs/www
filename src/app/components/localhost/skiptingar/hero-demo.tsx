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

const title = processed(demo.title, "heading");
const text = processed(demo.text, "body");

/**
 * What the figure's notes need from the server's text: the joints, and the
 * phrases the typeset rules glued.
 */
const known: Known = {
  joints: demo.joints,
  glued: [title, text].flatMap(output =>
    [...output.replaceAll(SOFT_HYPHEN, "").matchAll(/\S+(?: \S+)+/g)].map(match =>
      match[0].replaceAll(NO_BREAK_SPACE, " ")
    )
  ),
};

function processed(text: string, mode: "body" | "heading"): string {
  const [output = text] = processSegments([text], {
    typeset: PAGE_TYPESET,
    hyphenate: { mode, joints: "prefer" },
  });
  return output;
}

/**
 * The claim in one look, under the lede, drawn as a figure rather than a
 * specimen: the same title and paragraph in the same narrow column, as the
 * browser sets it alone and with skiptingar. Each side marks what this
 * layout shows, faults with a red wave and fixes with a yellow band, and
 * names each in its margin at the line it happens on (`HeroFigureSide`). The
 * package's side is processed on the server and the browser lays it out with
 * `hyphens: manual`, so it ships no JavaScript to hyphenate. No slider: the
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
        <p className={cn(TITLE_CLASS, "hyphens-auto text-balance text-hy-lede")}>
          {demo.title}
        </p>
        <p className={cn(EDITOR_CLASS, "hyphens-auto text-pretty")}>{demo.text}</p>
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
