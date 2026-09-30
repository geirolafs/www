// Concept and visual design by Kazuyuki Chinda (@ckazu).

import { clock, frameLoop, type Gpu, init, surface } from "vgpu";
import { installPointerInput } from "./pointer-input";
import {
  createScene,
  DEFAULT_CONTROLS,
  normalizeControls,
  type SculptureControls,
} from "./scene";

/**
 * vgpu's glass-sculpture example renderer. The WebGPU setup, frame loop and
 * teardown order are the example's own. The one change: its lil-gui panel is
 * gone, and `update` takes its place so React pills can drive the controls.
 * `setStill` is new too: reduced motion freezes the ambient clock (reflection
 * strip, grain) and the light's idle drift. With it off, the ambient clock
 * runs as the example's `time.time` did.
 */
export function createRenderer(
  canvas: HTMLCanvasElement,
  initialControls: Readonly<SculptureControls> = DEFAULT_CONTROLS
) {
  let disposed = false;
  let gpu: Gpu | undefined;
  let resizeScene: (() => void) | undefined;
  /** Reduced motion: hold the light's drift, the reflection strip and the grain. */
  let still = false;
  const browserCleanups: Array<() => void> = [];
  const controls = normalizeControls(initialControls);

  const dispose = () => {
    if (disposed) {
      return;
    }
    disposed = true;
    let firstError: unknown;
    for (const cleanup of [...browserCleanups].reverse()) {
      try {
        cleanup();
      } catch (error) {
        firstError ??= error;
      }
    }
    browserCleanups.length = 0;
    try {
      gpu?.dispose();
    } catch (error) {
      firstError ??= error;
    }
    if (firstError !== undefined) {
      throw firstError;
    }
  };

  /** What the example's GUI did: mutate the shared controls, resize on a new scale. */
  const update = (next: Partial<SculptureControls>) => {
    if (disposed) {
      return;
    }
    const previousScale = controls.renderScale;
    Object.assign(controls, normalizeControls({ ...controls, ...next }));
    if (controls.renderScale !== previousScale) {
      resizeScene?.();
    }
  };

  const ready = (async () => {
    const context = await init();
    if (disposed) {
      context.dispose();
      return;
    }
    gpu = context;
    const output = surface(context, canvas, { dpr: [1, 2] });
    const scene = createScene(context, output, controls);
    browserCleanups.push(() => scene.destroy());
    // Set before `prepare` so a scale picked while shaders compile still lands.
    resizeScene = () => {
      try {
        scene.resize(output.size, controls.renderScale);
      } catch (error) {
        try {
          dispose();
        } catch {
          // Teardown must not replace the resize failure.
        }
        throw error;
      }
    };
    await scene.prepare(output);
    if (disposed) {
      return;
    }

    const input = installPointerInput(canvas);
    browserCleanups.push(() => input.dispose());
    const unsubscribeResize = output.onResize(resizeScene);
    browserCleanups.push(unsubscribeResize);

    const time = clock(context);
    let sculptureTime = 0;
    let ambientTime = 0;
    frameLoop(context, currentFrame => {
      try {
        input.advance(time.deltaTime, !still);
        if (!still) {
          ambientTime += time.deltaTime;
        }
        if (controls.spin) {
          sculptureTime += time.deltaTime;
        }
        scene.render(currentFrame, output, input.camera, controls, {
          sculptureTime,
          clockTime: ambientTime,
          deltaTime: time.deltaTime,
          light: input.light,
        });
      } catch (error) {
        try {
          dispose();
        } catch {
          // Teardown must not replace the frame failure.
        }
        throw error;
      }
    });
  })().catch((error: unknown) => {
    if (disposed) {
      return;
    }
    try {
      dispose();
    } catch {
      // Teardown must not replace the initialization or render failure.
    }
    throw error;
  });

  const setStill = (value: boolean) => {
    still = value;
  };

  return { ready, dispose, update, setStill };
}
