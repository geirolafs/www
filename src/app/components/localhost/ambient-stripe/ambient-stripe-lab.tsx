"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AmbientStripe } from "@/app/components/home/ambient-stripe/ambient-stripe";
import {
  type AmbientStripeSettings,
  DEFAULT_BACKGROUND,
  DEFAULT_TINT,
  PRESETS,
  VARIANTS,
} from "@/app/components/home/ambient-stripe/config";
import { usePageTint } from "@/app/components/home/ambient-stripe/tint";
import { TextLink } from "@/app/components/home/text-link";
import { PillButton } from "@/app/components/shell/pill";
import { localhostContent } from "@/lib/content/localhost";
import {
  type AmbientStripeVariant,
  ambientStripeContent,
} from "@/lib/content/localhost-ambient-stripe";

/** What the panel starts from, before a preset or a `?v=` link. */
const DEFAULT_SETTINGS: AmbientStripeSettings = {
  variant: "Breath+wake+lantern",
  lanternStep: "magnet",
  strength: 1,
  showBar: false,
  grain: 0,
  core: 0,
  blend: "normal",
  background: DEFAULT_BACKGROUND,
  tint: DEFAULT_TINT,
};

function sameSettings(a: AmbientStripeSettings, b: AmbientStripeSettings) {
  return (Object.keys(a) as (keyof AmbientStripeSettings)[]).every(
    key => a[key] === b[key]
  );
}

function writeVariantToUrl(variant: AmbientStripeVariant) {
  const url = new URL(window.location.href);
  url.searchParams.set("v", variant);
  window.history.replaceState(null, "", url);
}

function isVariant(value: string | null): value is AmbientStripeVariant {
  return ambientStripeContent.variants.some(v => v.id === value);
}

/** One slider row: a muted label, the range, and its value to `digits`. */
function RangeRow({
  label,
  value,
  min,
  max,
  step,
  digits,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  digits: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="mt-md flex items-center gap-2">
      <span className="text-muted">{label}</span>
      <input
        className="flex-1 accent-foreground"
        max={max}
        min={min}
        onChange={event => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value}
      />
      <span className="w-8 text-right tabular-nums">{value.toFixed(digits)}</span>
    </label>
  );
}

/**
 * The stripe plus a floating settings panel — variant, lantern step, blend,
 * strength, grain, edge core, bar, page colour and tint, and presets that set
 * them all — so they can be compared on the real page. The variant lives in
 * `?v=` so it can be linked to; it is read after mount rather than through
 * `useSearchParams`, which would need a Suspense boundary around the whole
 * page for a dev-only control.
 */
export function AmbientStripeLab() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const { background, tint, ...stripe } = settings;
  const { variant, lanternStep, strength, showBar, grain, core, blend } = stripe;
  const update = <K extends keyof AmbientStripeSettings>(
    key: K,
    value: AmbientStripeSettings[K]
  ) => setSettings(current => ({ ...current, [key]: value }));

  const panelId = useId();
  const [panelOpen, setPanelOpen] = useState(true);
  const showRef = useRef<HTMLButtonElement>(null);
  const hideRef = useRef<HTMLButtonElement>(null);
  /** Set by a toggle, so focus follows it; not on first mount. */
  const moveFocusRef = useRef(false);

  // Hiding the panel unmounts the button that was pressed, which would drop
  // focus to the body; hand it to the button that takes its place instead.
  useEffect(() => {
    if (!moveFocusRef.current) {
      return;
    }
    moveFocusRef.current = false;
    (panelOpen ? hideRef : showRef).current?.focus();
  }, [panelOpen]);

  const togglePanel = (open: boolean) => {
    moveFocusRef.current = true;
    setPanelOpen(open);
  };

  usePageTint(background, tint);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("v");
    if (isVariant(fromUrl)) {
      setSettings(current => ({ ...current, variant: fromUrl }));
    }
  }, []);

  const applyPreset = (preset: AmbientStripeSettings) => {
    setSettings(preset);
    writeVariantToUrl(preset.variant);
  };

  const choose = (next: AmbientStripeVariant) => {
    update("variant", next);
    writeVariantToUrl(next);
  };

  const active = ambientStripeContent.variants.find(v => v.id === variant);

  return (
    <>
      {/* Unmounting the panel keeps every setting: they live up here. */}
      {!panelOpen && (
        <PillButton
          aria-controls={panelId}
          aria-expanded={false}
          className="fixed right-md bottom-md z-50 bg-background"
          onClick={() => togglePanel(true)}
          ref={showRef}
        >
          {ambientStripeContent.showLabel}
        </PillButton>
      )}
      <AmbientStripe {...stripe} />
      {panelOpen && (
        <section
          aria-label={ambientStripeContent.panelLabel}
          className="fixed right-md bottom-md z-50 max-h-[calc(100dvh-2*var(--spacing-md))] w-72 max-w-[calc(100vw-3rem)] overflow-y-auto overscroll-contain bg-background p-md font-regular text-foreground text-label"
          id={panelId}
        >
          <div className="mb-md flex items-baseline justify-between gap-md">
            <p className="text-muted">
              <TextLink href="/localhost">{localhostContent.backLabel}</TextLink>
            </p>
            <PillButton
              aria-controls={panelId}
              aria-expanded
              onClick={() => togglePanel(false)}
              ref={hideRef}
            >
              {ambientStripeContent.hideLabel}
            </PillButton>
          </div>
          <p className="text-muted">{ambientStripeContent.presetsLabel}</p>
          <div className="mt-1.5 mb-md flex flex-wrap gap-1.5">
            {ambientStripeContent.presets.map(preset => {
              const presetSettings = PRESETS[preset.id];
              if (!presetSettings) {
                return null;
              }
              return (
                <PillButton
                  key={preset.id}
                  onClick={() => applyPreset(presetSettings)}
                  pressed={sameSettings(settings, presetSettings)}
                >
                  {preset.label}
                </PillButton>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ambientStripeContent.variants.map(v => (
              <PillButton
                key={v.id}
                onClick={() => choose(v.id)}
                pressed={v.id === variant}
              >
                {v.label}
              </PillButton>
            ))}
          </div>
          <p className="mt-md text-pretty text-muted">{active?.description}</p>
          {VARIANTS[variant].lantern && (
            <div className="mt-md">
              <p className="text-muted">{ambientStripeContent.lanternStepLabel}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {ambientStripeContent.lanternSteps.map(step => (
                  <PillButton
                    key={step.id}
                    onClick={() => update("lanternStep", step.id)}
                    pressed={step.id === lanternStep}
                  >
                    {step.label}
                  </PillButton>
                ))}
              </div>
            </div>
          )}
          <div className="mt-md">
            <p className="text-muted">{ambientStripeContent.blendLabel}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {ambientStripeContent.blends.map(b => (
                <PillButton
                  key={b.id}
                  onClick={() => update("blend", b.id)}
                  pressed={b.id === blend}
                >
                  {b.label}
                </PillButton>
              ))}
            </div>
            <p className="mt-1.5 text-pretty text-muted">
              {ambientStripeContent.blends.find(b => b.id === blend)?.description}
            </p>
          </div>
          <RangeRow
            digits={2}
            label={ambientStripeContent.strengthLabel}
            max={2}
            min={0}
            onChange={v => update("strength", v)}
            step={0.05}
            value={strength}
          />
          <RangeRow
            digits={1}
            label={ambientStripeContent.grainLabel}
            max={6}
            min={0}
            onChange={v => update("grain", v)}
            step={0.5}
            value={grain}
          />
          <RangeRow
            digits={2}
            label={ambientStripeContent.coreLabel}
            max={1}
            min={0}
            onChange={v => update("core", v)}
            step={0.05}
            value={core}
          />
          <label className="mt-md flex items-center gap-2">
            <input
              checked={showBar}
              className="accent-foreground"
              onChange={event => update("showBar", event.target.checked)}
              type="checkbox"
            />
            <span className="text-muted">{ambientStripeContent.barLabel}</span>
          </label>
          <label className="mt-md flex items-center gap-2">
            <span className="text-muted">{ambientStripeContent.backgroundLabel}</span>
            <input
              className="h-5 w-8 cursor-pointer rounded-pill border-[length:var(--pill-border-width)] border-border-strong bg-transparent p-0 [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-pill [&::-webkit-color-swatch]:border-0"
              onChange={event => update("background", event.target.value)}
              type="color"
              value={background}
            />
            <span className="tabular-nums">{background}</span>
          </label>
          <RangeRow
            digits={2}
            label={ambientStripeContent.tintLabel}
            max={0.5}
            min={0}
            onChange={v => update("tint", v)}
            step={0.01}
            value={tint}
          />
        </section>
      )}
    </>
  );
}
