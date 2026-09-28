import type { CSSProperties } from "react";
import { EntryRow } from "@/app/components/home/entry-row";
import { SectionWrapper } from "@/app/components/home/section-wrapper";
import {
  type AwardsSectionContent,
  awardsContent,
  type ExperienceSectionContent,
  experienceContent,
} from "@/lib/content/home";

/**
 * Awards and Work share a rhythm: 72 between mobile groups, 48 on desktop.
 * SelectedWork stays separate because its longer summaries need more space.
 */
function EntrySection({
  id,
  content,
}: {
  id: string;
  content: AwardsSectionContent | ExperienceSectionContent;
}) {
  return (
    <SectionWrapper id={id} label={content.label} reveal="items">
      <ul
        className="flex flex-col gap-group lg:col-span-8 lg:grid lg:grid-cols-subgrid lg:gap-x-md lg:gap-y-xl"
        style={{ "--entry-year-gap": "var(--spacing-xs)" } as CSSProperties}
      >
        {content.entries.map((entry, index) => (
          <EntryRow index={index + 1} key={entry.title} {...entry} />
        ))}
      </ul>
    </SectionWrapper>
  );
}

export function Experience() {
  return <EntrySection content={experienceContent} id="experience-heading" />;
}

export function Awards() {
  return <EntrySection content={awardsContent} id="awards-heading" />;
}
