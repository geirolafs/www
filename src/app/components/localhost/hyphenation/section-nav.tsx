"use client";

import { useEffect, useState } from "react";
import { FOCUS_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { cn } from "@/lib/utils";

type NavSection = { id: string; number: string; nav: string };

/**
 * Which section is current: the last one whose top has passed a line a
 * quarter of the way down the screen. The observer wakes the check only when
 * a section's edge crosses that line, so nothing runs on every scroll frame.
 */
function useCurrentSection(idList: string): string | null {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const elements = idList
      .split(" ")
      .map(id => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) {
      return;
    }
    const pick = () => {
      // A section is current once its title is comfortably in view.
      const line = window.innerHeight / 4;
      let found: string | null = null;
      for (const element of elements) {
        if (element.getBoundingClientRect().top <= line) {
          found = element.id;
        }
      }
      setCurrent(found);
    };
    // A thin band a quarter of the way down: a section's edge crossing it is
    // the only time the answer can change.
    const observer = new IntersectionObserver(pick, { rootMargin: "-25% 0px -74% 0px" });
    for (const element of elements) {
      observer.observe(element);
    }
    pick();
    return () => observer.disconnect();
  }, [idList]);

  return current;
}

/**
 * The section links in the top bar. The current section's link is underlined
 * and carries `aria-current="location"`. Below 1440px it shows the letter
 * only: eight names with room between them do not fit beside the page name
 * until then. The name stays for screen readers. From 1440px up it reads
 * "A. Editor".
 */
export function SectionNav({
  label,
  sections,
}: {
  label: string;
  sections: readonly NavSection[];
}) {
  // One string, so the observers are set up once, not on every render.
  const current = useCurrentSection(sections.map(section => section.id).join(" "));

  return (
    <nav aria-label={label} className="col-span-5 lg:col-span-8">
      {/* `justify-between` spreads the links over the columns; with names
          showing, the gap is the least space between two. */}
      <ul className="flex justify-between whitespace-nowrap min-[90rem]:gap-x-md">
        {sections.map(section => {
          const active = section.id === current;
          return (
            <li key={section.id}>
              <a
                aria-current={active ? "location" : undefined}
                className={cn(
                  "inline-block min-w-5 py-2xs text-center font-regular text-foreground text-hy-nav underline-offset-6 hover:text-muted min-[22.5rem]:min-w-6 min-[90rem]:min-w-0 min-[90rem]:text-left",
                  // The current section is the one thing in the bar that must
                  // be seen at a glance: a red rule under it.
                  active ? "underline decoration-2 decoration-hy-signal" : "no-underline",
                  FOCUS_CLASS
                )}
                href={`#${section.id}`}
                title={section.nav}
              >
                {section.number}
                <span className="max-[90rem]:sr-only">. {section.nav}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
