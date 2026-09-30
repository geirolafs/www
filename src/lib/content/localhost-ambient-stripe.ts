/**
 * Copy for /localhost/ambient-stripe: the settings panel's labels — presets,
 * variants, lantern steps, blends and the sliders — and a line on what each
 * variant and blend is doing, so the difference is nameable while testing.
 */

export type AmbientStripeVariant =
  | "still"
  | "breath"
  | "wake"
  | "lantern"
  | "Breath+wake+lantern";

/** The lantern's tuning steps, compared on the page; see `LANTERN_STEPS`. */
export type LanternStepId = "magnet" | "snappier" | "stronger";

/** How the glow meets the images it overlaps; see `BLENDS` in config. */
export type AmbientStripeBlend = "normal" | "multiply" | "wash";

type VariantCopy = {
  id: AmbientStripeVariant;
  label: string;
  description: string;
};

export const ambientStripeContent = {
  /** Accessible name for the floating picker. */
  panelLabel: "Ambient stripe settings",
  hideLabel: "Hide panel",
  showLabel: "Show panel",
  strengthLabel: "Strength",
  barLabel: "10px bar",
  backgroundLabel: "Background",
  tintLabel: "Stripe tint",
  grainLabel: "Grain",
  coreLabel: "Edge core",
  presetsLabel: "Presets",
  presets: [{ id: "1", label: "Preset 1" }],
  lanternStepLabel: "Lantern step",
  blendLabel: "Blend",
  blends: [
    {
      id: "normal",
      label: "Normal",
      description: "Painted over the images: a haze.",
    },
    {
      id: "multiply",
      label: "Multiply",
      description:
        "A coloured gel over the images; the same glow on white, where multiply changes nothing.",
    },
    {
      id: "wash",
      label: "Multiply + wash",
      description:
        "The gel, then the images take the sky's colour at their own brightness: a dusk duotone that fades with the glow.",
    },
  ] satisfies { id: AmbientStripeBlend; label: string; description: string }[],
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
