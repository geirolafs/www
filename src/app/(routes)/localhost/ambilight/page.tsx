import type { Metadata } from "next";
import { AmbilightImage } from "@/app/components/localhost/ambilight/ambilight-image";
import { AmbilightVideo } from "@/app/components/localhost/ambilight/ambilight-video";
import { ExperimentPage } from "@/app/components/localhost/experiment-page";
import { localhostContent } from "@/lib/content/localhost";
import { type PortfolioMedia, portfolioMedia } from "@/lib/content/portfolio";

const experiment = localhostContent.experiments.find(
  e => e.href === "/localhost/ambilight"
);

export const metadata: Metadata = {
  title: experiment?.title,
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Four pieces for a 2 × 2 grid, image and video alternating so each row and
 * column holds one of each. Drawn from the portfolio bucket, since v1's
 * `public/temp` test files stay behind. Picked for colour: the glow is built from luminance, so a mostly
 * dark piece gives off almost nothing. UploadThing keys are stable across
 * manifest re-exports; anything missing from the bucket, or a video still
 * waiting on its poster, is skipped.
 */
const MEDIA_KEYS = [
  "HDca0BEpV67XyGOl7m68Qv07q54RM3WmIuaUfPF9kwoHgS6h", // kvika-04.png
  "HDca0BEpV67XPl5qj9KA4KTokPJHXFeC2diSrtnsfvWz16Uu", // hallo-repel-red.mp4
  "HDca0BEpV67XGx8fSQ4y83qJTISiPH9pjNvlUsKoQRfktEaW", // festisvall-02.png
  "HDca0BEpV67XCgRPAgZweBNTyAiDYVpqIOUzEfbRdv5WLJhx", // gv-asciihero.mp4
];

const media = MEDIA_KEYS.flatMap((key): PortfolioMedia[] => {
  const item = portfolioMedia.find(m => m.id === key);
  if (!item || (item.kind === "video" && !item.posterUrl)) {
    return [];
  }
  return [item];
});

/**
 * A 2 × 2 grid from tablet width up — on the content column below `lg`, on
 * columns 3–10 above it — and one column on phones only. The gap is
 * `--spacing-project` (96) both ways, deliberately roomy: the glow spreads
 * roughly its blur radius plus the scale-up past each piece's edges, and at a
 * tighter gap neighbouring glows would run into each other and read as one
 * wash. Nothing on the way up clips overflow, so the glow is free to spill
 * into the gaps and gutters.
 *
 * v1 gave each piece its own screen and a scroll parallax. The parallax is
 * gone — this site keeps scroll-linked motion out — and the pieces sit on the
 * page grid like the rest of the site's media.
 */
export default function Page() {
  return (
    <ExperimentPage
      description={experiment?.description ?? ""}
      title={experiment?.title ?? ""}
    >
      <ul className="grid grid-cols-1 gap-project md:grid-cols-2 lg:col-span-8 lg:col-start-3">
        {media.map(item => (
          <li key={item.id}>
            {item.kind === "video" && item.posterUrl ? (
              <AmbilightVideo id={item.id} posterUrl={item.posterUrl} src={item.url} />
            ) : (
              <AmbilightImage id={item.id} src={item.url} />
            )}
          </li>
        ))}
      </ul>
    </ExperimentPage>
  );
}
