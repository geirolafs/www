/**
 * Copy for /localhost/portfolio-preview. `heading` is the data file's own
 * name, as v1 titled the page; here it leads the meta line above the sheet.
 */
export const portfolioPreviewContent = {
  heading: "random-portfolio.json",
  count: (total: number, videos: number, images: number) =>
    `${total} items (${videos} videos, ${images} images)`,
  badge: {
    image: "IMG",
    video: "VID",
  },
} as const;
