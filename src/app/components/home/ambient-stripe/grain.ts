/**
 * Grain against banding. The glow's long vertical fades between pale stops
 * move a channel only a few levels over a thousand-plus px, so 8-bit output
 * draws them as wide flat bands. A little noise under 1–2 levels breaks the
 * band edges up, the way the vgpu triangle-led example dithers its radiance.
 *
 * The tile is blended into each glow layer's own background with `multiply`,
 * so it only ever touches the glow's colour and fades out with the glow's
 * mask. A separate blended layer would paint grey noise on the page wherever
 * the glow is transparent. Multiply is used rather than soft-light or
 * overlay because those scale by the colour's distance from white, and the
 * stripe's colours are all pale: they would barely move. Multiply darkens
 * every colour by the same share.
 *
 * The tile is static. It is rasterised once with the layer, and the glow's
 * motion writes only `transform` and `opacity`, so it costs nothing per frame.
 */

/** Tile size in CSS px; drawn at device pixels so each grain is one pixel. */
export const GRAIN_TILE_PX = 128;

/** Seeded so every reload draws the same grain, and variants compare fairly. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d_2b_79_f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/**
 * Tiles already drawn, by `levels:dpr`, since a navigation remounts the
 * stripe. Blob URLs, not data URLs: every glow layer repeats the URL in its
 * inline style, and a data URL of noise is tens of KB. They're never revoked;
 * there's one per grain setting, and the site uses one.
 */
const tiles = new Map<string, Promise<string | null>>();

/**
 * A near-white noise tile as a PNG blob URL, or null if there is no 2D
 * context. `levels` is the mean darkening in 8-bit levels; the spread is
 * triangular (two uniforms averaged), the usual shape for dither, from 0 to
 * twice that. The tile is seeded, so a cached one is the one that would be
 * drawn again. Browser only: it needs a canvas.
 */
export function getGrainTile(levels: number, dpr: number) {
  const key = `${levels}:${dpr}`;
  let tile = tiles.get(key);
  if (!tile) {
    tile = drawGrainTile(levels, dpr);
    tiles.set(key, tile);
  }
  return tile;
}

function drawGrainTile(levels: number, dpr: number): Promise<string | null> {
  const size = Math.round(GRAIN_TILE_PX * dpr);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return Promise.resolve(null);
  }
  const random = mulberry32(0x9e_37_79_b9);
  const image = ctx.createImageData(size, size);
  const { data } = image;
  for (let i = 0; i < data.length; i += 4) {
    const u = (random() + random()) / 2;
    const v = 255 - Math.round(u * levels * 2);
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob ? URL.createObjectURL(blob) : null), "image/png");
  });
}
