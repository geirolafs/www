import type { ReactNode } from "react";
import {
  LABEL_CLASS,
  NOTE_CLASS,
} from "@/app/components/localhost/fluid-typography/styles";
import { cn } from "@/lib/utils";

type StageProps = {
  number: number;
  title: string;
  note: string;
  /** "server" or "browser": named on a phone, where the brackets are hidden. */
  where: string;
  last?: boolean;
  children: ReactNode;
};

/** One stage: its number and name, the word as it is at that stage, and a note. */
export function Stage({ number, title, note, where, last, children }: StageProps) {
  return (
    <li className="relative flex min-w-0 flex-col gap-sm border border-hy-track bg-background p-sm">
      <div className="flex items-baseline justify-between gap-xs">
        <h4 className="flex items-baseline gap-2xs font-medium text-foreground text-hy-control">
          <span className="text-muted tabular-nums">{number}</span>
          {title}
        </h4>
        <span className={cn(LABEL_CLASS, "text-muted lg:hidden")}>{where}</span>
      </div>
      <div className="flex min-h-20 items-center">{children}</div>
      <p className={cn(NOTE_CLASS, "mt-auto")}>{note}</p>
      {last ? null : (
        // The arrow to the next stage sits in the gap: under the card on a
        // phone, to its right from `lg` up.
        <span
          aria-hidden="true"
          className="absolute -bottom-md left-1/2 z-10 grid size-6 -translate-x-1/2 translate-y-1/2 rotate-90 place-items-center border border-hy-track bg-background text-muted lg:top-1/2 lg:-right-md lg:bottom-auto lg:left-auto lg:translate-x-1/2 lg:-translate-y-1/2 lg:rotate-0"
        >
          <svg aria-hidden="true" className="size-3" fill="none" viewBox="0 0 12 12">
            <path
              d="M2.5 6h7M6.5 3l3 3-3 3"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
            />
          </svg>
        </span>
      )}
    </li>
  );
}
