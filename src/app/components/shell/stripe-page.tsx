import type { ReactNode } from "react";
import { SiteStripe } from "@/app/components/home";
import { cn } from "@/lib/utils";

/**
 * Page-level wrapper for the ambient stripe. The stripe must be the first child
 * of a `relative isolate` box: its `-z-10` glow then spans the whole wrapper,
 * stays in front of the page background, and sits under all the text.
 * Pass `stripe` to swap in another stripe (the localhost lab does).
 */
export function StripePage({
  children,
  className,
  stripe,
}: {
  children: ReactNode;
  className?: string;
  stripe?: ReactNode;
}) {
  return (
    <div className={cn("relative isolate", className)}>
      {stripe ?? <SiteStripe />}
      {children}
    </div>
  );
}
