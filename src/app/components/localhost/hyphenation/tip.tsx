"use client";

import type {
  FocusEvent as ReactFocusEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from "react";
import { useEffect, useId, useRef, useState } from "react";
import { FOCUS_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { localhostHyphenationClientContent } from "@/lib/content/localhost-hyphenation-client";
import { cn } from "@/lib/utils";

const { tips } = localhostHyphenationClientContent;

/**
 * Tooltips on the platform, with no positioning code of our own:
 *
 * - The tip is a manual popover. It sits in the top layer, so no parent can
 *   clip it, and it is `display: none` while closed. The `popover="manual"`
 *   element is also the `role="tooltip"`, and the trigger points at it with
 *   `aria-describedby`.
 * - CSS anchor positioning puts it under the trigger (`position-area`), and
 *   `position-try-fallbacks` flips it above when there is no room below.
 * - A manual popover has no light dismiss and no trigger of its own, so the
 *   hook below keeps three reasons to show it: the pointer is over it
 *   (`hovered`), the trigger has keyboard focus (`focused`), or it was pinned
 *   by a tap or by Enter or Space (`pinned`). It shows while any one holds.
 *   Escape clears all three and a press elsewhere clears the pointer and the
 *   pin, so the tip stays closed until the next hover, focus or pin. That is
 *   also how a keyboard user brings it back after Escape: Enter or Space on
 *   the focused trigger pins it. A keyboard click only ever pins, so it can
 *   never close a tip that focus opened.
 * - Focus counts only when the browser would draw a focus ring (`:focus-visible`,
 *   so keyboard focus). A mouse click also focuses the button in Chrome and
 *   Firefox, and that must not hold the tip open once the pointer leaves.
 *   Blur clears the pin as well, so Tab never leaves two tips open.
 */
function useTip() {
  const reactId = useId();
  // A dashed ident is what `anchor-name` takes; React's ids hold `:` or `«»`.
  const anchorName = `--tip-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);
  const visible = hovered || focused || pinned;

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }
    const isOpen = panel.matches(":popover-open");
    if (visible && !isOpen) {
      panel.showPopover();
    } else if (!visible && isOpen) {
      panel.hidePopover();
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHovered(false);
        setFocused(false);
        setPinned(false);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setHovered(false);
        setPinned(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [visible]);

  const rootProps = {
    ref: rootRef,
    onPointerEnter: (event: ReactPointerEvent) => {
      if (event.pointerType === "mouse") {
        setHovered(true);
      }
    },
    onPointerLeave: (event: ReactPointerEvent) => {
      if (event.pointerType === "mouse") {
        setHovered(false);
      }
    },
  };
  const triggerProps = {
    "aria-describedby": reactId,
    type: "button" as const,
    // A dynamic value: every trigger needs an anchor name of its own.
    style: { anchorName },
    onFocus: (event: ReactFocusEvent<HTMLButtonElement>) => {
      setFocused(event.currentTarget.matches(":focus-visible"));
    },
    onBlur: () => {
      setFocused(false);
      setPinned(false);
    },
    // A touch has no hover, and Safari does not focus a button on tap, so a
    // tap opens the tip itself, and a second tap closes it.
    onPointerDown: (event: ReactPointerEvent) => {
      if (event.pointerType === "mouse") {
        return;
      }
      if (visible) {
        setHovered(false);
        setFocused(false);
        setPinned(false);
      } else {
        setPinned(true);
      }
    },
    // `detail` is 0 for a click from Enter or Space. It only pins.
    onClick: (event: ReactMouseEvent) => {
      if (event.detail === 0) {
        setPinned(true);
      }
    },
  };

  return { id: reactId, anchorName, panelRef, rootProps, triggerProps };
}

function Panel({
  id,
  anchorName,
  panelRef,
  children,
}: {
  id: string;
  anchorName: string;
  panelRef: RefObject<HTMLSpanElement | null>;
  children: string;
}) {
  return (
    // The popover box is transparent and padded, so the pointer can cross
    // from the trigger to the tip without leaving it. The visible panel is the
    // inner span. `inset-auto m-0` undo the browser's centring of a popover.
    // 16rem keeps a tip readable and inside a 375px screen.
    <span
      className="inset-auto m-0 overflow-visible border-0 bg-transparent px-0 py-2xs text-inherit [justify-self:anchor-center] [position-area:block-end_span-all] [position-try-fallbacks:flip-block]"
      id={id}
      popover="manual"
      ref={panelRef}
      role="tooltip"
      // A dynamic value: it names this tip's own trigger.
      style={{ positionAnchor: anchorName }}
    >
      <span className="block w-max max-w-[16rem] whitespace-normal rounded-pill bg-foreground px-xs py-2xs text-left font-book text-background text-meta normal-case">
        {children}
      </span>
    </span>
  );
}

type TipProps = {
  /** The explanation. It is never the only place the information lives. */
  tip: string;
  /** The term the tip explains. It becomes the trigger. */
  children: ReactNode;
  /** Classes for the trigger, for type that its parent does not pass down. */
  className?: string;
};

/**
 * A term with a tooltip. The term itself is the trigger: a button with a
 * dotted underline.
 */
export function Tip({ tip, children, className }: TipProps) {
  const { id, anchorName, panelRef, rootProps, triggerProps } = useTip();

  return (
    <span className="relative inline-block" {...rootProps}>
      <button
        className={cn(
          "cursor-help text-left underline decoration-muted decoration-dotted underline-offset-4 hover:decoration-foreground",
          FOCUS_CLASS,
          className
        )}
        {...triggerProps}
      >
        {children}
      </button>
      <Panel anchorName={anchorName} id={id} panelRef={panelRef}>
        {tip}
      </Panel>
    </span>
  );
}

/**
 * A small "i" button for a control whose label is not a button itself. `name`
 * is what the tip is about; it becomes the button's accessible name. The
 * button is a 24px hit area around a 12px solid circle, so a thumb can find it.
 */
export function HelpTip({ tip, name }: { tip: string; name: string }) {
  const { id, anchorName, panelRef, rootProps, triggerProps } = useTip();

  return (
    <span className="relative inline-block" {...rootProps}>
      <button
        aria-label={tips.help(name)}
        className={cn("flex size-6 cursor-help items-center justify-center", FOCUS_CLASS)}
        {...triggerProps}
      >
        <span
          aria-hidden="true"
          className="flex size-3 items-center justify-center rounded-full bg-foreground font-semibold text-background text-hy-mark"
        >
          {tips.mark}
        </span>
      </button>
      <Panel anchorName={anchorName} id={id} panelRef={panelRef}>
        {tip}
      </Panel>
    </span>
  );
}
