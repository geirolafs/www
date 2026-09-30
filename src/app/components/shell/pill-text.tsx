import type { CSSProperties, ReactNode } from "react";

export type PillCasing = "lower" | "sentence" | "upper";

/**
 * Which offset a label needs: no capitals or figures is lowercase; capitals
 * with lowercase is sentence case; capitals or figures alone is upper.
 */
function pillCasing(label: string): PillCasing {
  if (!/[A-Z0-9]/.test(label)) {
    return "lower";
  }
  return /[a-z]/.test(label) ? "sentence" : "upper";
}

type PillTextProps = {
  children: ReactNode;
  /**
   * Set it when the rendered casing differs from the source — a pill with
   * `text-transform: lowercase` is "lower" whatever its text. Otherwise it is
   * read from a string child, falling back to lowercase.
   */
  casing?: PillCasing;
};

/**
 * The text inside any pill, dropped by the offset for its casing
 * (`--pill-offset-*` in `globals.css`) so it reads centred in the outline.
 */
export function PillText({ children, casing }: PillTextProps) {
  const resolved =
    casing ?? (typeof children === "string" ? pillCasing(children) : "lower");
  return (
    <span
      className="pill-nudge"
      style={{ "--pill-offset": `var(--pill-offset-${resolved})` } as CSSProperties}
    >
      {children}
    </span>
  );
}
