import type {
  AmbientStripeBlend,
  AmbientStripeVariant,
  LanternStepId,
} from "@/lib/content/localhost-ambient-stripe";

/**
 * The Figma frame (www, node 2023:6): a 10px bar in `--gradient-stripe`, and
 * behind it a 516px rect in the same gradient, 480px of it off-canvas, so
 * its right edge sits 36px into the page, under a 70.5 layer blur.
 *
 * The blur is not a `filter` here. A full-page-height, 500px-wide blurred
 * layer is a large texture to rasterise and re-rasterises whenever anything
 * about it changes. The gradient only runs vertically, so blurring it
 * horizontally changes nothing but the falloff at its edge — and that falloff
 * can be drawn exactly as a mask: a blurred half-plane is the normal CDF
 * across its edge. Figma's blur value is about two standard deviations, so
 * sigma is ~35px. The mask then moves with `transform` and `opacity` only.
 */
const EDGE_PX = 36;
const SIGMA_PX = 35;
/** Past this the CDF is under 1%; the mask is transparent from here. */
export const GLOW_WIDTH_PX = 150;

/** Abramowitz–Stegun 7.1.26: good to 1.5e-7, plenty for a mask. */
function erf(x: number) {
  const sign = Math.sign(x);
  const a = Math.abs(x);
  const t = 1 / (1 + 0.327_591_1 * a);
  const y =
    1 -
    ((((1.061_405_429 * t - 1.453_152_027) * t + 1.421_413_741) * t - 0.284_496_736) * t +
      0.254_829_592) *
      t *
      Math.exp(-a * a);
  return sign * y;
}

/** Share of a blurred half-plane's light at `d` px inside its edge. */
function blurredEdge(d: number, sigma: number) {
  return 0.5 * (1 + erf(d / (sigma * Math.SQRT2)));
}

/**
 * Stops per mask. Between stops the mask is a straight line, and each kink
 * where two lines meet is a spot the eye reads as a band; at 48 over 150px
 * the segments are ~3px and the kinks too slight to see. Costs nothing.
 */
const EDGE_STOPS = 48;

/** Mask stops for a blurred edge across `0 → length` px, with the edge at `edge`. */
function edgeStops(length: number, edge: number, sigma: number, direction: 1 | -1) {
  return Array.from({ length: EDGE_STOPS }, (_, i) => {
    const x = (i / (EDGE_STOPS - 1)) * length;
    const a = blurredEdge(direction * (edge - x), sigma);
    return `rgb(0 0 0 / ${a.toFixed(3)}) ${x.toFixed(1)}px`;
  }).join(", ");
}

/**
 * The experiment's gradient: a dusk sky, blue at the top of the page and a
 * soft yellow at the bottom. Interpolated in oklab, so the fades between
 * the stops stay clean rather than greying. See `--gradient-ambient-stops`.
 */
export const GRADIENT = "linear-gradient(180deg in oklab, var(--gradient-ambient-stops))";

/** The glow's horizontal falloff: bright at the page edge, gone by 150px. */
export const GLOW_MASK = `linear-gradient(to right, ${edgeStops(GLOW_WIDTH_PX, EDGE_PX, SIGMA_PX, 1)})`;

/**
 * The edge core, after the two falloffs in the vgpu triangle-led example: a
 * thin band hugging the page edge inside the wide glow, so the edge reads as
 * where the light comes from, without the 10px bar. The same blurred edge as
 * the glow, much tighter. It is multiplied over the glow, so it deepens the
 * glow's own colour at each height rather than painting a new one: pale
 * blue on pale blue goes bluer.
 */
const CORE_EDGE_PX = 4;
const CORE_SIGMA_PX = 5;
/** Past this the core's CDF is under 1%. */
export const CORE_WIDTH_PX = 24;
export const CORE_MASK = `linear-gradient(to right, ${edgeStops(CORE_WIDTH_PX, CORE_EDGE_PX, CORE_SIGMA_PX, 1)})`;

/**
 * Per variant, which of the three motions are on and how much. The
 * gains are the most each one can add at full strength; the page's strength
 * slider multiplies all of them.
 */
type Tuning = {
  /** Breath's amplitude, 1 being the keyframes as written; 0 is off. */
  breath: number;
  /** Scroll: extra glow width (scaleX), extra opacity, and px of trail. */
  wake: { spread: number; lift: number; trail: number } | null;
  /**
   * Cursor, as a magnet: hotspot opacity at full pull, the distance from the
   * left edge at which the pull starts, and how far towards the cursor the
   * glow is drawn out — 1 lets its tip reach the cursor when it is close.
   */
  lantern: { peak: number; reach: number; pull: number } | null;
};

export const VARIANTS: Record<AmbientStripeVariant, Tuning> = {
  still: { breath: 0, wake: null, lantern: null },
  breath: { breath: 1, wake: null, lantern: null },
  wake: { breath: 0, wake: { spread: 0.9, lift: 0.35, trail: 28 }, lantern: null },
  lantern: { breath: 0, wake: null, lantern: { peak: 1, reach: 400, pull: 0.95 } },
  "Breath+wake+lantern": {
    breath: 0.35,
    wake: { spread: 0.55, lift: 0.2, trail: 16 },
    lantern: { peak: 1, reach: 400, pull: 0.85 },
  },
};

/** Resting glow opacity. The Figma layer is at 100%; this is that, a touch under. */
export const GLOW_OPACITY = 0.9;

/**
 * Scroll speed (px/ms) that counts as "full" — a brisk wheel flick. Anything
 * faster is clamped, so a fling does not blow the glow out.
 */
export const WAKE_FULL_SPEED = 3;
/** The glow rises quickly and lets go slowly: time constants in ms. */
export const WAKE_ATTACK_MS = 90;
export const WAKE_RELEASE_MS = 900;

/** Height of the hotspot's soft ellipse. */
export const LANTERN_HEIGHT_PX = 640;
/** Width of the hotspot's box; its ellipse reaches 85% of it. */
export const LANTERN_WIDTH_PX = GLOW_WIDTH_PX * 1.6;
/** How far the ellipse reaches from the edge at rest, before any pull. */
export const LANTERN_REST_TIP_PX = LANTERN_WIDTH_PX * 0.85;

type SpringTuning = { stiffness: number; damping: number };

/**
 * The lantern's tuning, in the steps it went through, so each can be
 * compared on the page. The magnet's springs are stiffness and damping per
 * second, both under critical damping (ζ ≈ 0.6): the glow overshoots a
 * little and settles — the lag and give of something with mass being
 * dragged. The stretch is a little stiffer than the follow, so the glow
 * reaches out before it has fully caught up.
 *
 * `falloff` is how steep the hotspot's Gaussian is. At 4.5 most of the
 * ellipse sits under 20% and the stretch barely shows; at 2.2 it is fuller,
 * ~40% at 60% of the way out. `peak` scales the variant's own peak.
 * `multiply` deepens the glow under the hotspot — blue on blue goes darker,
 * yellow on yellow warmer — where painted normally it is the same colour
 * over the same colour; past the glow's edge the backdrop inside the
 * isolated wrapper is empty, so there it paints as normal.
 */
export type LanternStep = {
  follow: SpringTuning;
  stretch: SpringTuning;
  fadeMs: number;
  falloff: number;
  peak: number;
  multiply: boolean;
};

export const LANTERN_STEPS: Record<LanternStepId, LanternStep> = {
  magnet: {
    follow: { stiffness: 90, damping: 11 },
    stretch: { stiffness: 140, damping: 14 },
    fadeMs: 420,
    falloff: 4.5,
    peak: 0.9,
    multiply: false,
  },
  snappier: {
    follow: { stiffness: 260, damping: 19 },
    stretch: { stiffness: 380, damping: 23 },
    fadeMs: 200,
    falloff: 4.5,
    peak: 0.9,
    multiply: false,
  },
  stronger: {
    follow: { stiffness: 260, damping: 19 },
    stretch: { stiffness: 380, damping: 23 },
    fadeMs: 200,
    falloff: 2.2,
    peak: 1,
    multiply: true,
  },
};

/**
 * The hotspot's mask: a Gaussian ellipse centred on the left edge, so it has
 * no rim. A plain radial gradient with a few stops reads as a disc.
 *
 * The ellipse stops short of the box on every side. Run to the box's edge,
 * the layer's last row and column of pixels can pick up a sliver of colour
 * when it lands on a fractional offset, and show as a 1px line.
 */
export function lanternMask(falloff: number) {
  // Renormalised to hit exactly 0 at the rim; past it the gradient's last
  // stop fills the corners, and anything above 0 there shows the box.
  const edge = Math.exp(-falloff);
  const stops = Array.from({ length: 11 }, (_, i) => {
    const r = i / 10;
    const a = (Math.exp(-r * r * falloff) - edge) / (1 - edge);
    return `rgb(0 0 0 / ${a.toFixed(3)}) ${(r * 100).toFixed(0)}%`;
  });
  return `radial-gradient(85% 44% at 0% 50%, ${stops.join(", ")}, transparent)`;
}

/**
 * How the glow meets what it overlaps, now that it sits over the page.
 *
 * On a white page most blend modes lose the glow: screen, overlay,
 * soft-light and color all leave white as white. Multiply is the one that
 * keeps it exactly: the glow times white is the glow, so the page looks as it
 * did, and over an image it becomes a coloured gel, detail kept. `color`
 * takes the glow's hue and saturation and the backdrop's brightness, so over
 * the pale glow on white it changes next to nothing, and over an image it
 * recolours it at its own brightness: a duotone in the sky's colours. The
 * wash is that, laid over the gel.
 *
 * The blend is set on the outermost layers, the ones at `-z-10`: a blend mode
 * only sees the backdrop inside its own stacking context, and the breath and
 * wake wrappers each make one.
 */
export const BLENDS: Record<
  AmbientStripeBlend,
  { mode: "normal" | "multiply"; wash: boolean }
> = {
  normal: { mode: "normal", wash: false },
  multiply: { mode: "multiply", wash: false },
  wash: { mode: "multiply", wash: true },
};

/** The wash's opacity at full; it fades out with the glow's own mask. */
export const WASH_OPACITY = 0.7;

export const DEFAULT_BACKGROUND = "#ebebe3";

/** A hint, not a wash: at 15% the page only leans towards the stripe. */
export const DEFAULT_TINT = 0.15;

/**
 * Steps across the page's height for the tint. The page colour only changes
 * when the viewport's middle crosses into a new step, so a scroll repaints the
 * background a few hundred times over the whole page, not every frame; at the
 * tint's strength one step moves a channel by well under one level.
 */
export const TINT_STEPS = 400;

/** Every setting the page's panel holds, as a preset can capture it. */
export type AmbientStripeSettings = {
  variant: AmbientStripeVariant;
  lanternStep: LanternStepId;
  strength: number;
  showBar: boolean;
  /** Grain in 8-bit levels; see `grain.ts`. */
  grain: number;
  /** Edge core opacity; 0 is off. See `CORE_MASK`. */
  core: number;
  blend: AmbientStripeBlend;
  /** Page colour, as a hex for the colour input. */
  background: string;
  /** How much of the stripe's colour in view tints the page, 0–1; see `tint.ts`. */
  tint: number;
};

/**
 * The site's stripe: what `SiteStripe` renders on every page. It is preset 1,
 * picked by eye on /localhost/ambient-stripe. Change it there, then here.
 */
export const SITE_STRIPE: AmbientStripeSettings = {
  variant: "Breath+wake+lantern",
  lanternStep: "stronger",
  strength: 0.45,
  showBar: false,
  grain: 3,
  core: 0.65,
  blend: "normal",
  background: "#ffffff",
  tint: 0.06,
};

/**
 * Settings picked by eye on the page and kept. Keys match the ids in
 * `ambientStripeContent.presets`. Preset 1 is the site's stripe.
 */
export const PRESETS: Record<string, AmbientStripeSettings> = {
  "1": SITE_STRIPE,
};
