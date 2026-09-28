/**
 * Renders the hero ball's rest pose to `metal-ball.webp` and its rest-pose
 * shadow to `metal-ball-shadow.webp` — the two static images
 * `metal-ball.tsx` sends from the server and `metal-ball-canvas.tsx` fades
 * over on the first pointer move.
 *
 * Both are line-for-line ports of that component's two fragment shaders, run
 * on the CPU at each canvas's own backing size, so the images and the live
 * renders are the same pixels and the swap between them is invisible. The
 * shaders are the source of truth: after any change to either, mirror the
 * change here and run
 *
 *   bun run generate:ball
 *
 * to regenerate both images together. The shadow no longer comes from a
 * Figma export — it is the shadow shader's own rest pose, the same way the
 * ball image is the ball shader's.
 *
 * Float32 is emulated with `Math.fround` where it changes the result — the
 * grain hash in particular — so the noise pattern matches the GPU's as
 * closely as JavaScript can manage. The shadow shader has no hash of its own
 * at rest (the page multiplies its own grain tile into the mask), so its
 * math runs in plain double precision.
 */

import { join } from "node:path";
import sharp from "sharp";
import {
  BALL_IMAGE_PIXELS,
  CEILING,
  GRAIN_AMPLITUDE,
  HIGHLIGHT,
  REST_LIGHT,
  REST_LIGHT_SIZE,
  REST_SHADOW_STRENGTH,
  SHADOW_GAMMA,
  SHADOW_IMAGE_HEIGHT,
  SHADOW_IMAGE_WIDTH,
  SKY_LIGHT,
  SKY_LIGHT_SIZE,
  SKY_SHADOW_STRENGTH,
  STUDIO,
  TINT,
  type Vec3,
  WALL_Z,
} from "../src/app/components/home/metal-ball-config";

const BALL_OUTPUT = join(import.meta.dir, "../src/app/components/home/metal-ball.webp");
const SHADOW_OUTPUT = join(
  import.meta.dir,
  "../src/app/components/home/metal-ball-shadow.webp"
);

const f = Math.fround;
const fract = (x: number) => x - Math.floor(x);
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const clamp01 = (x: number) => clamp(x, 0, 1);
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

// Hoskins' hash12, as in the shader, in float32.
function hash(x: number, y: number): number {
  let px = f(fract(f(x * 0.1031)));
  let py = f(fract(f(y * 0.1031)));
  let pz = f(fract(f(x * 0.1031)));
  const d = f(f(f(px * f(py + 33.33)) + f(py * f(pz + 33.33))) + f(pz * f(px + 33.33)));
  px = f(px + d);
  py = f(py + d);
  pz = f(pz + d);
  return fract(f(f(px + py) * pz));
}

function normalize(x: number, y: number, z: number): [number, number, number] {
  const len = Math.hypot(x, y, z);
  return [x / len, y / len, z / len];
}

// GGX's normal distribution at roughness a, scaled to peak at 1.
function lobe(nDotH: number, a: number): number {
  const a2 = a * a;
  const d = nDotH * nDotH * (a2 - 1) + 1;
  return (a2 * a2) / (d * d);
}

/** One pixel of the ball shader's `main()`. Returns straight-alpha RGBA in 0–1. */
function shade(u: number, v: number): [number, number, number, number] {
  const size = BALL_IMAGE_PIXELS;
  const d = Math.hypot(u, v);
  const aa = 2 / size;
  if (d > 1 + aa) {
    return [0, 0, 0, 0];
  }

  const z = Math.sqrt(Math.max(1 - d * d, 0));
  // u_roll is (0, 0) at rest, so rolled(n) === n: nr === n.
  const nx = u;
  const ny = v;
  const nz = z;

  const toLightX = REST_LIGHT.x - nx;
  const toLightY = REST_LIGHT.y - ny;
  const toLightZ = REST_LIGHT.z - nz;
  const lightDist = Math.hypot(toLightX, toLightY, toLightZ);
  const lightDirX = toLightX / lightDist;
  const lightDirY = toLightY / lightDist;
  const lightDirZ = toLightZ / lightDist;
  const [hx, hy, hz] = normalize(lightDirX, lightDirY, lightDirZ + 1);

  // The studio is fixed: the floor's glow is a ring offset 0.3 toward the
  // bottom, and the dark ceiling reads the screen's top.
  const body = STUDIO.body;
  const edgeLight = (1 - z) ** STUDIO.edgeFalloff * STUDIO.edge;
  const ringDistance = Math.hypot(nx, ny - STUDIO.floorRingOffset);
  const floorGlow =
    STUDIO.floorGlow *
    smoothstep(STUDIO.floorRingInner, STUDIO.floorRingOuter, ringDistance);

  const nDotH = Math.max(nx * hx + ny * hy + nz * hz, 0);
  const nDotL = nx * lightDirX + ny * lightDirY + nz * lightDirZ;
  const widen = (HIGHLIGHT.widen * REST_LIGHT_SIZE) / (2 * lightDist);
  const core = 1 - smoothstep(HIGHLIGHT.coreFadeStart, HIGHLIGHT.coreFadeEnd, widen);
  let highlight =
    HIGHLIGHT.broadWeight * lobe(nDotH, Math.min(HIGHLIGHT.broad + widen, 1)) +
    HIGHLIGHT.tightWeight * core * lobe(nDotH, Math.min(HIGHLIGHT.tight + widen, 1));
  highlight *= smoothstep(HIGHLIGHT.terminatorFrom, HIGHLIGHT.terminatorTo, nDotL);

  let value = body + edgeLight + floorGlow + highlight;
  value *= 1 - smoothstep(CEILING.start, 1, ny) * CEILING.strength;
  const tint = TINT.shadows * (1 - clamp01(value)) + TINT.base;

  // The shader samples grain at `floor(gl_FragCoord - (roll + grainRoll)
  // * radius) + 0.5`; both rolls are zero at rest, so this is the pixel
  // centre — gl_FragCoord — and the snap is the identity here.
  const grain =
    (hash(
      Math.floor((u + 1) * 0.5 * size) + 0.5,
      Math.floor((v + 1) * 0.5 * size) + 0.5
    ) -
      0.5) *
    GRAIN_AMPLITUDE;
  const edge = 1 - smoothstep(1 - aa, 1 + aa, d);
  return [
    clamp01(value + grain),
    clamp01(value + grain),
    clamp01(value + tint + grain),
    edge,
  ];
}

/**
 * The shadow a spherical light of radius `size` at `light` leaves at the
 * wall point `p`, mirroring `shadowFrom` in `SHADOW_FRAGMENT_SHADER`.
 */
function shadowFrom(p: { x: number; y: number }, light: Vec3, size: number): number {
  const toBallX = -p.x;
  const toBallY = -p.y;
  const toBallZ = WALL_Z;
  const ballDist = Math.hypot(toBallX, toBallY, toBallZ);
  const toLightX = light.x - p.x;
  const toLightY = light.y - p.y;
  const toLightZ = light.z + WALL_Z;
  const lightDist = Math.hypot(toLightX, toLightY, toLightZ);
  const dot = toLightX * toBallX + toLightY * toBallY + toLightZ * toBallZ;
  const theta = Math.acos(clamp(dot / (lightDist * ballDist), -1, 1));
  const alpha = Math.asin(Math.min(1 / ballDist, 1));
  const phi = Math.asin(Math.min(size / lightDist, 1));
  const occlusion = 1 - smoothstep(-phi, phi, theta - alpha);
  const height = light.z + WALL_Z;
  const irradiance = (toLightZ * height * height) / lightDist ** 3;
  return occlusion ** SHADOW_GAMMA * irradiance;
}

/** One pixel of the shadow shader's `main()` at rest: u_ball = 0, u_blend = 0. */
function shadeShadow(p: { x: number; y: number }): number {
  const s =
    SKY_SHADOW_STRENGTH * shadowFrom(p, SKY_LIGHT, SKY_LIGHT_SIZE) +
    REST_SHADOW_STRENGTH * shadowFrom(p, REST_LIGHT, REST_LIGHT_SIZE);
  return clamp01(s);
}

async function renderBall() {
  const size = BALL_IMAGE_PIXELS;
  const pixels = Buffer.alloc(size * size * 4);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      // gl_FragCoord is the pixel centre, measured from the bottom-left.
      const fragX = col + 0.5;
      const fragY = size - row - 0.5;
      const u = (fragX / size) * 2 - 1;
      const v = (fragY / size) * 2 - 1;
      const [r, g, b, a] = shade(u, v);
      const i = (row * size + col) * 4;
      pixels[i] = Math.round(r * 255);
      pixels[i + 1] = Math.round(g * 255);
      pixels[i + 2] = Math.round(b * 255);
      pixels[i + 3] = Math.round(a * 255);
    }
  }
  // Straight to the file: piping the encoded buffer through `sharp()` again
  // would re-encode it at the default quality on the way out.
  const info = await sharp(pixels, { raw: { width: size, height: size, channels: 4 } })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(BALL_OUTPUT);
  console.log(`wrote ${BALL_OUTPUT} (${size}×${size}, ${info.size} bytes)`);
}

async function renderShadow() {
  const width = SHADOW_IMAGE_WIDTH;
  const height = SHADOW_IMAGE_HEIGHT;
  const radius = BALL_IMAGE_PIXELS / 2;
  const centreX = width / 2;
  const centreY = height - radius;
  const pixels = Buffer.alloc(width * height);
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const fragX = col + 0.5;
      const fragY = height - row - 0.5;
      const p = { x: (fragX - centreX) / radius, y: (fragY - centreY) / radius };
      const s = shadeShadow(p);
      pixels[row * width + col] = Math.round(s * 255);
    }
  }
  const info = await sharp(pixels, { raw: { width, height, channels: 1 } })
    .webp({ quality: 80 })
    .toFile(SHADOW_OUTPUT);
  console.log(`wrote ${SHADOW_OUTPUT} (${width}×${height}, ${info.size} bytes)`);
}

async function main() {
  await renderBall();
  await renderShadow();
}

await main();
