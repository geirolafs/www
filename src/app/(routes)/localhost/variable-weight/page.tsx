import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ExperimentPage } from "@/app/components/localhost/experiment-page";
import { ArrowLink } from "@/app/components/localhost/variable-weight/arrow-link";
import { CopyEmailBtn } from "@/app/components/localhost/variable-weight/copy-email-btn";
import { VariableWeightText } from "@/app/components/localhost/variable-weight/variable-weight-text";
import { localhostContent } from "@/lib/content/localhost";
import { localhostVariableWeightContent } from "@/lib/content/localhost-variable-weight";

const experiment = localhostContent.experiments.find(
  e => e.href === "/localhost/variable-weight"
);

export const metadata: Metadata = {
  title: experiment?.title,
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * One sample on the notes-list anatomy: a label-sized column on 4–5 and the
 * sample on 6–11, both inherited from the page grid via subgrid, stacking on
 * mobile. The sample column lines up with the hero above it, so the samples
 * read as the page's body rather than a separate demo panel.
 */
function DemoRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <li className="grid grid-cols-1 gap-sm lg:col-span-8 lg:grid lg:grid-cols-subgrid lg:items-baseline lg:gap-x-md lg:gap-y-0">
      <div className="flex flex-col lg:col-span-2">
        <h2 className="font-regular text-foreground text-label">{label}</h2>
        {hint ? <p className="font-regular text-label text-muted">{hint}</p> : null}
      </div>
      <div className="lg:col-span-6">{children}</div>
    </li>
  );
}

/**
 * v1's /dev/variable-weight samples, restyled into the site: site type
 * tokens in place of v1's clamp sizes, the page grid in place of v1's padded
 * column. The effect is v1's untouched — see `VariableWeightText`.
 */
export default function Page() {
  const { sections } = localhostVariableWeightContent;

  return (
    <ExperimentPage
      description={experiment?.description ?? ""}
      title={experiment?.title ?? ""}
    >
      <ul className="flex flex-col gap-group lg:col-span-8 lg:col-start-4 lg:grid lg:grid-cols-subgrid lg:gap-y-xl">
        <DemoRow label={sections.default.label}>
          <VariableWeightText className="text-body text-foreground">
            {sections.default.sample}
          </VariableWeightText>
        </DemoRow>

        <DemoRow label={sections.display.label}>
          <VariableWeightText as="p" className="text-display text-foreground">
            {sections.display.sample}
          </VariableWeightText>
        </DemoRow>

        <DemoRow label={sections.body.label}>
          <VariableWeightText as="p" className="text-body text-foreground">
            {sections.body.sample}
          </VariableWeightText>
        </DemoRow>

        <DemoRow label={sections.meta.label}>
          <VariableWeightText as="p" className="text-foreground text-meta">
            {sections.meta.sample}
          </VariableWeightText>
        </DemoRow>

        <DemoRow label={sections.nav.label}>
          <nav className="flex gap-md text-foreground text-link">
            {sections.nav.links.map(link => (
              <VariableWeightText as="a" href="#" key={link}>
                {link}
              </VariableWeightText>
            ))}
          </nav>
        </DemoRow>

        <DemoRow hint={sections.layoutShift.hint} label={sections.layoutShift.label}>
          <div className="inline-block border border-border border-dashed p-sm">
            <VariableWeightText className="text-display text-foreground">
              {sections.layoutShift.sample}
            </VariableWeightText>
          </div>
        </DemoRow>

        <DemoRow hint={sections.duration.hint} label={sections.duration.label}>
          <VariableWeightText className="text-body text-foreground" duration={0.5}>
            {sections.duration.sample}
          </VariableWeightText>
        </DemoRow>

        <DemoRow label={sections.inline.label}>
          <p className="text-pretty font-book text-body text-muted">
            {sections.inline.before}{" "}
            <VariableWeightText className="text-foreground">
              {sections.inline.highlight}
            </VariableWeightText>{" "}
            {sections.inline.after}
          </p>
        </DemoRow>

        <DemoRow label={sections.arrowLink.label}>
          <div className="text-foreground text-link">
            <ArrowLink
              href={sections.arrowLink.href}
              newTabLabel={sections.arrowLink.newTab}
            >
              {sections.arrowLink.text}
            </ArrowLink>
          </div>
        </DemoRow>

        <DemoRow label={sections.copyEmail.label}>
          <div className="text-foreground text-link">
            <CopyEmailBtn email={sections.copyEmail.email} labels={sections.copyEmail} />
          </div>
        </DemoRow>

        <DemoRow hint={sections.touch.hint} label={sections.touch.label}>
          <div className="flex gap-md text-body text-foreground">
            {sections.touch.samples.map(sample => (
              <VariableWeightText key={sample}>{sample}</VariableWeightText>
            ))}
          </div>
        </DemoRow>
      </ul>
    </ExperimentPage>
  );
}
