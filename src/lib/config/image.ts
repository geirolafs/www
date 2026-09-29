/**
 * Image optimisation settings shared by `next.config.ts` and components.
 * `IMAGE_QUALITY_ARRAY` is the allow-list Next checks `quality` against;
 * 75 is Next's default for images that don't set one, so it has to stay.
 */

export const IMAGE_QUALITIES = {
  blur: 20,
  low: 50,
  medium: 60, // the portfolio carousel
  high: 75, // Next's default
  max: 90,
} as const;

export const IMAGE_QUALITY_ARRAY = Object.values(IMAGE_QUALITIES);

// Widths the optimiser may generate, sized to the portfolio carousel's cards.
export const IMAGE_SIZES = [256, 270, 360, 384, 480, 540, 640, 960] as const;

// Cache TTL
export const IMAGE_CACHE_TTL = 86_400; // 24 hours in seconds

export const REMOTE_IMAGE_HOSTS = ["l080tsjr1x.ufs.sh", "ve7o52t8ra.ufs.sh"] as const;
