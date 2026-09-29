/**
 * Copy for /localhost/ambient-stripe: the variant picker's labels, and a line
 * on what each variant is doing so the difference is nameable while testing.
 */

export type AmbientStripeVariant =
  | "still"
  | "breath"
  | "wake"
  | "lantern"
  | "Breath+wake+lantern";

/** The lantern's tuning steps, compared on the page; see `LANTERN_STEPS`. */
export type LanternStepId = "magnet" | "snappier" | "stronger";

type VariantCopy = {
  id: AmbientStripeVariant;
  label: string;
  description: string;
};

export const ambientStripeContent = {
  /** Accessible name for the floating picker. */
  panelLabel: "Ambient stripe variants",
  strengthLabel: "Strength",
  barLabel: "10px bar",
  presetsLabel: "Presets",
  presets: [{ id: "1", label: "Preset 1" }],
  lanternStepLabel: "Lantern step",
  lanternSteps: [
    { id: "magnet", label: "1 Magnet" },
    { id: "snappier", label: "2 Snappier" },
    { id: "stronger", label: "3 Stronger" },
  ] satisfies { id: LanternStepId; label: string }[],
  variants: [
    {
      id: "still",
      label: "Still",
      description: "The Figma frame as drawn: a static glow.",
    },
    {
      id: "breath",
      label: "Breath",
      description: "The glow swells and settles on a slow 10s cycle. No input.",
    },
    {
      id: "wake",
      label: "Wake",
      description:
        "Scrolling stirs the glow; it spreads with speed and trails the direction, then settles.",
    },
    {
      id: "lantern",
      label: "Lantern",
      description:
        "The glow warms at the cursor's height as the cursor nears the left edge.",
    },
    {
      id: "Breath+wake+lantern",
      label: "Breath+wake+lantern",
      description: "Breath, wake and lantern together, each turned down.",
    },
  ] satisfies VariantCopy[],
} as const;
