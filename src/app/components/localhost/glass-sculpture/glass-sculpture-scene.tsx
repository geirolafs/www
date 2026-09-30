"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { PillButton } from "@/app/components/shell/pill";
import { glassSculptureContent as content } from "@/lib/content/localhost-glass-sculpture";
import { useLiveReducedMotion } from "@/lib/hooks/use-live-reduced-motion";
import { createRenderer } from "./renderer";
import { DEFAULT_CONTROLS, type SculptureControls } from "./scene";

type Renderer = ReturnType<typeof createRenderer>;

/**
 * vgpu's glass-sculpture example: a WebGPU raymarched glass form with bloom.
 * The canvas and its lifecycle are the example's `index.tsx`. Its lil-gui
 * panel is replaced by the site's pills under the canvas, each pushing the
 * whole control set through `renderer.update`.
 *
 * Under reduced motion everything that moves on its own holds still: the
 * turntable (its pill still turns it on), the light's drift, the reflection
 * strip and the grain. Dragging, zooming and steering the light with the
 * cursor still work — they only move when you do.
 */
export function GlassSculptureScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const reducedMotion = useLiveReducedMotion();
  const [controls, setControls] = useState<SculptureControls>(DEFAULT_CONTROLS);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    let active = true;
    const renderer = createRenderer(canvas);
    rendererRef.current = renderer;
    renderer.ready.catch((error: unknown) => {
      console.error("[glass-sculpture]", error);
      if (active) {
        setFailed(true);
      }
    });
    return () => {
      active = false;
      rendererRef.current = null;
      renderer.dispose();
    };
  }, []);

  // Declared after the renderer effect, so on mount it runs second and hands
  // the renderer the state's controls rather than its defaults.
  useEffect(() => {
    rendererRef.current?.update(controls);
  }, [controls]);

  useEffect(() => {
    rendererRef.current?.setStill(reducedMotion);
    setControls(current => ({ ...current, spin: !reducedMotion }));
  }, [reducedMotion]);

  const set = (next: Partial<SculptureControls>) =>
    setControls(current => ({ ...current, ...next }));

  return (
    <div className="flex flex-col gap-md">
      <div className="relative h-[70svh] w-full overflow-hidden bg-background">
        <canvas
          aria-label={content.canvasLabel}
          className="block size-full touch-none"
          ref={canvasRef}
          role="img"
        />
        {failed ? (
          <p className="absolute inset-0 flex items-center justify-center p-md text-center font-regular text-label text-muted tracking-normal">
            {content.unsupported}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-md font-regular text-label tracking-normal">
        <ControlRow label={content.shapeLabel}>
          {content.shapes.map(option => (
            <PillButton
              key={option.id}
              onClick={() => set({ shape: option.id })}
              pressed={controls.shape === option.id}
            >
              {option.label}
            </PillButton>
          ))}
        </ControlRow>
        <ControlRow label={content.glassLabel}>
          {content.glasses.map(option => (
            <PillButton
              key={option.id}
              onClick={() => set({ glass: option.id })}
              pressed={controls.glass === option.id}
            >
              {option.label}
            </PillButton>
          ))}
        </ControlRow>
        <ControlRow label={content.lightLabel}>
          {content.lights.map(option => (
            <PillButton
              key={option.id}
              onClick={() => set({ light: option.id })}
              pressed={controls.light === option.id}
            >
              {option.label}
            </PillButton>
          ))}
        </ControlRow>
        <ControlRow label={content.renderScaleLabel}>
          {content.renderScales.map(option => (
            <PillButton
              key={option.id}
              onClick={() => set({ renderScale: option.id })}
              pressed={controls.renderScale === option.id}
            >
              {option.label}
            </PillButton>
          ))}
        </ControlRow>
        <div className="flex flex-wrap gap-1.5">
          <PillButton
            onClick={() => set({ dispersion: !controls.dispersion })}
            pressed={controls.dispersion}
          >
            {content.dispersionLabel}
          </PillButton>
          <PillButton
            onClick={() => set({ spin: !controls.spin })}
            pressed={controls.spin}
          >
            {content.spinLabel}
          </PillButton>
        </div>
        <p className="text-muted">{content.credit}</p>
      </div>
    </div>
  );
}

function ControlRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-muted">{label}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
