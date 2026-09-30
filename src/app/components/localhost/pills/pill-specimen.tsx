import type { CSSProperties, ReactNode } from "react";
import { PILL_CLASS } from "@/app/components/shell/pill";
import { PillText } from "@/app/components/shell/pill-text";
import type { PillStrategyId } from "@/lib/content/localhost-pills";
import { cn } from "@/lib/utils";

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
    // Built from `PILL_CLASS` rather than `Pill`, because `Pill` always wraps
    // its children in `PillText` and this lab compares text-offset strategies.
    <span className={cn("inline-block border-border-strong text-foreground", PILL_CLASS)}>
      <Text label={label} strategy={strategy} />
    </span>
  );
}
