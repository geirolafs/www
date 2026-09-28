import type { CSSProperties } from "react";
import { EntryRow } from "@/app/components/home/entry-row";
import { SectionWrapper } from "@/app/components/home/section-wrapper";
import { selectedWorkContent } from "@/lib/content/home";

export function SelectedWork() {
  return (
    <SectionWrapper
      id="selected-work-heading"
      label={selectedWorkContent.label}
      reveal="items"
    >
      <ul
        className="flex flex-col gap-project lg:col-span-8 lg:grid lg:grid-cols-subgrid lg:gap-x-md"
        style={{ "--entry-year-gap": "var(--spacing-xs)" } as CSSProperties}
      >
        {selectedWorkContent.entries.map((entry, index) => (
          <EntryRow index={index + 1} key={entry.title} {...entry} />
        ))}
      </ul>
    </SectionWrapper>
  );
}
