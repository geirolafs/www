/**
 * The logo mark, as an SVG path on a 512×512 viewBox.
 *
 * Shared by the favicon (`app/icon.tsx`) and the apple touch icon
 * (`app/apple-icon.tsx`). They stay separate files because Next.js treats each
 * as its own metadata route — this only stops the two copies drifting apart.
 */
export const LOGO_MARK_PATH =
  "M256,512c141,0,256-115,256-256s-115-256-256-256s-256,115-256,256s115,256,256,256ZM124,179v-40h141v121h-50v-46c-24,4-37,21-37,46c0,37,30,57,78,57c49,0,80-19,80-57c0-24-14-40-41-46l3-75c62,13,96,55,96,120c0,79-58,133-138,133c-79,0-137-54-137-128c0-37,13-66,40-81Z";

export const LOGO_MARK_VIEW_BOX = "0 0 512 512";
