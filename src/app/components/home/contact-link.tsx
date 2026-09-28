"use client";

import posthog from "posthog-js";
import { TextLink } from "@/app/components/home/text-link";

type ContactLinkProps = {
  label: string;
  href: string;
  external?: boolean;
  className?: string;
  /**
   * Which band of the page the link sits in. Required rather than defaulted,
   * because the email address appears in both and `label` alone cannot tell
   * the two apart — a silent default would quietly merge them back together
   * the next time a third one is added.
   */
  location: "intro" | "footer";
};

/**
 * A footer contact link that reports itself to PostHog as
 * `contact_link_clicked`, carrying the visible label as the only property.
 *
 * One event across email, cv, linkedin and github rather than one event each.
 * The redesign replaced a magnetic logo, a social row and a copy-to-clipboard
 * button with this single row, so the interesting question is which of the four
 * a visitor reaches for — a shared event with a `label` breakdown answers that
 * in one insight, and survives adding a fifth link without a code change.
 *
 * `location` splits that event by band. The availability line under the
 * introduction carries the same address as the footer, so `label` alone stops
 * being enough to tell them apart — and the two answer different questions
 * ("did the availability line work?" versus "which of the four did they reach
 * for?").
 *
 * Kept apart from `contact-footer` so the footer's grid stays on the server;
 * this leaf is the only part of it that has to ship as client code.
 *
 * `download cv` navigates to a PDF, which can unload the page before a queued
 * request goes out. posthog-js sends with `keepalive`, so the event survives.
 */
export function ContactLink({
  label,
  href,
  external,
  className,
  location,
}: ContactLinkProps) {
  return (
    <TextLink
      className={className}
      external={external}
      href={href}
      onClick={() => posthog.capture("contact_link_clicked", { label, location })}
    >
      {label}
    </TextLink>
  );
}
