import { highlight } from "sugar-high";
import { CopyCode } from "@/app/components/localhost/fluid-typography/copy-code";
import { LABEL_CLASS } from "@/app/components/localhost/fluid-typography/styles";
import { cn } from "@/lib/utils";

/**
 * Code inside a sentence: a chip in Geist Mono, in the same greys as the
 * code blocks (`.hy-code` in globals.css). It never breaks inside, since
 * `<CleanCopy />` split over two lines reads as two things. `translate="no"`,
 * so a translator leaves it alone. Not highlighted: only `CodeBlock` carries
 * the highlighter.
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
      translate="no"
    >
      {children}
    </code>
  );
}

/**
 * A block of code with a caption and a copy button, light and in greys.
 * Highlighted on the server, so it ships no highlighter. This file has no
 * `"use client"` on purpose: render `CodeBlock` from server components only,
 * or sugar-high lands in the client bundle.
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
