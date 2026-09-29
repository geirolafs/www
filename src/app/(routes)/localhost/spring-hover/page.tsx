import type { Metadata } from "next";
import { CustomExperimentPage } from "@/app/components/localhost/experiment-page";
import { SpringHover } from "@/app/components/localhost/spring-hover/spring-hover";
import { localhostContent } from "@/lib/content/localhost";
import { springHoverContent } from "@/lib/content/localhost-spring-hover";

const experiment = localhostContent.experiments.find(
  e => e.href === "/localhost/spring-hover"
);

export const metadata: Metadata = {
  title: experiment?.title,
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * v1's /dev/spring-hover. Its `Section` resolved to a centred flex box once
 * tailwind-merge dropped `grid` for the later `flex`; the side padding it
 * also carried comes from the shell here. Type is the shell's v1 size at
 * weight 650.
 */
export default function Page() {
  return (
    <CustomExperimentPage theme="light" title={experiment?.title ?? ""}>
      <div className="flex min-h-dvh w-full items-center justify-center">
        <SpringHover
          className="p-8"
          label={springHoverContent.label}
          lines={springHoverContent.lines}
        />
      </div>
    </CustomExperimentPage>
  );
}
