"use client";

import { ContactLink } from "@/app/components/home/contact-link";
import { formatNextMonth } from "@/lib/availability";
import { availabilityContent } from "@/lib/content/home";
import { useMinuteTick } from "@/lib/hooks/use-minute-tick";

/**
 * The longest month name, and so the widest and most wrap-prone sentence this
 * line can produce. Rendered hidden before hydration so the box reserved is
 * always the worst case: whatever the real month turns out to be, it fits in
 * the space already held, and the header can only ever get shorter than the
 * reservation — never taller. That matters more here than the width does,
 * because this line wraps to two rows at the narrow end of `lg` and a
 * post-hydration wrap would shove the whole page down.
 */
const PLACEHOLDER_MONTH = "September";

type Props = {
  className?: string;
};

/**
 * The sentence itself: a rolling month and a mailto. `Availability` places it.
 *
 * Client-side for the same reason the clock is — a prerendered page bakes in
 * its build-time value, which Next flags outright and which is stale the
 * moment the month turns. `useMinuteTick` is far finer-grained than a month
 * needs, but it is the hook that already exists, it costs a re-render of two
 * text nodes, and its `visibilitychange` resync means a tab left open across
 * a month boundary corrects itself instead of sitting on a dead date.
 *
 * Split from the band that wraps it so `SectionWrapper` — and the page grid
 * logic it carries — stays on the server. This leaf is the only part that has
 * to ship as client code, the same split `contact-link` makes in the footer.
 *
 * The email is a `ContactLink`, so it reports to PostHog like every other
 * contact link on the page — tagged `intro` to keep it apart from the
 * identical address in the footer.
 */
export function AvailabilityLine({ className }: Props) {
  const now = useMinuteTick();
  const month = now ? formatNextMonth(now) : PLACEHOLDER_MONTH;
  const { lead, email } = availabilityContent;

  return (
    <p className={className} style={{ visibility: now ? undefined : "hidden" }}>
      {`${lead} ${month}. `}
      <ContactLink
        className="text-foreground"
        href={`mailto:${email}`}
        label={email}
        location="intro"
      />
    </p>
  );
}
