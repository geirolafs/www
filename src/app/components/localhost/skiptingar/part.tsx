import type { ReactNode } from "react";
import {
  INTRO_CLASS,
  SUBTITLE_CLASS,
} from "@/app/components/localhost/fluid-typography/styles";
import { cn } from "@/lib/utils";

/**
 * A part of a section: its serif subtitle, the intro under it, then the rest.
 * The id is the anchor that links to the part.
 */
export function Part({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-xl">
      <div className="flex flex-col gap-xs">
        <h3 className={cn(SUBTITLE_CLASS, "scroll-mt-project")} id={id}>
          {title}
        </h3>
        <p className={cn(INTRO_CLASS, "max-w-measure")}>{intro}</p>
      </div>
      {children}
    </div>
  );
}
