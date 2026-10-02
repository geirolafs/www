import { cn } from "@/lib/utils";

/**
 * Code inside a sentence: a chip in Geist Mono, in the same greys as the
 * code blocks (`.hy-code` in globals.css). It never breaks inside, since
 * `<CleanCopy />` split over two lines reads as two things. `translate="no"`,
 * so a translator leaves it alone. Not highlighted: the highlighter comes
 * with the page's first code block.
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
