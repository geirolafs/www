import type { Metadata } from "next";
import { CustomExperimentPage } from "@/app/components/localhost/experiment-page";
import { ParticleHoverScene } from "@/app/components/localhost/particle-hover/particle-hover-scene";
import { localhostContent } from "@/lib/content/localhost";
import { particleHoverContent } from "@/lib/content/localhost-particle-hover";

const experiment = localhostContent.experiments.find(
  e => e.href === "/localhost/particle-hover"
);

export const metadata: Metadata = {
  title: experiment?.title,
  robots: {
    index: false,
    follow: false,
  },
};

/** v1's /dev/particle-hover, on the dark experiment shell. */
export default function Page() {
  return (
    <CustomExperimentPage theme="dark" title={experiment?.title ?? ""}>
      <ParticleHoverScene
        label={particleHoverContent.imageLabel}
        src="/localhost/particle-hover/hallo-500.png"
      />
    </CustomExperimentPage>
  );
}
