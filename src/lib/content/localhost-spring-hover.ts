/**
 * Copy for /localhost/spring-hover, verbatim from v1's /dev/spring-hover. The
 * non-breaking spaces hold each line on one row, as they did in v1.
 */

export type SpringHoverLine = {
  prefix: string;
  content: string;
};

export const springHoverContent = {
  /** v1's `aria-label` on the section. */
  label: "Interactive spring text effect",
  lines: [
    { prefix: "A", content: "Spring hover effect" },
    { prefix: "B", content: "Interactive text" },
    { prefix: "C", content: "Mouse repulsion" },
    { prefix: "D", content: "Touch supported" },
  ] satisfies SpringHoverLine[],
} as const;
