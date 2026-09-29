import type { Metadata } from "next";
import { ExperimentPage } from "@/app/components/localhost/experiment-page";
import { PillSpecimen } from "@/app/components/localhost/pills/pill-specimen";
import { localhostContent } from "@/lib/content/localhost";
import { pillsContent } from "@/lib/content/localhost-pills";
import { cn } from "@/lib/utils";

const experiment = localhostContent.experiments.find(e => e.href === "/localhost/pills");

export const metadata: Metadata = {
  title: experiment?.title,
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Three centring strategies, each against lowercase, Sentence case and
 * UPPERCASE labels — first at size, then zoomed ×3, where a pixel of offset
 * becomes easy to see.
 */
export default function Page() {
  return (
    <ExperimentPage
      description={experiment?.description ?? ""}
      title={experiment?.title ?? ""}
    >
      <ul className="flex flex-col gap-group lg:col-span-8 lg:col-start-4 lg:grid lg:grid-cols-subgrid lg:gap-y-xl">
        {pillsContent.strategies.map(strategy => (
          <li
            className="grid grid-cols-1 gap-sm lg:col-span-8 lg:grid-cols-subgrid lg:gap-x-md lg:gap-y-0"
            key={strategy.id}
          >
            <div className="lg:col-span-2">
              <h2 className="font-medium text-body text-foreground">{strategy.title}</h2>
              <p className="mt-2xs text-pretty font-book text-label text-muted">
                {strategy.note}
              </p>
            </div>
            <div className="flex flex-col gap-md lg:col-span-6">
              {[1, 3].map(zoom => (
                <div
                  className={cn("flex flex-col gap-sm", zoom === 3 && "[zoom:3]")}
                  key={zoom}
                >
                  {pillsContent.casings.map(casing => (
                    <div
                      className="flex flex-wrap items-center gap-xs"
                      key={casing.title}
                    >
                      {casing.labels.map(label => (
                        <PillSpecimen key={label} label={label} strategy={strategy.id} />
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </ExperimentPage>
  );
}
