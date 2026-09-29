import type { CSSProperties } from "react";

/**
 * v1's `AMBILIGHT_DEFAULTS`, retuned for a white page. v1 screened a 0.3
 * opacity glow onto its dark section theme; `screen` can only lighten, so on
 * white it vanishes entirely. The glow blends normally here instead, and
 * opacity and saturation go up so the colour still reads against white —
 * 0.6 / 1.4, not yet checked by eye. Blur, scale and grain are v1's.
 */
export const AMBILIGHT = {
  blur: 42,
  saturation: 1.4,
  scale: 1.01,
  blendMode: "normal",
  opacity: 0.6,
  noiseOpacity: 0.2,
  /** v1's `MOBILE_MAX_BLUR`: below 768px the blur is capped and the grain skipped. */
  liteBlur: 24,
  /** v1's `ANIMATION.referenceDimension`, which `scale` is reasoned against. */
  referenceDimension: 1000,
} as const;

/** v1's `ANIMATION.targetFps`. */
export const AMBILIGHT_FPS = 24;

/**
 * v1's `CANVAS_DEFAULTS`: the video is copied into a 480 × 270 buffer and the
 * buffer is stretched over the video's box. It is blurred by 42px straight
 * after, so the stretch never shows.
 */
export const AMBILIGHT_CANVAS = { width: 480, height: 270 } as const;

/** The two filter ids for one item: the full one, and the phone one. */
export function ambilightFilterIds(id: string) {
  return { full: `ambilight-${id}`, lite: `ambilight-${id}-lite` };
}

/**
 * v1's `getAmbilightStyle`. The filter is picked by class instead of v1's
 * resize listener — `[filter:var(--ambilight-lite)] md:[filter:…full]` at
 * v1's same 768px break — so the server render is already the right one.
 */
export function ambilightStyle(id: string): CSSProperties {
  const { full, lite } = ambilightFilterIds(id);
  const displayScale =
    AMBILIGHT.scale + (AMBILIGHT.blur * 2) / AMBILIGHT.referenceDimension;

  return {
    "--ambilight-full": `url(#${full})`,
    "--ambilight-lite": `url(#${lite})`,
    transform: `scale(${displayScale})`,
    opacity: AMBILIGHT.opacity,
    mixBlendMode: AMBILIGHT.blendMode,
  } as CSSProperties;
}

/** v1's glow layer: under the media (`z-5` against its `z-10`), filling its box. */
export const AMBILIGHT_LAYER_CLASS =
  "pointer-events-none absolute inset-0 z-5 block size-full object-cover [filter:var(--ambilight-lite)] md:[filter:var(--ambilight-full)]";
