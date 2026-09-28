import { MetalBallCanvas } from "@/app/components/home/metal-ball-canvas";

/**
 * No stacking context: the shadows paint below page content, while the ball
 * stays hit-testable for dragging. Clip only x so the shadow can bleed down
 * the page without causing horizontal scroll on narrow viewports.
 */
export function MetalBall() {
  return (
    <div aria-hidden="true" className="relative mt-section h-ball overflow-x-clip">
      <MetalBallCanvas />
    </div>
  );
}
