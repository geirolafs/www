import { AMBILIGHT, ambilightFilterIds } from "./config";

/**
 * v1's `AmbilightFilter`, step for step: a full filter with grain, and a lite
 * one for below 768px with the blur capped and the grain pipeline skipped.
 * Both are always in the DOM and CSS picks between them (see `config.ts`), so
 * there is no viewport check and nothing to swap after hydration.
 *
 * The grain is there to break up banding in the wide blur. It is clipped to
 * the glow's own luminance so it fades out with the glow rather than stopping
 * at a hard edge.
 */
export function AmbilightFilter({ id }: { id: string }) {
  const { full, lite } = ambilightFilterIds(id);

  return (
    <svg aria-hidden="true" className="pointer-events-none absolute size-0">
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          height="200%"
          id={full}
          width="200%"
          x="-50%"
          y="-50%"
        >
          <LuminanceAlpha />
          <feGaussianBlur in="lit" result="blurred" stdDeviation={AMBILIGHT.blur} />
          {/* Static grey grain, overlaid on the blur. */}
          <feTurbulence
            baseFrequency={0.7}
            numOctaves={2}
            result="noise"
            seed={1}
            type="fractalNoise"
          />
          <feColorMatrix
            in="noise"
            result="grayNoise"
            type="matrix"
            values="0.33 0.33 0.33 0 0
                    0.33 0.33 0.33 0 0
                    0.33 0.33 0.33 0 0
                    0    0    0    1 0"
          />
          <feBlend in="blurred" in2="grayNoise" mode="overlay" result="noisyBlur" />
          {/* Luminance at 3× so the grain reaches into the dim edge of the
              gradient, which is where the banding shows. */}
          <feColorMatrix
            in="blurred"
            result="luminanceMask"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0.6378 2.1456 0.2166 0 0"
          />
          <feGaussianBlur
            in="luminanceMask"
            result="smoothLuminanceMask"
            stdDeviation={AMBILIGHT.blur * 0.75}
          />
          <feComposite
            in="noisyBlur"
            in2="smoothLuminanceMask"
            operator="in"
            result="clippedNoisyBlur"
          />
          <feComposite
            in="blurred"
            in2="clippedNoisyBlur"
            k1="0"
            k2={1 - AMBILIGHT.noiseOpacity}
            k3={AMBILIGHT.noiseOpacity}
            k4="0"
            operator="arithmetic"
            result="grained"
          />
          <feColorMatrix
            in="grained"
            type="saturate"
            values={String(AMBILIGHT.saturation)}
          />
        </filter>
        <filter
          colorInterpolationFilters="sRGB"
          height="200%"
          id={lite}
          width="200%"
          x="-50%"
          y="-50%"
        >
          <LuminanceAlpha />
          <feGaussianBlur in="lit" result="blurred" stdDeviation={AMBILIGHT.liteBlur} />
          <feColorMatrix
            in="blurred"
            type="saturate"
            values={String(AMBILIGHT.saturation)}
          />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * Luminance at 2× into alpha, less 0.3, so dark pixels go transparent before
 * the blur and only bright or coloured areas spread into the glow.
 */
function LuminanceAlpha() {
  return (
    <feColorMatrix
      in="SourceGraphic"
      result="lit"
      type="matrix"
      values="1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0.4252 1.4304 0.1444 0 -0.3"
    />
  );
}
