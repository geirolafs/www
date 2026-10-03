"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  FOCUS_CLASS,
  LABEL_CLASS,
} from "@/app/components/localhost/fluid-typography/styles";
import { ExampleSelect } from "@/app/components/localhost/skiptingar/example-select";
import { EDITOR_SETTINGS_ID } from "@/app/components/localhost/skiptingar/live-editor";
import { usePlayground } from "@/app/components/localhost/skiptingar/playground";
import { SettingsPanel } from "@/app/components/localhost/skiptingar/settings-panel";
import { localhostSkiptingarClientContent } from "@/lib/content/localhost-skiptingar-client";
import { cn } from "@/lib/utils";

const { dock: content, liveEditor } = localhostSkiptingarClientContent;

/** True once the editor's own settings have scrolled up out of view. */
function usePastEditorSettings(): boolean {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const target = document.getElementById(EDITOR_SETTINGS_ID);
    if (!target) {
      return;
    }
    // The root reaches far below the screen, so "not intersecting" can only
    // mean "above it". A plain root misses a jump from below the screen to
    // above it, which is what the instant section links do.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setPast(!entry.isIntersecting);
        }
      },
      { rootMargin: "0px 0px 1000000px 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return past;
}

/**
 * The page settings, kept in reach while you read the other sections. It
 * shows once the editor's own settings have scrolled away: a square icon in
 * the bottom right corner. Hover or focus shows the current settings beside
 * it; a click opens the same controls and the example picker above it. Both write to the one provider, so a
 * change here moves every live specimen on the page.
 *
 * It moves with `transform` and `opacity` only, and not at all with reduced
 * motion. Hidden, it is `inert`, so it takes no focus. The panel comes after
 * the button in the document, so Tab goes from the button into it, and shows
 * above it (`flex-col-reverse`). It is a disclosure, not a dialog: it does not
 * take focus or trap it, and Escape closes it.
 */
export function SettingsDock() {
  const panelId = useId();
  const past = usePastEditorSettings();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { settings } = usePlayground();
  const visible = past || open;

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // The panel unmounts on close, and focus inside it would fall to the
        // body. Move it to the button first, and only when it was in the dock.
        if (rootRef.current?.contains(document.activeElement)) {
          buttonRef.current?.focus();
        }
        setOpen(false);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element;
      // A tip opens in the top layer, outside the dock, so a press on one
      // must not close the dock.
      if (!(rootRef.current?.contains(target) || target.closest?.("[popover]"))) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  // Label, and whether it is on.
  const switches = [
    [liveEditor.betterBreaks.label, settings.betterBreaks],
    [liveEditor.localeDetails.label, settings.localeDetails],
    [liveEditor.textWrap.label, settings.pretty],
    [liveEditor.showBreaks.label, settings.showBreaks],
  ] as const;

  return (
    <div
      className={cn(
        "fixed right-sm bottom-sm z-30 flex max-w-[calc(100vw-2*var(--spacing-sm))] flex-col-reverse items-end gap-xs transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      )}
      inert={!visible}
      ref={rootRef}
    >
      {/* The icon alone, until the pointer or focus is on it: then the
          current settings slide out to its left. The summary is inside the
          button, so hovering or clicking it counts as the button. Open, the
          summary hides and the icon turns into a close mark. */}
      <button
        aria-controls={open ? panelId : undefined}
        aria-expanded={open}
        aria-label={open ? content.close : content.open}
        className={cn(
          "group relative grid size-10 shrink-0 cursor-pointer place-items-center bg-foreground text-background shadow-hy-float",
          FOCUS_CLASS
        )}
        onClick={event => {
          // Safari does not focus a button on click, so a press that closes
          // the panel would leave focus on the body.
          if (open) {
            event.currentTarget.focus();
          }
          setOpen(current => !current);
        }}
        ref={buttonRef}
        type="button"
      >
        {open ? null : (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 right-full flex h-full translate-x-2 items-center gap-xs whitespace-nowrap bg-foreground pl-sm font-medium text-background text-hy-control opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
          >
            {/* Off is struck through and muted. */}
            {switches.map(([label, on]) => (
              <span className={cn(!on && "line-through opacity-50")} key={label}>
                {label}
              </span>
            ))}
          </span>
        )}
        {open ? (
          <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
          </svg>
        ) : (
          // Two sliders: the settings.
          <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
            <path
              d="M2 5h12M2 11h12"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
            <rect fill="currentColor" height="4" width="2.5" x="9" y="3" />
            <rect fill="currentColor" height="4" width="2.5" x="4.5" y="9" />
          </svg>
        )}
      </button>

      {open ? (
        <section
          aria-label={content.label}
          className="flex max-h-[70dvh] max-w-full flex-col gap-md overflow-y-auto border border-hy-track bg-background p-md shadow-hy-float"
          id={panelId}
        >
          <div className="flex items-center justify-between gap-md">
            <h2 className={LABEL_CLASS}>{content.label}</h2>
            <ExampleSelect />
          </div>
          <SettingsPanel layout="row" />
        </section>
      ) : null}
    </div>
  );
}
