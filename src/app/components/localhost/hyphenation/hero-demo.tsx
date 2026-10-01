import type { ReactNode } from "react";
import { PAGE_TYPESET } from "@/app/components/localhost/hyphenation/settings";
import {
  EDITOR_CLASS,
  LABEL_CLASS,
  TITLE_CLASS,
} from "@/app/components/localhost/hyphenation/styles";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";
import { processSegments } from "@/packages/skiptingar/src";
import { SettledText } from "@/packages/skiptingar/src/client";

const { demo } = localhostHyphenationContent.hero;

/** The column both sides share: narrow enough that the long words must break. */
const COLUMN = "w-[17.5rem] max-w-full border border-border border-dashed p-sm";

function processed(text: string, mode: "body" | "heading"): string {
  const [output = text] = processSegments([text], {
    typeset: PAGE_TYPESET,
    hyphenate: { mode },
  });
  return output;
}

function Side({
  label,
  caption,
  children,
}: {
  label: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    // Clipped at its own edge: a word that runs out of the column without the
    // package shows past the dashed line, but never widens the page.
    <figure className="flex min-w-0 flex-col gap-xs overflow-x-clip">
      <figcaption className="flex flex-wrap items-baseline gap-x-xs">
        <span className={LABEL_CLASS}>{label}</span>
        <span className="font-book text-hy-note text-muted">{caption}</span>
      </figcaption>
      <div className={cn(COLUMN, "flex flex-col gap-sm")} lang="is">
        {children}
      </div>
    </figure>
  );
}

/**
 * The claim in one look, under the lede: the editor's first title and
 * paragraph in one narrow column, as the browser sets it alone and with
 * skiptingar. The package's side is processed on the server and settled in
 * the browser (`SettledText`), the title balanced. No slider: the column is
 * narrow enough that the difference shows at any screen width.
 */
export function HeroDemo() {
  return (
    <section
      aria-label={demo.label}
      className="col-span-full flex flex-wrap gap-xl pt-xl"
    >
      <Side caption={demo.without.caption} label={demo.without.label}>
        <p className={cn(TITLE_CLASS, "hyphens-auto text-balance text-hy-lede")}>
          {demo.title}
        </p>
        <p className={cn(EDITOR_CLASS, "hyphens-auto text-pretty")}>{demo.text}</p>
      </Side>
      <Side caption={demo.with.caption} label={demo.with.label}>
        <SettledText
          className={cn(TITLE_CLASS, "hyphens-manual text-hy-lede")}
          options={{ balance: true, overhang: 0.5 }}
          text={processed(demo.title, "heading")}
        />
        <SettledText
          className={cn(EDITOR_CLASS, "hyphens-manual")}
          options={{ overhang: 0.5 }}
          text={processed(demo.text, "body")}
        />
      </Side>
    </section>
  );
}
