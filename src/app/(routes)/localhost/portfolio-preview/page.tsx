import type { Metadata } from "next";
import { ExperimentPage } from "@/app/components/localhost/experiment-page";
import { MediaCard } from "@/app/components/localhost/portfolio-preview/media-card";
import {
  isVideo,
  type PortfolioFile,
} from "@/app/components/localhost/portfolio-preview/portfolio-file";
import portfolioFiles from "@/data/random-portfolio.json";
import { localhostContent } from "@/lib/content/localhost";
import { portfolioPreviewContent } from "@/lib/content/localhost-portfolio-preview";

const experiment = localhostContent.experiments.find(
  e => e.href === "/localhost/portfolio-preview"
);

export const metadata: Metadata = {
  title: experiment?.title,
  robots: {
    index: false,
    follow: false,
  },
};

const files: PortfolioFile[] = portfolioFiles;
const videoCount = files.filter(file => isVideo(file.name)).length;

/**
 * v1's /dev/portfolio-preview on the site's shell: every file in the
 * UploadThing bucket, straight from `random-portfolio.json`, as a contact
 * sheet. Videos play on hover; a click opens the file itself.
 *
 * The hero names the page, so v1's "random-portfolio.json" heading drops to a
 * meta line above the sheet. The sheet runs on columns 2–11, the footer's
 * span, so it lines up with the widest band the site already has; inside it,
 * cards fill as many ~240px columns as fit.
 */
export default function Page() {
  return (
    <ExperimentPage
      description={experiment?.description ?? ""}
      title={experiment?.title ?? ""}
    >
      <div className="col-span-full flex flex-col gap-md lg:col-span-10 lg:col-start-2">
        <p className="font-regular text-meta text-muted tabular-nums">
          {portfolioPreviewContent.heading} —{" "}
          {portfolioPreviewContent.count(
            files.length,
            videoCount,
            files.length - videoCount
          )}
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,15rem),1fr))] gap-x-md gap-y-xl">
          {files.map(file => (
            <MediaCard file={file} key={file.key} />
          ))}
        </div>
      </div>
    </ExperimentPage>
  );
}
