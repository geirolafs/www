/** Copy for /localhost/pills: three ways to centre text in a pill. */

export type PillStrategyId = "line-box" | "fixed" | "case-aware";

export const pillsContent = {
  strategies: [
    {
      id: "line-box",
      title: "Line box",
      note: "No correction. Lowercase centres on its x-height; capitals ride high.",
    },
    {
      id: "fixed",
      title: "Fixed nudge",
      note: "Everything drops 0.05em, as the site did before. Helps lowercase, half-helps capitals.",
    },
    {
      id: "case-aware",
      title: "Case-aware",
      note: "What the site uses: lowercase 0.10em, Sentence case 0.12em, all caps 0.17em.",
    },
  ] satisfies readonly { id: PillStrategyId; title: string; note: string }[],
  casings: [
    { title: "lowercase", labels: ["work", "selected projects", "notes"] },
    { title: "Sentence case", labels: ["Preset 1", "Stilgar", "Breath"] },
    { title: "UPPERCASE", labels: ["NEW", "BETA", "2026"] },
  ],
} as const;
