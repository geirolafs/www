import type { CSSProperties, ReactNode } from "react";
import { PillText } from "@/app/components/shell/pill-text";
import type { PillStrategyId } from "@/lib/content/localhost-pills";

/** The two superseded strategies, kept for comparison. */
const FIXED_OFFSET = {
  "line-box": "0em",
  fixed: "0.05em",
} as const;

function Text({
  label,
  strategy,
}: {
  label: string;
  strategy: PillStrategyId;
}): ReactNode {
  if (strategy === "case-aware") {
    return <PillText>{label}</PillText>;
  }
  return (
    <span
      className="relative top-[var(--offset)]"
      style={{ "--offset": FIXED_OFFSET[strategy] } as CSSProperties}
    >
      {label}
    </span>
  );
}

/** The section-label pill, with the text offset chosen by `strategy`. */
export function PillSpecimen({
  label,
  strategy,
}: {
  label: string;
  strategy: PillStrategyId;
}) {
  return (
    <span className="inline-block rounded-pill border-[length:var(--pill-border-width)] border-border-strong px-[calc(var(--pill-padding-x)-var(--pill-border-width))] py-[calc(var(--pill-padding-y)-var(--pill-border-width))] font-regular text-foreground text-label">
      <Text label={label} strategy={strategy} />
    </span>
  );
}
