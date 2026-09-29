import type { CSSProperties } from "react";
import { EntryRow } from "@/app/components/home/entry-row";
import { SectionWrapper } from "@/app/components/home/section-wrapper";
import {
  type AwardsSectionContent,
  awardsContent,
  type ExperienceSectionContent,
  experienceContent,
  selectedWorkContent,
} from "@/lib/content/home";

/**
 * Awards and Experience share a rhythm: 72 between mobile groups, 48 on
 * desktop. Selected Work's longer summaries get the roomier `gap-project`.
 */
function EntrySection({
  id,
  content,
  listClassName = "gap-group lg:gap-y-xl",
}: {
  id: string;
  content: AwardsSectionContent | ExperienceSectionContent | typeof selectedWorkContent;
  listClassName?: string;
}) {
  return (
    <SectionWrapper id={id} label={content.label} reveal="items">
      <ul
        className={`flex flex-col lg:col-span-8 lg:grid lg:grid-cols-subgrid lg:gap-x-md ${listClassName}`}
        style={{ "--entry-year-gap": "var(--spacing-xs)" } as CSSProperties}
      >
        {content.entries.map((entry, index) => (
          <EntryRow index={index + 1} key={entry.title} {...entry} />
        ))}
      </ul>
    </SectionWrapper>
  );
}

export function SelectedWork() {
  return (
    <EntrySection
      content={selectedWorkContent}
      id="selected-work-heading"
      listClassName="gap-project"
    />
  );
}

export function Experience() {
  return <EntrySection content={experienceContent} id="experience-heading" />;
}

export function Awards() {
  return <EntrySection content={awardsContent} id="awards-heading" />;
}
