/**
 * Centralized image optimization configuration
 * Used by Next.js config and components for consistent quality levels
 */

export const IMAGE_QUALITIES = {
  blur: 20, // Ambient/blur effect layers (intentionally low, heavily blurred)
  low: 50, // Lazy-loaded, non-priority images
  medium: 60, // Priority images in cascade
  high: 75, // Hero images, critical content
  max: 90, // Maximum quality for special cases
} as const;

export const IMAGE_QUALITY_ARRAY = Object.values(IMAGE_QUALITIES);

// Image sizes optimized for cascade layout
export const IMAGE_SIZES = [256, 270, 360, 384, 480, 540, 640, 960] as const;

// Cache TTL
export const IMAGE_CACHE_TTL = 86_400; // 24 hours in seconds

export const REMOTE_IMAGE_HOSTS = ["l080tsjr1x.ufs.sh", "ve7o52t8ra.ufs.sh"] as const;
