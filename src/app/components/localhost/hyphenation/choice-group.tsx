"use client";

import type { ReactNode } from "react";
import { useId } from "react";
import {
  FOCUS_CLASS,
  GROUP_LABEL_CLASS,
} from "@/app/components/localhost/hyphenation/styles";
import { HelpTip } from "@/app/components/localhost/hyphenation/tip";
import { cn } from "@/lib/utils";

type Option<T extends string> = { readonly value: T; readonly label: string };

type ControlGroupProps = {
  label: string;
  /** Leave the visible label out when the surrounding text already names it. */
  hideLabel?: boolean;
  /** What the group means. Adds an "i" button after the label. */
  tip?: string;
  children: ReactNode;
};

/**
 * A labelled group of controls, stacked. The `fieldset` and its `legend` name
 * the group for a screen reader; the visible label is drawn separately so the
 * tip button can sit beside it.
 */
export function ControlGroup({ label, hideLabel, tip, children }: ControlGroupProps) {
  return (
    <fieldset className="flex flex-col gap-2xs">
      <legend className="sr-only">{label}</legend>
      {hideLabel ? null : (
        // The space under the row, not the label, so the label and the "i"
        // share one centre line. The "i" is a 24px hit area around a 12px
        // dot, so a 2px gap puts the dot 8px after the word.
        <div className="flex min-h-6 items-center gap-0.5 pb-1.5">
          <span aria-hidden="true" className={GROUP_LABEL_CLASS}>
            {label}
          </span>
          {tip ? <HelpTip name={label} tip={tip} /> : null}
        </div>
      )}
      {children}
    </fieldset>
  );
}

/**
 * A native radio, redrawn: a 16px ring, filled with a dot when checked. The
 * dot is the input's own `::before`. The ring is `border`, not the lighter
 * grey of the design, because it has to be 3:1 against the page.
 */
const RADIO_INPUT = `grid size-4 shrink-0 cursor-pointer appearance-none place-content-center rounded-full border border-border bg-background before:size-2 before:scale-0 before:rounded-full before:bg-background checked:border-foreground checked:bg-foreground checked:before:scale-100 ${FOCUS_CLASS}`;

/**
 * A native switch: a checkbox with `role="switch"`, drawn as a 32px track and
 * a 14px knob. The browser gives it the checked state, Space to toggle and the
 * announcement. Only the knob's `transform` moves. The off track keeps a
 * `border` ring, because the light fill alone is not 3:1 against the page.
 */
const SWITCH_INPUT = `relative h-[1.15rem] w-8 shrink-0 cursor-pointer appearance-none rounded-full border border-border bg-hy-track before:absolute before:inset-y-0 before:left-px before:my-auto before:size-3.5 before:rounded-full before:bg-background before:transition-transform before:duration-150 before:ease-out motion-reduce:before:transition-none checked:border-foreground checked:bg-foreground checked:before:translate-x-3.5 ${FOCUS_CLASS}`;

const ROW_LABEL_CLASS =
  "flex cursor-pointer items-center gap-xs font-medium text-foreground text-hy-control";

type ChoiceGroupProps<T extends string> = {
  label: string;
  hideLabel?: boolean;
  tip?: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * Pick one of a few values. It is a native radio group: the browser gives it
 * the arrow-key movement, the one-in-the-group rule and the announcements. Each
 * row is a `label`, so the text is clickable too.
 */
export function ChoiceGroup<T extends string>({
  label,
  hideLabel,
  tip,
  options,
  value,
  onChange,
}: ChoiceGroupProps<T>) {
  const name = useId();

  return (
    <ControlGroup hideLabel={hideLabel} label={label} tip={tip}>
      {options.map(option => (
        <label className={cn(ROW_LABEL_CLASS, "min-h-6")} key={option.value}>
          <input
            checked={option.value === value}
            className={RADIO_INPUT}
            name={name}
            onChange={() => onChange(option.value)}
            type="radio"
            value={option.value}
          />
          {option.label}
        </label>
      ))}
    </ControlGroup>
  );
}

type SwitchProps = {
  label: string;
  /** What the setting does. Adds an "i" button after the label. */
  tip?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

/** One on/off setting. */
export function Switch({ label, tip, checked, onChange }: SwitchProps) {
  return (
    <div className="flex items-center gap-0.5">
      <label className={cn(ROW_LABEL_CLASS, "py-2xs")}>
        <input
          checked={checked}
          className={SWITCH_INPUT}
          onChange={event => onChange(event.target.checked)}
          // biome-ignore lint/a11y/useAriaPropsForRole: a native checkbox already exposes its checked state; `aria-checked` would only repeat it.
          role="switch"
          type="checkbox"
        />
        <span>{label}</span>
      </label>
      {tip ? <HelpTip name={label} tip={tip} /> : null}
    </div>
  );
}
