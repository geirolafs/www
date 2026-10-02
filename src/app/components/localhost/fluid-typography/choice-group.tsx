"use client";

import type { ReactNode, PointerEvent as ReactPointerEvent } from "react";
import { createContext, useCallback, useContext, useId, useRef, useState } from "react";
import {
  FOCUS_CLASS,
  GROUP_LABEL_CLASS,
} from "@/app/components/localhost/fluid-typography/styles";
import { cn } from "@/lib/utils";

type HintSource = "hover" | "focus" | "tap";

/** `key` tells nested controls apart: a group and the option inside it. */
type HintContextValue = (source: HintSource, tip: string | null, key?: string) => void;

const HintContext = createContext<HintContextValue | null>(null);

/**
 * What a setting does, without a mark on every label: the controls inside
 * report the one under the pointer, the one with keyboard focus and the last
 * one tapped, and `useHints` returns the tip to show in one place. Hover wins
 * over focus, and focus over a tap, so the line follows what you are doing.
 */
export function useHints() {
  const [hints, setHints] = useState<Record<HintSource, string | null>>({
    hover: null,
    focus: null,
    tap: null,
  });
  // Every control under the pointer, outermost first: entering an option
  // inside a group puts it on top, leaving it shows the group's tip again.
  const hovered = useRef<{ key: string; tip: string }[]>([]);

  const set = useCallback((source: HintSource, tip: string | null) => {
    setHints(current =>
      current[source] === tip ? current : { ...current, [source]: tip }
    );
  }, []);
  const report = useCallback<HintContextValue>(
    (source, tip, key = "") => {
      if (source !== "hover") {
        set(source, tip);
        return;
      }
      const stack = hovered.current.filter(entry => entry.key !== key);
      if (tip !== null) {
        stack.push({ key, tip });
      }
      hovered.current = stack;
      // In the gap between two settings the last tip stays, so the line does
      // not flash back to its invitation; it clears when the pointer leaves
      // the whole panel (`areaProps`).
      const top = stack.at(-1)?.tip;
      if (top !== undefined) {
        set("hover", top);
      }
    },
    [set]
  );
  const areaProps = {
    onPointerLeave: (event: ReactPointerEvent) => {
      if (event.pointerType === "mouse") {
        hovered.current = [];
        set("hover", null);
      }
    },
  };
  const tip = hints.hover ?? hints.focus ?? hints.tap;
  return { tip, HintProvider: HintContext.Provider, report, areaProps };
}

/**
 * Props that report a control's tip while it is pointed at, focused from the
 * keyboard or tapped. Focus counts only with a focus ring (`:focus-visible`),
 * so a mouse click does not leave its tip behind once the pointer moves on. A
 * touch has no hover, so a tap shows the tip until the next tap elsewhere.
 * `describedBy` points the control at its tip for a screen reader, which reads
 * it from a hidden copy, not from the visible line.
 */
function useHint(tip: string | undefined) {
  const report = useContext(HintContext);
  const id = useId();
  if (!(tip && report)) {
    return { describedBy: undefined, description: null, handlers: {} };
  }
  const handlers = {
    onPointerEnter: (event: ReactPointerEvent) => {
      if (event.pointerType === "mouse") {
        report("hover", tip, id);
      }
    },
    onPointerLeave: (event: ReactPointerEvent) => {
      if (event.pointerType === "mouse") {
        report("hover", null, id);
      }
    },
    onPointerDown: (event: ReactPointerEvent) => {
      if (event.pointerType !== "mouse") {
        report("tap", tip);
      }
    },
    onFocus: (event: { target: Element }) => {
      report("focus", event.target.matches(":focus-visible") ? tip : null);
    },
    onBlur: () => report("focus", null),
  };
  const description = (
    <span className="sr-only" id={id}>
      {tip}
    </span>
  );
  return { describedBy: id, description, handlers };
}

/**
 * The line that shows the tip of the setting in use, or a quiet invitation
 * when none is. It is decoration for sighted readers: each control already
 * carries its tip with `aria-describedby`.
 *
 * It keeps the height of its longest text: every text in `reserve` sits in
 * the same grid cell, hidden, so a long tip never pushes the controls around
 * (in the dock, which grows upwards, that moved a setting out from under the
 * pointer and the tip flashed).
 */
export function HintLine({
  tip,
  placeholder,
  reserve = [],
  className,
}: {
  tip: string | null;
  placeholder: string;
  /** Every tip the line can show, to reserve the height of the longest. */
  reserve?: readonly string[];
  className?: string;
}) {
  const shown = tip ?? placeholder;
  return (
    <p
      aria-hidden="true"
      className={cn("grid text-pretty font-book text-hy-note text-muted", className)}
    >
      {[placeholder, ...reserve].map(text => (
        <span
          className={cn("col-start-1 row-start-1", text !== shown && "invisible")}
          key={text}
        >
          {text}
        </span>
      ))}
      {[placeholder, ...reserve].includes(shown) ? null : (
        <span className="col-start-1 row-start-1">{shown}</span>
      )}
    </p>
  );
}

type ControlGroupProps = {
  label: string;
  /** What the group means, shown in the panel's hint line. */
  tip?: string;
  children: ReactNode;
};

/**
 * A labelled group of controls, stacked. The `fieldset` and its `legend` name
 * the group for a screen reader, and its tip describes it.
 */
export function ControlGroup({ label, tip, children }: ControlGroupProps) {
  const { describedBy, description, handlers } = useHint(tip);

  return (
    <fieldset
      aria-describedby={describedBy}
      className="flex flex-col gap-2xs"
      {...handlers}
    >
      <legend className="sr-only">{label}</legend>
      {description}
      <span aria-hidden="true" className={cn(GROUP_LABEL_CLASS, "pb-1.5")}>
        {label}
      </span>
      {children}
    </fieldset>
  );
}

/**
 * A native switch: a checkbox with `role="switch"`, drawn square as a 32px
 * track and a 12px knob 2px in from its edge. Off, it is a white track with a
 * grey knob; on, a dark track with a white knob. The browser gives it the
 * checked state, Space to toggle and the announcement. Only the knob's
 * `transform` moves. The off track keeps a `border` edge, so it is 3:1
 * against the page.
 */
const SWITCH_INPUT = `relative h-[1.15rem] w-8 shrink-0 cursor-pointer appearance-none border border-border bg-background shadow-hy-control before:absolute before:inset-y-0 before:left-0.5 before:my-auto before:size-3 before:bg-border before:transition-transform before:duration-150 before:ease-out motion-reduce:before:transition-none checked:border-foreground checked:bg-foreground checked:before:translate-x-3.5 checked:before:bg-background ${FOCUS_CLASS}`;

const ROW_LABEL_CLASS =
  "flex cursor-pointer items-center gap-xs font-medium text-foreground text-hy-control";

type SwitchProps = {
  label: string;
  /** What the setting does, shown in the panel's hint line. */
  tip?: string;
  checked: boolean;
  /**
   * The setting has no effect right now. The switch keeps its value and its
   * focus, so its tip can say why, but it reads as off-limits and ignores
   * clicks and Space.
   */
  inactive?: boolean;
  onChange: (checked: boolean) => void;
};

/**
 * One on/off setting. An inactive switch is `aria-disabled`, not `disabled`:
 * a disabled input drops out of the tab order, and then a keyboard user could
 * never reach the tip that says why it does nothing.
 */
export function Switch({ label, tip, checked, inactive, onChange }: SwitchProps) {
  const { describedBy, description, handlers } = useHint(tip);

  return (
    <div className="flex" {...handlers}>
      {description}
      <label
        className={cn(
          ROW_LABEL_CLASS,
          "py-2xs",
          inactive && "cursor-not-allowed text-muted"
        )}
      >
        <input
          aria-describedby={describedBy}
          aria-disabled={inactive || undefined}
          checked={checked}
          className={cn(SWITCH_INPUT, inactive && "cursor-not-allowed opacity-40")}
          onChange={event => {
            if (!inactive) {
              onChange(event.target.checked);
            }
          }}
          // A checkbox flips itself before React sees the change; stop it.
          onClick={event => {
            if (inactive) {
              event.preventDefault();
            }
          }}
          // biome-ignore lint/a11y/useAriaPropsForRole: a native checkbox already exposes its checked state; `aria-checked` would only repeat it.
          role="switch"
          type="checkbox"
        />
        <span>{label}</span>
      </label>
    </div>
  );
}
