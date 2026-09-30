/**
 * Copy for /localhost/glass-sculpture beyond the title and description, which
 * live on the experiment's entry in `localhost.ts`. The option ids match the
 * scene's own (`SHAPES`, `GLASS_TINTS`, `LIGHT_RIG_NAMES`, `RENDER_SCALES`).
 */
export const glassSculptureContent = {
  canvasLabel:
    "A glass sculpture on a turntable. Drag to orbit, scroll to zoom, move the cursor to steer the light.",
  unsupported: "This needs WebGPU, and it didn’t start in this browser.",
  credit: "Concept and visual design by Kazuyuki Chinda.",
  shapeLabel: "Shape",
  shapes: [
    { id: "knot", label: "knot" },
    { id: "gyroid", label: "gyroid" },
    { id: "droplets", label: "droplets" },
  ],
  glassLabel: "Glass",
  glasses: [
    { id: "clear", label: "clear" },
    { id: "rose", label: "rose" },
    { id: "cobalt", label: "cobalt" },
    { id: "emerald", label: "emerald" },
  ],
  lightLabel: "Light rig",
  lights: [
    { id: "studio", label: "studio" },
    { id: "noir", label: "noir" },
    { id: "gel", label: "gel" },
    { id: "golden", label: "golden" },
  ],
  renderScaleLabel: "Render scale",
  renderScales: [
    { id: 0.5, label: "50%" },
    { id: 0.75, label: "75%" },
    { id: 1, label: "100%" },
  ],
  dispersionLabel: "dispersion",
  spinLabel: "turntable",
} as const;
