"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  BALL_IMAGE_PIXELS,
  CEILING,
  CHASE,
  CURSOR_LIGHT_SIZE,
  CURSOR_LIGHT_Z,
  CURSOR_SHADOW_STRENGTH,
  DRAG,
  type Ease,
  GRAIN_AMPLITUDE,
  HIGHLIGHT,
  IDLE,
  LEAN,
  MOTION,
  REST_LIGHT,
  REST_LIGHT_SIZE,
  REST_SHADOW_STRENGTH,
  SHADOW_COLOUR,
  SHADOW_GAMMA,
  SHADOW_GRAIN_MIN,
  SHADOW_OPACITY,
  SHADOWS_ENABLED,
  SKY_LIGHT,
  SKY_LIGHT_SIZE,
  SKY_SHADOW_STRENGTH,
  SOFTBOX_HOLD,
  STUDIO,
  TINT,
  type Vec3,
  WALL_Z,
} from "@/app/components/home/metal-ball-config";
import { useLiveReducedMotion } from "@/lib/hooks/use-live-reduced-motion";
import { cn } from "@/lib/utils";
import ball from "./metal-ball.webp";
import grain from "./metal-ball-grain.png";
import shadowMask from "./metal-ball-shadow.webp";

/**
 * Static shader renders until the first pointer input. The live ball supports
 * a cursor lamp, lean, drag and scroll chase; tuning lives in metal-ball-config.
 * Reduced motion or WebGL failure keeps the images. Resize rebuilds the surfaces.
 *
 * Shadow masks avoid becoming LCP candidates; their lossless grain tile avoids
 * banding. The ball image is preloaded because it can be LCP. Both rest poses
 * are mirrored in scripts/render-metal-ball.ts: regenerate after shader edits.
 */

// The tuning numbers live in `metal-ball-config.ts`; these are the loop's
// names for them.
const MAX_LIGHT_OFFSET = MOTION.maxLightOffset;
const LIGHT_LERP = MOTION.lerp.light;
const BLEND_LERP = MOTION.lerp.blend;
const LEAN_LERP = MOTION.lerp.lean;
const INFLUENCE_IN_MS = MOTION.influenceInMs;
const INFLUENCE_OUT_MS = MOTION.influenceOutMs;
const REST_DELAY_MS = MOTION.restDelayMs;
const PULL_PER_PX = LEAN.perPx;
const PULL_MAX_PX = LEAN.maxPx;
const ROLL_GAIN = LEAN.rollGain;

const EASES: Record<Ease, (t: number) => number> = {
  linear: t => t,
  smoothstep: t => t * t * (3 - 2 * t),
  easeOutCubic: t => 1 - (1 - t) ** 3,
  easeInOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  easeInOutQuint: t => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2),
};
const ease = EASES[MOTION.ease];

/**
 * The longest single frame the influence ramp will step by. A tab that was
 * throttled or a main thread that stalled resumes the ramp from where it
 * was rather than jumping to its end.
 */
const MAX_FRAME_MS = 50;

/** Below this squared distance, in px, the shell is considered settled. */
const PULL_SETTLE_EPSILON_SQ = 0.0004;
const PULL_SETTLE_EPSILON = Math.sqrt(PULL_SETTLE_EPSILON_SQ);

/** Below this squared distance the lamp is considered settled and the loop stops. */
const SETTLE_EPSILON_SQ = 1e-6;

/**
 * Retina is plenty; 3× only costs fill rate on a 234px disc. At 2× the
 * backing store is `BALL_IMAGE_PIXELS` square — the same pixels as the
 * static image, which is why the swap between them is invisible.
 */
const MAX_DPR = 2;

/**
 * The ball's CSS width at which the 2× backing store is the static image's
 * own pixels. Below `lg` the ball is fluid — see `--spacing-ball` in
 * `globals.css` — and the canvas takes the measured width instead.
 */
const FIXED_BALL_WIDTH = BALL_IMAGE_PIXELS / MAX_DPR;

/** A number as a GLSL float literal: always with a decimal point. */
const glsl = (n: number) => n.toFixed(4);

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Hoskins' hash12: no visible structure, unlike the sin-based one-liner.
const HASH_GLSL = `
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
`;

const BALL_FRAGMENT_SHADER = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_resolution;
// The lamp: a sphere of radius u_lightSize at u_light, in ball radii from
// the ball's centre — and how far the cursor is in charge of it: at 0 the
// lamp is the softbox at rest, at 1 it is the cursor's, and the softbox
// has dimmed to its hold.
uniform vec3 u_light;
uniform float u_lightSize;
uniform float u_blend;

const vec3 REST = vec3(${glsl(REST_LIGHT.x)}, ${glsl(REST_LIGHT.y)}, ${glsl(REST_LIGHT.z)});
const float REST_SIZE = ${glsl(REST_LIGHT_SIZE)};
// The roll, as an axis-angle in the disc plane: direction is the direction
// the surface is rolling toward, length is the angle in radians. The
// highlight and the grain both read it — the lean's stylised roll.
uniform vec2 u_roll;
// A further roll the grain alone shows: the drag's. A chrome ball's
// reflection does not turn with the ball, and under a drag the lamp is
// the finger, so the highlight has to stay put while the surface rolls.
uniform vec2 u_grainRoll;

const float PI = 3.14159265;
${HASH_GLSL}
// Rodrigues' rotation of a normal about the in-plane axis perpendicular to
// the roll direction, so the point facing the viewer moves toward the cursor.
vec3 rolled(vec3 n, vec2 roll) {
  float angle = length(roll);
  if (angle < 0.0001) {
    return n;
  }
  vec3 axis = vec3(-roll.y, roll.x, 0.0) / angle;
  float c = cos(angle);
  float s = sin(angle);
  return n * c + cross(axis, n) * s + axis * dot(axis, n) * (1.0 - c);
}

// GGX's normal distribution at roughness a, scaled to peak at 1: the lobe's
// shape, with its brightness left to the weights below. Unscaled, a far
// lamp — which widens the lobe less — would peak brighter than the softbox
// and blow out a patch of the ball, when what should change is the size.
float lobe(float nDotH, float a) {
  float a2 = a * a;
  float d = nDotH * nDotH * (a2 - 1.0) + 1.0;
  return a2 * a2 / (d * d);
}

// A light's reflection in a slightly rough metal, at the surface point n
// with the rolled normal nr. The light is a sphere of the given radius at a
// point in space, so every pixel sees it from its own direction: close, it
// lights a cap of the ball and its reflection tightens; far, it softens.
// Two GGX lobes about the halfway vector, a broad sheen and a tight core,
// each widened by the light's angular size (Karis), so the big softbox
// reads as a soft patch and the small lamp as a compact spot that sits on
// the studio instead of washing it out. Only the lit hemisphere shows it,
// with a soft terminator — at rest that terminator is the dark band across
// the equator. The core is the light's own image in the metal, so it
// belongs to a small lamp: it fades out as the angular size grows, and the
// softbox shows only the sheen.
float reflection(vec3 n, vec3 nr, vec3 light, float size) {
  vec3 toLight = light - n;
  float lightDist = length(toLight);
  vec3 lightDir = toLight / lightDist;
  vec3 halfway = normalize(lightDir + vec3(0.0, 0.0, 1.0));
  float nDotH = max(dot(nr, halfway), 0.0);
  float nDotL = dot(nr, lightDir);
  float widen = ${glsl(HIGHLIGHT.widen)} * size / (2.0 * lightDist);
  float core = 1.0 - smoothstep(${glsl(HIGHLIGHT.coreFadeStart)}, ${glsl(HIGHLIGHT.coreFadeEnd)}, widen);
  float highlight =
    ${glsl(HIGHLIGHT.broadWeight)} * lobe(nDotH, min(${glsl(HIGHLIGHT.broad)} + widen, 1.0)) +
    ${glsl(HIGHLIGHT.tightWeight)} * core * lobe(nDotH, min(${glsl(HIGHLIGHT.tight)} + widen, 1.0));
  return highlight * smoothstep(${glsl(HIGHLIGHT.terminatorFrom)}, ${glsl(HIGHLIGHT.terminatorTo)}, nDotL);
}

void main() {
  vec2 p = v_uv;
  float d = length(p);
  float aa = 2.0 / u_resolution.x;
  if (d > 1.0 + aa) {
    discard;
  }

  float z = sqrt(max(1.0 - d * d, 0.0));
  vec3 n = vec3(p, z);
  // The geometry stays a sphere — the edge, the floor ring and the dark cap
  // read the true normal — but the surface rolls: the highlight and the
  // grain read the rotated one, so the reflection and the texture slide
  // toward the cursor inside a silhouette that does not.
  vec3 nr = rolled(n, u_roll);

  // The studio does not move. The dark room the body reflects, the floor's
  // glow along the bottom edge and the dark ceiling at the top are the
  // room the ball sits in, and a lamp carried around a chrome ball moves
  // its own reflection across that room, not the room. Every number below
  // was fitted to the Figma render, sampled along the disc's axes and two
  // rows: a dark room (the body), a thin Fresnel edge, the frame's white
  // inset glow as a ring offset toward the floor — thick at the bottom,
  // thin at the sides, gone at the top — and a dark line where the top
  // edge reflects what is behind the ball.
  float body = ${glsl(STUDIO.body)};
  float edgeLight = pow(1.0 - z, ${glsl(STUDIO.edgeFalloff)}) * ${glsl(STUDIO.edge)};
  float ringDistance = length(n.xy - vec2(0.0, ${glsl(STUDIO.floorRingOffset)}));
  float floorGlow = ${glsl(STUDIO.floorGlow)} * smoothstep(${glsl(STUDIO.floorRingInner)}, ${glsl(STUDIO.floorRingOuter)}, ringDistance);

  // Two lights. The softbox is the room's and stays on: it dims to its hold
  // as the cursor takes charge, so the ball keeps the soft gradient of its
  // rest pose under the lamp instead of going dark around a spot. The lamp
  // fades in over it as it travels from the softbox's place to the
  // cursor's. At rest the lamp is the softbox and the blend is 0, so this
  // is the softbox alone.
  float softbox = reflection(n, nr, REST, REST_SIZE);
  float lamp = reflection(n, nr, u_light, u_lightSize);
  float highlight =
    mix(1.0, ${glsl(SOFTBOX_HOLD)}, u_blend) * softbox + u_blend * lamp;

  float value = body + edgeLight + floorGlow + highlight;
  // The top edge reflects what is behind and above the ball, which is dark.
  value *= 1.0 - smoothstep(${glsl(CEILING.start)}, 1.0, n.y) * ${glsl(CEILING.strength)};

  // The render is neutral with a blue cast that lives in the shadows.
  float tint = ${glsl(TINT.shadows)} * (1.0 - clamp(value, 0.0, 1.0)) + ${glsl(TINT.base)};
  vec3 colour = vec3(value, value, value + tint);
  // Grain slides with the roll, in screen space and snapped to the texel
  // grid. The hash is white noise, so sampling it at a coordinate that
  // moves continuously would draw a fresh pattern every frame and the eye
  // would average it away — the grain vanished whenever the ball moved.
  // Snapped, the same texels move across the disc, as a texture would.
  // It slides as one sheet rather than following the rolled normal, which
  // near the rim maps a run of pixels onto one texel and streaks. The
  // shift is what the roll moves the point facing the viewer by: the
  // angle, in radii, times the radius in pixels. At rest it is
  // gl_FragCoord, on the pixel centre exactly, which is what
  // scripts/render-metal-ball.ts reproduces.
  vec2 grainAt = floor(gl_FragCoord.xy - (u_roll + u_grainRoll) * 0.5 * u_resolution) + 0.5;
  colour += (hash(grainAt) - 0.5) * ${glsl(GRAIN_AMPLITUDE)};

  float edge = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, d);
  gl_FragColor = vec4(colour * edge, edge);
}
`;

const SHADOW_FRAGMENT_SHADER = `
precision highp float;
// The ball's resting centre in backing pixels from the bottom-left, and its
// radius in the same pixels.
uniform vec2 u_centre;
uniform float u_radius;
// The lean, in radii, y up.
uniform vec2 u_ball;
// The lamp, in radii from the resting centre, and how far the cursor has
// taken charge of it: at 0 the rest cone alone, at 1 the lamp's shadow over
// the cone dimmed to the softbox's hold.
uniform vec3 u_light;
uniform float u_blend;
// The page's foreground colour, 0–1.
uniform vec3 u_colour;

const float WALL_Z = ${glsl(WALL_Z)};
const vec3 SKY = vec3(${glsl(SKY_LIGHT.x)}, ${glsl(SKY_LIGHT.y)}, ${glsl(SKY_LIGHT.z)});
const vec3 REST = vec3(${glsl(REST_LIGHT.x)}, ${glsl(REST_LIGHT.y)}, ${glsl(REST_LIGHT.z)});
${HASH_GLSL}
// The shadow a spherical light of radius \`size\` at \`light\` leaves at the
// wall point \`p\`: how much of the light the ball hides from that point,
// times the light's irradiance there relative to its brightest possible.
// The ball is the unit sphere at the origin and the wall is z = -WALL_Z;
// \`p\` and \`light\` are relative to the ball's centre, in radii. The
// occlusion is the overlap of two discs on the wall point's sky — the
// ball's and the light's — so a big light gives a wide penumbra and a small
// one a crisp edge, both growing with distance from the ball.
float shadowFrom(vec2 p, vec3 light, float size) {
  vec3 toBall = vec3(-p, WALL_Z);
  float ballDist = length(toBall);
  vec3 toLight = vec3(light.xy - p, light.z + WALL_Z);
  float lightDist = length(toLight);
  float theta = acos(clamp(dot(toLight, toBall) / (lightDist * ballDist), -1.0, 1.0));
  float alpha = asin(min(1.0 / ballDist, 1.0));
  float phi = asin(min(size / lightDist, 1.0));
  float occlusion = 1.0 - smoothstep(-phi, phi, theta - alpha);
  float height = light.z + WALL_Z;
  float irradiance = toLight.z * height * height / (lightDist * lightDist * lightDist);
  return pow(occlusion, ${glsl(SHADOW_GAMMA)}) * irradiance;
}

void main() {
  // Everything relative to where the ball actually is: the lights stay put
  // on the page while the ball leans, so they move the other way.
  vec2 p = (gl_FragCoord.xy - u_centre) / u_radius - u_ball;
  vec3 lean = vec3(u_ball, 0.0);
  float s = ${glsl(SKY_SHADOW_STRENGTH)} * shadowFrom(p, SKY - lean, ${glsl(SKY_LIGHT_SIZE)})
    + mix(1.0, ${glsl(SOFTBOX_HOLD)}, u_blend) * ${glsl(REST_SHADOW_STRENGTH)} * shadowFrom(p, REST - lean, ${glsl(REST_LIGHT_SIZE)})
    + u_blend * ${glsl(CURSOR_SHADOW_STRENGTH)} * shadowFrom(p, u_light - lean, ${glsl(CURSOR_LIGHT_SIZE)});
  s = clamp(s, 0.0, 1.0) * ${glsl(SHADOWS_ENABLED ? SHADOW_OPACITY : 0)};
  // The mask's grain tile, by the same hash: multiplicative, so it is film
  // grain that lives in the shadow and never textures the white.
  s *= mix(${glsl(SHADOW_GRAIN_MIN)}, 1.0, hash(gl_FragCoord.xy));
  gl_FragColor = vec4(u_colour * s, s);
}
`;

type Surface = {
  gl: WebGLRenderingContext;
  uniform: (name: string) => WebGLUniformLocation | null;
  draw: () => void;
  dispose: () => void;
};

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // Dev-only by construction: `removeConsole` strips this in production.
    console.warn(
      "MetalBallCanvas shader failed to compile:",
      gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Builds a one-quad WebGL program on a canvas with the given backing size,
 * or returns `null` when the browser cannot give us a context — in which
 * case the static renders stay and nothing else happens.
 */
function createSurface(
  canvas: HTMLCanvasElement,
  fragmentSource: string,
  width: number,
  height: number
): Surface | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
    premultipliedAlpha: true,
  });
  if (!gl) {
    // Dev-only by construction: `removeConsole` strips this in production.
    console.warn("MetalBallCanvas: no WebGL context; the static renders stay.");
    return null;
  }
  canvas.width = width;
  canvas.height = height;
  gl.viewport(0, 0, width, height);

  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!(vertex && fragment && program)) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    gl.deleteProgram(program);
    return null;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    gl.deleteProgram(program);
    return null;
  }
  // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's `useProgram` is not a React hook, it only shares the prefix.
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  if (!buffer) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    gl.deleteProgram(program);
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );
  const position = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.clearColor(0, 0, 0, 0);

  return {
    gl,
    uniform: name => gl.getUniformLocation(program, name),
    draw() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    // Deliberately no `WEBGL_lose_context.loseContext()` here: a canvas keeps
    // one context for life, so a lost one is what the next `getContext()`
    // returns, and the effect that re-runs after StrictMode's double invoke
    // or a breakpoint flip would compile against a dead context and fail.
    // The GPU objects are released; the context itself goes with the element.
    dispose() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    },
  };
}

/** The shadow's colour, read back from the mask div so the live shadow and the mask cannot differ. */
function foregroundOf(element: HTMLElement): [number, number, number] {
  const match = getComputedStyle(element).backgroundColor.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)/
  );
  if (!match) {
    return [0, 0, 0];
  }
  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];
}

const SHADOW_LAYER =
  "absolute left-1/2 -z-10 w-ball-render-w -translate-x-1/2 transition-opacity duration-[var(--duration-feedback)] ease-out motion-reduce:transition-none";
// The mask is the frame's render box; the canvas is that box plus the reach
// above the ball a lamp below it needs — see `globals.css`. The ball's
// centre is measured against the canvas at mount, so the two never disagree.
const SHADOW_MASK_BOX = "top-0 h-ball-render-h";
const SHADOW_CANVAS_BOX = "-top-[var(--ball-shadow-reach)] h-[var(--ball-shadow-height)]";

export function MetalBallCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shadowRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useLiveReducedMotion();
  const [isActive, setIsActive] = useState(false);
  const [canInteract, setCanInteract] = useState(false);
  // The ball's laid-out width, in whole CSS px. The backing stores and the
  // shadow's centre are measured at mount, so the effect below is keyed on
  // this and rebuilds both whenever the ball is resized — the viewport
  // narrowing below `lg`, where the ball is fluid.
  const [ballWidth, setBallWidth] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const observer = new ResizeObserver(() => {
      setBallWidth(Math.round(canvas.getBoundingClientRect().width));
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const shadowCanvas = shadowRef.current;
    const mask = maskRef.current;
    const shell = shellRef.current;
    if (!(canvas && shell && ballWidth > 0) || reducedMotion) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    // At the fixed width, snap to the image's pixel grid at 2× rather than
    // trusting the rect's fractional width, so canvas and image sample the
    // grain identically. Fluid, the image is scaled by CSS anyway.
    const fixed = Math.abs(rect.width - FIXED_BALL_WIDTH) < 1;
    const size =
      dpr === MAX_DPR && fixed ? BALL_IMAGE_PIXELS : Math.round(rect.width * dpr);
    const ballSurface = createSurface(canvas, BALL_FRAGMENT_SHADER, size, size);
    if (!ballSurface) {
      return;
    }
    const shadowRect = shadowCanvas?.getBoundingClientRect();
    const shadowSurface =
      SHADOWS_ENABLED && shadowCanvas && shadowRect
        ? createSurface(
            shadowCanvas,
            SHADOW_FRAGMENT_SHADER,
            Math.round(shadowRect.width),
            Math.round(shadowRect.height)
          )
        : null;
    if (SHADOWS_ENABLED && !shadowSurface) {
      ballSurface.dispose();
      return;
    }
    setCanInteract(true);

    const ballGl = ballSurface.gl;
    const ballResolution = ballSurface.uniform("u_resolution");
    const ballLight = ballSurface.uniform("u_light");
    const ballLightSize = ballSurface.uniform("u_lightSize");
    const ballRoll = ballSurface.uniform("u_roll");
    const ballGrainRoll = ballSurface.uniform("u_grainRoll");
    const ballBlend = ballSurface.uniform("u_blend");
    ballGl.uniform2f(ballResolution, size, size);

    // The ball's resting centre and radius in the shadow's backing pixels,
    // measured before any lean. GL counts rows from the bottom.
    const shadowGl = shadowSurface?.gl;
    if (shadowSurface && shadowGl && shadowCanvas && shadowRect && mask) {
      const scale = shadowCanvas.width / shadowRect.width;
      const centreX = (rect.left + rect.width / 2 - shadowRect.left) * scale;
      const centreY =
        shadowCanvas.height - (rect.top + rect.height / 2 - shadowRect.top) * scale;
      shadowGl.uniform2f(shadowSurface.uniform("u_centre"), centreX, centreY);
      shadowGl.uniform1f(shadowSurface.uniform("u_radius"), (rect.width / 2) * scale);
      const [red, green, blue] = foregroundOf(mask);
      shadowGl.uniform3f(shadowSurface.uniform("u_colour"), red, green, blue);
    }
    const shadowBall = shadowSurface?.uniform("u_ball") ?? null;
    const shadowLight = shadowSurface?.uniform("u_light") ?? null;
    const shadowBlend = shadowSurface?.uniform("u_blend") ?? null;
    // ResizeObserver rebuilds this effect when the diameter changes.
    const radius = rect.width / 2;

    const draw = (
      light: Vec3,
      lightSize: number,
      blend: number,
      roll: { x: number; y: number },
      grainRoll: { x: number; y: number },
      lean: { x: number; y: number }
    ) => {
      // The lamp is measured from the ball's *resting* centre — the frame
      // the shadow works in, which subtracts the lean itself. The ball's
      // shader works from the ball's own centre, and the ball has moved by
      // the lean, so the lamp is shifted the other way. Under a drag the
      // ball travels with the finger, so this is what keeps the highlight
      // at the grab point instead of sliding off toward the edge.
      ballGl.uniform3f(ballLight, light.x - lean.x, light.y - lean.y, light.z);
      ballGl.uniform1f(ballLightSize, lightSize);
      ballGl.uniform1f(ballBlend, blend);
      ballGl.uniform2f(ballRoll, roll.x, roll.y);
      ballGl.uniform2f(ballGrainRoll, grainRoll.x, grainRoll.y);
      ballSurface.draw();
      // Off, the shader would multiply everything by 0 into a canvas nobody
      // can tell from a cleared one — the largest fill on the page, for
      // nothing.
      if (shadowSurface && shadowGl) {
        shadowGl.uniform3f(shadowLight, light.x, light.y, light.z);
        shadowGl.uniform1f(shadowBlend, blend);
        shadowGl.uniform2f(shadowBall, lean.x, lean.y);
        shadowSurface.draw();
      }
    };

    const light: Vec3 = { ...REST_LIGHT };
    let lightSize = REST_LIGHT_SIZE;
    let blend = 0;
    // Where the cursor puts the lamp and the lean when it is fully in
    // charge; the influence below decides how much of that is asked for.
    const cursorLight: Vec3 = { ...REST_LIGHT };
    const cursorPull = { x: 0, y: 0 };
    // The shell's lean from rest, in px.
    const offset = { x: 0, y: 0 };
    // The drag on top of it: where the finger has pulled the ball, its
    // velocity for the spring home, and the last total the shell was shown
    // at — which `aim` subtracts to find the resting centre.
    let dragging = false;
    let dragPointerId: number | null = null;
    const grab = { x: 0, y: 0 };
    const dragTarget = { x: 0, y: 0 };
    const drag = { x: 0, y: 0 };
    const dragVel = { x: 0, y: 0 };
    const shown = { x: 0, y: 0 };
    // The chase, in px down the page, and where the scroll is asking it to
    // be. The leash is in px too, from the radius measured at mount.
    const chaseMax = CHASE.maxRadii * (rect.width / 2);
    const chaseFor = (scrollY: number) => {
      const pulled = Math.max(scrollY, 0) * CHASE.follow;
      return chaseMax * (1 - Math.exp(-pulled / chaseMax));
    };
    // A reload that restores a scroll position starts the ball where that
    // scroll would have carried it, not at rest with a slide to follow.
    let chaseTarget = chaseFor(window.scrollY);
    let chase = chaseTarget;
    // 0: the ball ignores the cursor. 1: it follows it fully. Ramps
    // linearly toward its target over the in/out durations; eased when applied.
    let influence = 0;
    let influenceTarget = 0;
    let lastTime = 0;
    let frame = 0;

    const tick = (now: number) => {
      frame = 0;
      const dt = Math.min(now - lastTime, MAX_FRAME_MS);
      lastTime = now;
      if (influence < influenceTarget) {
        influence = Math.min(influence + dt / INFLUENCE_IN_MS, influenceTarget);
      } else if (influence > influenceTarget) {
        influence = Math.max(influence - dt / INFLUENCE_OUT_MS, influenceTarget);
      }
      const eased = ease(influence);
      // The idle wander, scaled by the influence so it is gone at rest.
      let driftX = 0;
      let driftY = 0;
      if (IDLE.enabled) {
        const phase = (now / IDLE.periodMs) * Math.PI * 2;
        driftX = IDLE.amplitude * Math.sin(phase) * eased;
        driftY = IDLE.amplitude * Math.sin(phase * 0.7 + 1) * eased;
      }
      const target: Vec3 = {
        x: REST_LIGHT.x + (cursorLight.x - REST_LIGHT.x) * eased + driftX,
        y: REST_LIGHT.y + (cursorLight.y - REST_LIGHT.y) * eased + driftY,
        z: REST_LIGHT.z + (cursorLight.z - REST_LIGHT.z) * eased,
      };
      const sizeTarget = REST_LIGHT_SIZE + (CURSOR_LIGHT_SIZE - REST_LIGHT_SIZE) * eased;
      const offsetTarget = { x: cursorPull.x * eased, y: cursorPull.y * eased };

      light.x += (target.x - light.x) * LIGHT_LERP;
      light.y += (target.y - light.y) * LIGHT_LERP;
      light.z += (target.z - light.z) * LIGHT_LERP;
      lightSize += (sizeTarget - lightSize) * LIGHT_LERP;
      blend += (eased - blend) * BLEND_LERP;
      offset.x += (offsetTarget.x - offset.x) * LEAN_LERP;
      offset.y += (offsetTarget.y - offset.y) * LEAN_LERP;
      // The drag. Held, the ball closes on the finger and the velocity is
      // whatever that motion was, so a release mid-swing carries on. Let
      // go, a damped spring takes it home: semi-implicit Euler, stable for
      // this stiffness at anything up to MAX_FRAME_MS.
      // Never 0: the velocity is a quotient of it.
      const seconds = Math.max(dt, 1) / 1000;
      if (dragging) {
        const nextX = drag.x + (dragTarget.x - drag.x) * DRAG.follow;
        const nextY = drag.y + (dragTarget.y - drag.y) * DRAG.follow;
        dragVel.x = (nextX - drag.x) / seconds;
        dragVel.y = (nextY - drag.y) / seconds;
        drag.x = nextX;
        drag.y = nextY;
      } else {
        const damping = 2 * Math.sqrt(DRAG.stiffness) * DRAG.damping;
        dragVel.x += (-DRAG.stiffness * drag.x - damping * dragVel.x) * seconds;
        dragVel.y += (-DRAG.stiffness * drag.y - damping * dragVel.y) * seconds;
        drag.x += dragVel.x * seconds;
        drag.y += dragVel.y * seconds;
      }
      chase += (chaseTarget - chase) * CHASE.lerp;
      if (Math.abs(chaseTarget - chase) < PULL_SETTLE_EPSILON) {
        chase = chaseTarget;
      }
      // The offset is applied in whole device pixels. A fractional translate
      // makes the compositor resample the shell's layer between pixels,
      // which blurs one-pixel grain to a third of its contrast: the ball
      // lost its texture whenever the cursor was parked anywhere but at
      // rest. Snapped, the layer lands on the grid and the grain stays
      // sharp; the steps are half a CSS pixel on a retina display, invisible
      // over a 12px lean. The roll and the shadow read the same snapped
      // value, so what the shaders draw is where the shell is.
      const pixel = 1 / (window.devicePixelRatio || 1);
      shown.x = Math.round((offset.x + drag.x) / pixel) * pixel;
      shown.y = Math.round((offset.y + drag.y + chase) / pixel) * pixel;
      // The rolls follow the displacement, so they need no state of their
      // own. The lean's, at its exaggerated gain, turns highlight and grain
      // alike; the drag's, at a floor ball's, turns the grain only — the
      // lamp is the finger, and the highlight has to stay under it. Screen
      // y points down; the shaders' points up.
      const lean = { x: shown.x / radius, y: -shown.y / radius };
      const roll = {
        x: (offset.x * ROLL_GAIN) / radius,
        y: -(offset.y * ROLL_GAIN) / radius,
      };
      const grainRoll = {
        x: (drag.x * DRAG.rollGain) / radius,
        y: -((drag.y + chase) * DRAG.rollGain) / radius,
      };
      // Until the first pointer move both canvases are at `opacity-0` and
      // the images are what shows, so a scroll before it — which runs this
      // loop for the chase — moves the shell and draws nothing. The frame
      // drawn at mount is what the fade-in starts from; the move that
      // starts it wakes the loop, which draws the current state before the
      // fade is visible.
      if (active) {
        draw(light, lightSize, blend, roll, grainRoll, lean);
      }
      shell.style.transform = `translate3d(${shown.x}px, ${shown.y}px, 0)`;
      // The static mask goes with the chase: it is the shadow until the
      // first pointer move, and a scroll before that would otherwise leave
      // the shadow behind the ball. The lean and the drag never reach it —
      // both come with a pointer, which hands the shadow to the canvas, and
      // the canvas reads the whole `shown` through `u_ball`. `translate`
      // composes with the class's centring `-translate-x-1/2`.
      if (mask) {
        mask.style.translate = `-50% ${chase}px`;
      }
      const dx = target.x - light.x;
      const dy = target.y - light.y;
      const dz = target.z - light.z;
      const db = eased - blend;
      const ox = offsetTarget.x - offset.x;
      const oy = offsetTarget.y - offset.y;
      const dragging2 = drag.x * drag.x + drag.y * drag.y;
      const velocity2 = dragVel.x * dragVel.x + dragVel.y * dragVel.y;
      if (!dragging && dragging2 < PULL_SETTLE_EPSILON_SQ && velocity2 < 1) {
        // Home. Zero it so the spring never idles on a sub-pixel remainder.
        drag.x = 0;
        drag.y = 0;
        dragVel.x = 0;
        dragVel.y = 0;
      }
      if (
        dragging ||
        drag.x !== 0 ||
        drag.y !== 0 ||
        chase !== chaseTarget ||
        influence !== influenceTarget ||
        (IDLE.enabled && eased > 0) ||
        dx * dx + dy * dy + dz * dz + db * db > SETTLE_EPSILON_SQ ||
        ox * ox + oy * oy > PULL_SETTLE_EPSILON_SQ
      ) {
        frame = requestAnimationFrame(tick);
      }
    };
    // Set once a context is lost. A canvas keeps one context for life, so
    // there is nothing to draw with after that: the renders stay, and
    // nothing below wakes the loop or hides them again.
    let lost = false;
    let inView = false;
    const pause = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    // The loop's own copy of `isActive`: set with it, read every frame.
    let active = false;
    const wake = () => {
      if (frame === 0 && !lost && inView && !document.hidden) {
        // Same clock as the rAF timestamp, so the first step is one frame.
        lastTime = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    // The cursor's own targets stay where they were: the ramp down glides
    // the lamp back from there, and a return picks the ramp up mid-way.
    // The ramp down waits REST_DELAY_MS; a move in the meantime cancels it.
    let restTimer = 0;
    const rest = () => {
      if (restTimer !== 0) {
        return;
      }
      restTimer = window.setTimeout(() => {
        restTimer = 0;
        influenceTarget = 0;
        wake();
      }, REST_DELAY_MS);
    };
    const cancelRest = () => {
      if (restTimer !== 0) {
        window.clearTimeout(restTimer);
        restTimer = 0;
      }
    };

    // The last place the pointer was seen, in viewport px, or null while it
    // is outside the window. A scroll moves the ball under a still cursor
    // without a pointer event, so the lamp is re-aimed from here on scroll.
    let pointer: { x: number; y: number } | null = null;

    const aim = (clientX: number, clientY: number) => {
      if (!inView || document.hidden) {
        return;
      }
      cancelRest();
      // Measure from the ball's *resting* centre: the rect already includes
      // the current lean, which would otherwise feed back into the next one.
      const current = canvas.getBoundingClientRect();
      const restLeft = current.left - shown.x;
      const restTop = current.top - shown.y;
      const pxX = clientX - (restLeft + radius);
      const pxY = clientY - (restTop + radius);

      let pullX = pxX * PULL_PER_PX;
      let pullY = pxY * PULL_PER_PX;
      const pull = Math.hypot(pullX, pullY);
      if (pull > PULL_MAX_PX) {
        pullX *= PULL_MAX_PX / pull;
        pullY *= PULL_MAX_PX / pull;
      }
      cursorPull.x = pullX;
      cursorPull.y = pullY;

      let x = pxX / radius;
      let y = -pxY / radius;
      const distance = Math.hypot(x, y);
      if (distance > MAX_LIGHT_OFFSET) {
        x *= MAX_LIGHT_OFFSET / distance;
        y *= MAX_LIGHT_OFFSET / distance;
      }
      cursorLight.x = x;
      cursorLight.y = y;
      cursorLight.z = CURSOR_LIGHT_Z;
      influenceTarget = 1;
      if (!active) {
        active = true;
        setIsActive(true);
      }
      wake();
    };
    const onPointerMove = (event: PointerEvent) => {
      // Touch goes through the touch events below: once a drag becomes a
      // scroll the browser cancels the pointer and sends no more moves.
      if (event.pointerType === "touch" || lost) {
        return;
      }
      pointer = { x: event.clientX, y: event.clientY };
      aim(event.clientX, event.clientY);
    };
    // A finger is the lamp from the moment it lands, and it keeps aiming
    // while it drags the page — passive `touchmove` fires through a scroll.
    // Its last position stays after it lifts: the page keeps moving under
    // it on momentum, and the next finger takes over from there.
    const onTouch = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch || lost) {
        return;
      }
      pointer = { x: touch.clientX, y: touch.clientY };
      aim(touch.clientX, touch.clientY);
    };
    // A scroll also moves the ball itself — the chase — whether or not a
    // pointer has been seen, so the loop wakes for it either way.
    const onScroll = () => {
      if (lost) {
        return;
      }
      chaseTarget = chaseFor(window.scrollY);
      if (pointer) {
        aim(pointer.x, pointer.y);
      } else {
        wake();
      }
    };
    // Grabbing. Only a press inside the disc takes hold — the shell is
    // square and its corners are page. The pointer is captured on the
    // shell so the drag keeps coming after the pointer leaves it, and the
    // grab point is offset by the current drag so a ball caught mid-swing
    // does not jump to the finger. The rubber band is
    // `d × max ÷ (d + max)`: 1:1 at first, never past `max`.
    const onPointerDown = (event: PointerEvent) => {
      if (lost || dragging || event.button !== 0) {
        return;
      }
      const box = shell.getBoundingClientRect();
      const radius = box.width / 2;
      const dx = event.clientX - (box.left + radius);
      const dy = event.clientY - (box.top + radius);
      if (dx * dx + dy * dy > radius * radius) {
        return;
      }
      event.preventDefault();
      // Capture first: it throws for a pointer that is no longer active,
      // and a grab must not be half-taken when it does.
      try {
        shell.setPointerCapture(event.pointerId);
      } catch {
        return;
      }
      dragging = true;
      dragPointerId = event.pointerId;
      grab.x = event.clientX - drag.x;
      grab.y = event.clientY - drag.y;
      dragTarget.x = drag.x;
      dragTarget.y = drag.y;
      shell.style.cursor = "grabbing";
      wake();
    };
    const onDragMove = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== dragPointerId) {
        return;
      }
      const rawX = event.clientX - grab.x;
      const rawY = event.clientY - grab.y;
      const distance = Math.hypot(rawX, rawY);
      if (distance === 0) {
        dragTarget.x = 0;
        dragTarget.y = 0;
        return;
      }
      const max = DRAG.maxRadii * radius;
      const banded = (distance * max) / (distance + max);
      dragTarget.x = (rawX * banded) / distance;
      dragTarget.y = (rawY * banded) / distance;
    };
    const onDragEnd = (event?: PointerEvent) => {
      if (!dragging || (event && event.pointerId !== dragPointerId)) {
        return;
      }
      dragging = false;
      if (dragPointerId !== null && shell.hasPointerCapture(dragPointerId)) {
        shell.releasePointerCapture(dragPointerId);
      }
      dragPointerId = null;
      dragTarget.x = 0;
      dragTarget.y = 0;
      shell.style.cursor = "";
      wake();
    };
    // `relatedTarget` is null only when the pointer leaves the document. A
    // lifted finger fires this too, and a finger has nowhere to leave to.
    const onPointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null && event.pointerType !== "touch") {
        pointer = null;
        rest();
      }
    };
    const onVisibilityChange = () => {
      if (document.hidden) {
        onDragEnd();
        pause();
      } else {
        onScroll();
      }
    };
    // Observe the resting wrapper, not the moving shell. Keep enough margin
    // for its chase/drag; with shadows enabled, watch their full extent too.
    const reach = Math.ceil(radius * (CHASE.maxRadii + DRAG.maxRadii) + PULL_MAX_PX);
    const visibilityObserver = new IntersectionObserver(
      entries => {
        inView = entries.some(entry => entry.isIntersecting);
        if (inView) {
          onScroll();
        } else {
          pause();
        }
      },
      { rootMargin: `${reach}px` }
    );
    visibilityObserver.observe(shadowCanvas ?? shell.parentElement ?? shell);
    // A lost context leaves a blank canvas; hand both back to the renders.
    const onContextLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      onDragEnd();
      pause();
      shell.style.transform = "";
      if (mask) {
        mask.style.translate = "";
      }
      setIsActive(false);
      setCanInteract(false);
    };

    // First frame at rest, so there is something to fade in on the first move.
    draw(light, lightSize, blend, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 });
    // Already scrolled — a reload, or the ball resized mid-page — the shell
    // has to be placed now; nothing else wakes the loop until the next scroll.
    if (chase !== 0) {
      wake();
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    shell.addEventListener("pointerdown", onPointerDown);
    shell.addEventListener("pointermove", onDragMove);
    shell.addEventListener("pointerup", onDragEnd);
    shell.addEventListener("pointercancel", onDragEnd);
    shell.addEventListener("lostpointercapture", onDragEnd);
    document.addEventListener("pointerout", onPointerOut);
    document.addEventListener("visibilitychange", onVisibilityChange);
    canvas.addEventListener("webglcontextlost", onContextLost);
    shadowCanvas?.addEventListener("webglcontextlost", onContextLost);

    return () => {
      onDragEnd();
      cancelAnimationFrame(frame);
      cancelRest();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("scroll", onScroll);
      shell.removeEventListener("pointerdown", onPointerDown);
      shell.removeEventListener("pointermove", onDragMove);
      shell.removeEventListener("pointerup", onDragEnd);
      shell.removeEventListener("pointercancel", onDragEnd);
      shell.removeEventListener("lostpointercapture", onDragEnd);
      shell.style.cursor = "";
      document.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      shadowCanvas?.removeEventListener("webglcontextlost", onContextLost);
      ballSurface.dispose();
      shadowSurface?.dispose();
      shell.style.transform = "";
      if (mask) {
        mask.style.translate = "";
      }
      visibilityObserver.disconnect();
      // Back to the images until the next pointer move, so a re-run of this
      // effect (the ball resizing) starts from the same state as mount.
      setIsActive(false);
      setCanInteract(false);
    };
  }, [reducedMotion, ballWidth]);

  return (
    <>
      {SHADOWS_ENABLED && (
        <>
          <div
            className={cn(
              SHADOW_LAYER,
              SHADOW_MASK_BOX,
              SHADOW_COLOUR === null && "bg-foreground"
            )}
            ref={maskRef}
            style={{
              backgroundColor: SHADOW_COLOUR ?? undefined,
              opacity: isActive ? 0 : SHADOW_OPACITY,
              maskComposite: "intersect",
              maskImage: `url(${shadowMask.src}), url(${grain.src})`,
              maskMode: "luminance, luminance",
              maskRepeat: "no-repeat, repeat",
              maskSize: "100% 100%, 128px 128px",
            }}
          />
          <canvas
            className={cn(
              SHADOW_LAYER,
              SHADOW_CANVAS_BOX,
              isActive ? "opacity-100" : "opacity-0"
            )}
            ref={shadowRef}
          />
        </>
      )}
      {/* `isolate` so the image's `-z-10` stays inside this shell and under
          the canvas whether or not the shell has a transform yet. The wrapper
          in `metal-ball.tsx` carries `aria-hidden`; a canvas counts as
          focusable to the linter, so nothing here repeats it. */}
      {/* `touch-none`: a finger that lands on the ball is dragging it, not
          the page — without this the browser takes the drag as a scroll and
          cancels the pointer. Only the ball's box; the page around it
          scrolls as ever. */}
      <div
        className={cn(
          "relative isolate mx-auto size-ball select-none",
          canInteract && !reducedMotion && "cursor-grab touch-none"
        )}
        ref={shellRef}
      >
        <Image
          alt=""
          className="absolute inset-0 -z-10 size-ball max-w-none select-none"
          draggable={false}
          height={234}
          priority
          src={ball}
          unoptimized
          width={234}
        />
        <canvas
          className={cn(
            "block size-ball transition-opacity duration-[var(--duration-feedback)] ease-out motion-reduce:transition-none",
            isActive ? "opacity-100" : "opacity-0"
          )}
          ref={canvasRef}
        />
      </div>
    </>
  );
}
