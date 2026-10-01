import { highlight } from "sugar-high";
import { CopyCode } from "@/app/components/localhost/hyphenation/copy-code";
import { LABEL_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { cn } from "@/lib/utils";

/** `property: value`, as in `text-wrap: pretty`: sugar-high reads CSS as JS. */
const CSS_DECLARATION = /^([a-z-]+)(:\s*)([^;"'<>(){}]+)(;?)$/;

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, character => ESCAPES[character] ?? character);
}

/** A span in sugar-high's own form, so a CSS token takes the same colours. */
function token(text: string, kind: "property" | "sign" | "class"): string {
  return `<span class="sh__token--${kind}" style="color: var(--sh-${kind})">${escapeHtml(text)}</span>`;
}

/**
 * Highlighted HTML for a short piece of code. A CSS declaration is split by
 * hand into property, sign and value; anything else (JS, JSX, a call) goes
 * through sugar-high. Both write the `--sh-*` colours from `typography.css`,
 * the blog's palette, so inline code and code blocks match.
 */
function highlightCode(code: string): string {
  const css = CSS_DECLARATION.exec(code);
  if (css) {
    const [, property = "", colon = "", value = "", semicolon = ""] = css;
    return (
      token(property, "property") +
      token(colon, "sign") +
      token(value, "class") +
      (semicolon ? token(semicolon, "sign") : "")
    );
  }
  return highlight(code);
}

/**
 * Code inside a sentence: a chip in Geist Mono, in the same
 * greys as the code blocks (`.hy-code` in globals.css). It never breaks
 * inside, since `<CleanCopy />` split over two lines reads as two things.
 * `translate="no"`, so a translator leaves it alone.
 */
export function InlineCode({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <code
      className={cn("hy-code hy-inline-code whitespace-nowrap", className)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: the HTML is escaped here or by sugar-high, from the page's own copy.
      dangerouslySetInnerHTML={{ __html: highlightCode(children) }}
      translate="no"
    />
  );
}

/**
 * A block of code with a caption and a copy button, light and in greys.
 * Highlighted on the server, so it ships no highlighter.
 */
export function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <figure className="hy-code flex min-w-0 flex-col overflow-hidden">
      <figcaption className="flex min-h-10 items-center justify-between gap-sm py-2xs pr-2xs pl-sm">
        {/* The caption takes the code's quietest grey, not the page's muted. */}
        <span className={cn(LABEL_CLASS, "text-(--sh-sign)")}>{label}</span>
        <CopyCode code={code} />
      </figcaption>
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex: a scrolling code block needs focus so the keyboard can scroll it. */}
      <pre className="overflow-x-auto px-sm pb-sm font-hy-mono text-meta" tabIndex={0}>
        <code
          // biome-ignore lint/security/noDangerouslySetInnerHtml: sugar-high escapes the code, which is the page's own copy.
          dangerouslySetInnerHTML={{ __html: highlight(code) }}
          translate="no"
        />
      </pre>
    </figure>
  );
}
