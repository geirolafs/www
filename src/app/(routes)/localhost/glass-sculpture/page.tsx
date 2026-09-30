import type { Metadata } from "next";
import { CustomExperimentPage } from "@/app/components/localhost/experiment-page";
import { GlassSculptureScene } from "@/app/components/localhost/glass-sculpture/glass-sculpture-scene";
import { localhostContent } from "@/lib/content/localhost";

const experiment = localhostContent.experiments.find(
  e => e.href === "/localhost/glass-sculpture"
);

export const metadata: Metadata = {
  title: experiment?.title,
  robots: {
    index: false,
    follow: false,
  },
};

/** vgpu's glass-sculpture example, on the dark experiment shell. */
export default function Page() {
  return (
    <CustomExperimentPage theme="dark" title={experiment?.title ?? ""}>
      <GlassSculptureScene />
    </CustomExperimentPage>
  );
}
