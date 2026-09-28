/**
 * After changing anything here, run:
 *
 *   bun run generate:ball
 *
 * Every number that shapes the hero ball and its shadow, in one place.
 * `metal-ball-canvas.tsx` (the live shaders and the loop that drives them)
 * and `scripts/render-metal-ball.ts` (the static images of the same ball and
 * shadow, which are what the page loads with) both read this file, so the
 * two cannot drift apart. After changing anything in the LOOK sections,
 * run `bun run generate:ball` so the still images match the shader again.
 * The MOTION section only matters once a cursor moves and needs no
 * regeneration.
 *
 * One scene, in ball radii, with the ball centred at the origin and z toward
 * the viewer: the page is a wall at z = −`WALL_Z` that the ball rests
 * against, and three spherical lights shine on both. The sky, which never
 * moves; the softbox at rest; and the cursor's lamp, which fades in over
 * the softbox as the cursor takes charge. Every light is the same thing to
 * the ball (a reflection, widened by its size) and to the wall (the ball's
 * soft shadow, its penumbra set by that size).
 */

export type Vec3 = { x: number; y: number; z: number };

// ---------------------------------------------------------------------------
// LIGHTS — the scene. Shape both the ball and the shadow.
// ---------------------------------------------------------------------------

/**
 * Where the softbox rests. The ball's highlight sits under the halfway
 * vector between this and the view, at y ≈ 0.6 on the disc — where the
 * frame's highlight is. The cursor's lamp starts its journey from here, so
 * the length also sets how far the highlight and the shadow travel on the
 * first move.
 */
export const REST_LIGHT: Vec3 = { x: 0, y: 8.35, z: 2.2 };

/**
 * The softbox's radius and the strength of the shadow it casts. Both fitted
 * to the frame's shadow together with the sky below: 1.55 levels RMS against
 * the Figma render outside the disc. The size is what widens the shadow's
 * penumbra as it runs down the page, and softens the highlight at rest.
 */
export const REST_LIGHT_SIZE = 7.56;
export const REST_SHADOW_STRENGTH = 7.6;

/**
 * How much of the softbox stays on once the cursor's lamp is fully in
 * charge, for its reflection in the ball and for the cone it casts alike.
 * A lit room does not go dark when a lamp is picked up: at 1 the lamp would
 * add to an unchanged room and the highlights would pile up; at 0 the ball
 * went dark around the lamp's spot and lost the gradient of its rest pose.
 */
export const SOFTBOX_HOLD = 0.5;

/**
 * The cursor's lamp: this far in front of the ball's centre, this big, and
 * casting a shadow this strong where it lands square on the wall. It sits
 * 1.4 radii off the surface, so over the disc it lights a cap rather than a
 * pinpoint; it is small, so its reflection tightens to a hot core and its
 * shadow keeps a crisp edge close to the ball.
 */
export const CURSOR_LIGHT_Z = 2.4;
export const CURSOR_LIGHT_SIZE = 0.6;
export const CURSOR_SHADOW_STRENGTH = 0.4;

/**
 * The sky: a large light nearly overhead, fixed. It casts the contact shadow
 * directly under the ball, which is what gives the ball weight and stays put
 * whatever the cursor does. The fit wanted it further up the page — that
 * split the frame's cone between the two lights and read as a leftover cone
 * once the cursor took over — so it is held within 3 radii of overhead,
 * which costs 0.2 levels RMS against the frame and leaves the cone to the
 * softbox alone.
 */
export const SKY_LIGHT: Vec3 = { x: 0, y: 3, z: 4.16 };
export const SKY_LIGHT_SIZE = 2.91;
export const SKY_SHADOW_STRENGTH = 0.404;

// ---------------------------------------------------------------------------
// BALL LOOK — the metal. Regenerate after changes.
// ---------------------------------------------------------------------------

/**
 * The studio the ball reflects, fixed to the screen. Every number was fitted
 * to the Figma render, sampled along the disc's axes and two rows.
 *
 * - `body`: the dark room the whole body reflects, as a flat value (0–1).
 * - `edge` / `edgeFalloff`: the thin Fresnel brightening at the silhouette,
 *   `edge × (1 − z)^edgeFalloff`; a higher falloff keeps it thinner.
 * - `floorGlow`: the white inset glow along the floor edge, as a ring —
 *   thick at the bottom, thin at the sides, gone at the top — drawn where
 *   the distance from a circle shifted `floorRingOffset` radii toward the
 *   bottom runs from `floorRingInner` to `floorRingOuter`.
 */
export const STUDIO = {
  body: 0.27,
  edge: 0.15,
  edgeFalloff: 2.2,
  floorGlow: 0.42,
  floorRingOffset: 0.3,
  floorRingInner: 0.72,
  floorRingOuter: 1.36,
};

/**
 * The highlight: a light's reflection in a slightly rough metal, as two GGX
 * lobes about the halfway vector — a broad sheen and a tight core — each
 * widened by the light's angular size (`widen` × radius ÷ 2 × distance,
 * after Karis). Each lobe peaks at 1, so the weights are the peaks. The
 * base roughness is low and the widening strong, so the two lamps land far
 * apart: the softbox at rest (widened by about 0.33) is the frame's soft
 * patch at roughness 0.68, and the cursor's lamp (widened by about 0.08) is
 * a compact spot at 0.43 with a short tail, which sits on the studio
 * instead of lifting the whole lit side into flat grey. The core is the
 * lamp's own image in the metal and belongs to a small lamp: it fades out
 * between the two `coreFade` widenings, so the softbox shows only the
 * sheen — body plus sheen is 0.97, where the frame's highlight centre is —
 * and the cursor's lamp shows the core on top, just past white. Only the
 * lit hemisphere shows a reflection: it fades out between `terminatorFrom`
 * and `terminatorTo` in the cosine between normal and light, and at rest
 * that fade is the dark band across the equator.
 */
export const HIGHLIGHT = {
  broad: 0.35,
  broadWeight: 0.7,
  tight: 4.1,
  tightWeight: 0.1,
  widen: 0.7,
  coreFadeStart: 0.12,
  coreFadeEnd: 8.25,
  terminatorFrom: -0.15,
  terminatorTo: 0.25,
};

/**
 * The dark line along the top edge, where the ball reflects what is behind
 * and above it. `start` is how far up the disc it begins (in radii from the
 * centre, so 0.8 is the top fifth) and `strength` how dark the very top
 * gets (1 would be black).
 */
export const CEILING = { start: 0.8, strength: 0.15 };

/**
 * The render is neutral with a blue cast that lives in the shadows: blue is
 * lifted by `base` everywhere and by a further `shadows` where the value is
 * 0, fading to nothing where it is 1.
 */
export const TINT = { shadows: 0.04, base: 0.012 };

/**
 * Peak-to-peak grain on the ball, in units of colour (0–1). The Figma render
 * carries a noise fill at about this strength; it is also what keeps the
 * ball's smooth gradients from banding.
 */
export const GRAIN_AMPLITUDE = 0.09;

// ---------------------------------------------------------------------------
// SHADOW LOOK — the page. Regenerate after changes.
// ---------------------------------------------------------------------------

/**
 * Quick switch for the shadow as a whole: the static mask and the live
 * shadow canvas both read it. Off, the ball floats on a clean page. A
 * runtime switch only: the render script always writes the real mask, so
 * flipping this never needs regeneration and never empties the image.
 */
export const SHADOWS_ENABLED = false;

/**
 * Master fader on the whole shadow, 0–1, on top of the per-light strengths
 * above. Applied to the static mask as CSS opacity and to the live shadow
 * in the shader, so the two agree and nothing needs regenerating. Not baked
 * into the mask image: the render script ignores it on purpose.
 */
export const SHADOW_OPACITY = 0.5;

/**
 * The shadow's colour, as any CSS colour (`"#1a1a2e"`, `"oklch(...)"`), or
 * `null` to use the page's `foreground` token. The live shadow reads the
 * colour back from the static mask's layer, so setting it here changes both.
 * sRGB colours only: the readback keeps the `rgb()` channels and drops any
 * alpha, so a translucent or wide-gamut colour would show on the mask alone.
 * Use `SHADOW_OPACITY` for translucency.
 */
export const SHADOW_COLOUR: string | null = null;

/** The ball touches the wall: its centre is one radius in front of it. */
export const WALL_Z = 1;

/**
 * Contrast of a shadow's penumbra. 1 is the geometric overlap; the frame's
 * penumbrae fall off a little faster than that.
 */
export const SHADOW_GAMMA = 1.31;

/**
 * The shadow's grain is multiplicative: each pixel's shadow is scaled by a
 * value between this and 1. That is `metal-ball-grain.png` — the 128px tile
 * the static mask is multiplied with — reproduced in the live shadow, so the
 * two carry the same film grain and the swap between them shows nothing.
 * Changing it here changes the live shadow only; the tile is a file.
 */
export const SHADOW_GRAIN_MIN = 0.86;

// ---------------------------------------------------------------------------
// MOTION — how the ball answers the cursor. No regeneration needed.
// ---------------------------------------------------------------------------

/**
 * How far the ball leans toward the cursor: `perPx` of the cursor's distance
 * from the ball's resting centre, capped at `maxPx`. Small on purpose — the
 * cap is reached about 340px out, and past that the ball holds its lean
 * while only the highlight keeps tracking. `rollGain` is how far the surface
 * rolls per pixel of lean, as a multiple of what a ball rolling on a floor
 * would turn (1 = one radian per radius of travel): at the 12px cap 2.5 is
 * about 15°, enough to see the grain and the reflection move, not enough to
 * look like a spin.
 */
export const LEAN = { perPx: 0.035, maxPx: 12, rollGain: 2.5 };

/**
 * Grabbing the ball. A pointer that lands on the disc drags it, on top of
 * the lean. The shell follows the pointer through a rubber band: a pull of
 * `d` px moves the ball `d × max ÷ (d + max)`, where `max` is `maxRadii`
 * radii — nearly 1:1 for a short pull, never past the cap. `follow` is the
 * per-frame fraction the ball closes on the finger while held. Let go, it
 * springs back at `stiffness` (per second², in px) with `damping` as a
 * ratio of critical: 1 glides home without crossing rest, 0.6 crosses it
 * once and settles. `rollGain` is the surface's roll per radius of drag; 1
 * is a ball rolling on a floor. Unlike the lean's roll it turns the grain
 * only: the lamp is the finger, and a chrome ball's reflection does not
 * turn with the ball, so the highlight stays under the grab point.
 */
export const DRAG = {
  maxRadii: 1.2,
  follow: 0.35,
  stiffness: 180,
  damping: 0.6,
  rollGain: 1,
};

/**
 * The chase. As the page scrolls the ball tries to stay in view: it moves
 * down the page against the scroll, and cannot keep it up. The first pixels
 * of scroll carry it `follow` of a pixel each; the grip then gives out along
 * `max × (1 − e^(−s ÷ max))`, `max` being `maxRadii` radii, so it is never
 * carried further than that and the last of it slips slowly. The ball
 * closes on that target `lerp` of the way each frame — low enough to lag a
 * flick of the wheel, so the page pulls it up first and it strains back
 * down after, which is the trying. Small on purpose: at 234 and `maxRadii`
 * 0.6 it leaves the viewport about 60px of scroll later than it would
 * have — a hesitation, not a ride. Scrolled back, the same curve returns it
 * to rest.
 */
export const CHASE = {
  follow: 0.3,
  maxRadii: 0.6,
  lerp: 0.12,
};

/** The curve the influence ramp is eased through before it scales the targets. */
export type Ease =
  | "linear"
  | "smoothstep"
  | "easeOutCubic"
  | "easeInOutCubic"
  | "easeInOutQuint";

/**
 * Timing.
 *
 * - `lerp`: the per-frame fraction each channel moves toward its target
 *   (0.1 settles in about 150ms at 60fps). `light` drives the lamp's
 *   position and size, `blend` the softbox-to-lamp crossfade, `lean` the
 *   shell's offset. A lower `lean` than `light` lets the body lag the
 *   highlight, which reads as mass.
 * - `influenceInMs` / `influenceOutMs`: how long the ball takes to go from
 *   ignoring the cursor to following it, and how long to let go. A scalar
 *   ramps over these and is eased through `ease` before it scales the
 *   targets away from rest, so the first move after load glides the
 *   highlight out of the rest pose instead of snapping it to the hand.
 *   900 is the stripe's reveal, the one other long duration on the page.
 * - `ease`: the ramp's curve. `smoothstep` is symmetric; `easeOutCubic`
 *   commits early and drifts in; the `easeInOut*` pair hold rest longer.
 * - `restDelayMs`: how long after the pointer leaves the window, or the tab
 *   hides, before the ramp down begins. 0 starts it at once; a few hundred
 *   ms stops a cursor grazing the window edge from resetting the pose.
 * - `maxLightOffset` caps the cursor's offset from the ball's centre, in
 *   radii; beyond it the highlight has all but stopped moving and the
 *   shadow is faint, so the cap only keeps the numbers sane.
 */
export const MOTION = {
  lerp: { light: 0.1, blend: 0.1, lean: 0.1 },
  influenceInMs: 400,
  influenceOutMs: 600,
  ease: "smoothstep" as Ease,
  restDelayMs: 0,
  maxLightOffset: 6,
};

/**
 * A slow wander of the lamp around wherever the cursor has put it, so a
 * parked cursor still leaves the highlight and the shadow breathing. A
 * Lissajous figure `amplitude` radii across (the two axes run at `periodMs`
 * and 0.7 × that, so it never closes into a circle), scaled by the influence
 * so it is gone at rest. On, the render loop keeps running for as long as
 * the cursor is in charge; off, a parked cursor costs nothing.
 */
export const IDLE = { enabled: true, amplitude: 0.25, periodMs: 3000 };

// ---------------------------------------------------------------------------
// IMAGES — the static renders' pixel sizes. Not for tuning.
// ---------------------------------------------------------------------------

/**
 * Device pixels across the static ball image: the 234.18px frame at 2×,
 * which is exactly the canvas's backing store on a retina display, so the
 * swap from image to shader is pixel-for-pixel.
 */
export const BALL_IMAGE_PIXELS = 468;

/**
 * The static shadow mask: the frame's 1299 × 1008 render box at 2×, with the
 * ball's disc centred on the width and tangent to the top edge, so its
 * radius in these pixels is `BALL_IMAGE_PIXELS / 2`.
 */
export const SHADOW_IMAGE_WIDTH = 2598;
export const SHADOW_IMAGE_HEIGHT = 2016;
