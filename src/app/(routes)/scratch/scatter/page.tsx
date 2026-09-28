import type { Metadata } from "next";
import { ScatterText } from "@/app/components/home";
import type { ScatterLine } from "@/app/components/home/scatter-text";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

// Non-breaking spaces are deliberate: they stop each number group wrapping
// mid-run at narrow widths, which the source's own reference card avoided
// the same way.
const SCATTER_LINES: ScatterLine[] = [
  { prefix: "R", content: "2200 15 032293" },
  { prefix: "V.No.", content: "154882" },
];

/**
 * Preview-only route for the repulsion-field text port (see
 * `scatter-text.tsx`). Not linked from the footer, home page, or any nav —
 * `robots: { index: false, follow: false }` above keeps it out of search,
 * and it is deliberately absent from `sitemap.ts`.
 */
export default function Page() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-section px-6 text-center">
      <p className="text-balance text-meta text-muted">
        Scratch preview — a pointer-repulsion text effect, not wired into the site yet.
      </p>
      <ScatterText className="text-foreground text-label" lines={SCATTER_LINES} />
    </main>
  );
}
