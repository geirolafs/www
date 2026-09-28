/**
 * Token set for the OG image route only, consumed by `(routes)/og/route.tsx`.
 *
 * Satori can't read CSS custom properties, so these are plain JS values. They
 * are deliberately NOT the site palette: social cards render dark, the site
 * renders light. Do not sync these with the `@theme` block in globals.css —
 * the divergence is the point.
 */
export const tokens = {
  colors: {
    background: "#252525", // oklch(0.145 0 0)
    backgroundDark: "#0a0a0a", // Darker variant for OG images
    foreground: "#fafafa", // oklch(0.985 0 0)
    muted: "rgba(255, 255, 255, 0.5)",
    mutedLight: "rgba(255, 255, 255, 0.8)",
    chart5: "#ff4404",
  },
  typography: {
    fontSize: 58,
    lineHeight: 1.3,
    letterSpacing: "-0.02em",
    letterSpacingTight: "-0.01em",
    fontWeight: {
      medium: 500,
      semibold: 600,
    },
  },
  spacing: {
    og: {
      padding: 32,
      gap: 48,
    },
  },
  og: {
    width: 1200,
    height: 630,
    gradient:
      "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)",
    textShadow: "0 2px 20px rgba(0,0,0,0.5)",
    textShadowSmall: "0 1px 10px rgba(0,0,0,0.5)",
  },
} as const;
