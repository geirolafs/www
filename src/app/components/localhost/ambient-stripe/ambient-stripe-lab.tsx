"use client";

import { useEffect, useState } from "react";
import { TextLink } from "@/app/components/home/text-link";
import { PillText } from "@/app/components/shell/pill-text";
import { localhostContent } from "@/lib/content/localhost";
import {
  type AmbientStripeVariant,
  ambientStripeContent,
  type LanternStepId,
} from "@/lib/content/localhost-ambient-stripe";
import { cn } from "@/lib/utils";
import { AmbientStripe } from "./ambient-stripe";
import { type AmbientStripeSettings, PRESETS, VARIANTS } from "./config";

const DEFAULT_VARIANT: AmbientStripeVariant = "Breath+wake+lantern";

function isVariant(value: string | null): value is AmbientStripeVariant {
  return ambientStripeContent.variants.some(v => v.id === value);
}

/**
 * The stripe plus a floating picker, so the variants can be compared on the
 * real page. The choice lives in `?v=` so a variant can be linked to; it is
 * read after mount rather than through `useSearchParams`, which would need a
 * Suspense boundary around the whole page for a dev-only control.
 */
export function AmbientStripeLab() {
  const [variant, setVariant] = useState<AmbientStripeVariant>(DEFAULT_VARIANT);
  const [strength, setStrength] = useState(1);
  const [showBar, setShowBar] = useState(false);
  const [lanternStep, setLanternStep] = useState<LanternStepId>("magnet");

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("v");
    if (isVariant(fromUrl)) {
      setVariant(fromUrl);
    }
  }, []);

  const applyPreset = (preset: AmbientStripeSettings) => {
    choose(preset.variant);
    setLanternStep(preset.lanternStep);
    setStrength(preset.strength);
    setShowBar(preset.showBar);
  };

  const choose = (next: AmbientStripeVariant) => {
    setVariant(next);
    const url = new URL(window.location.href);
    url.searchParams.set("v", next);
    window.history.replaceState(null, "", url);
  };

  const active = ambientStripeContent.variants.find(v => v.id === variant);

  return (
    <>
      <AmbientStripe
        lanternStep={lanternStep}
        showBar={showBar}
        strength={strength}
        variant={variant}
      />
      <section
        aria-label={ambientStripeContent.panelLabel}
        className="fixed right-md bottom-md z-50 w-72 max-w-[calc(100vw-3rem)] rounded-pill border border-border bg-background p-md font-regular text-foreground text-label"
      >
        <p className="mb-md text-muted">
          <TextLink href="/localhost">{localhostContent.backLabel}</TextLink>
        </p>
        <p className="text-muted">{ambientStripeContent.presetsLabel}</p>
        <div className="mt-1.5 mb-md flex flex-wrap gap-1.5">
          {ambientStripeContent.presets.map(preset => {
            const settings = PRESETS[preset.id];
            if (!settings) {
              return null;
            }
            const isActive =
              settings.variant === variant &&
              settings.lanternStep === lanternStep &&
              settings.strength === strength &&
              settings.showBar === showBar;
            return (
              <button
                aria-pressed={isActive}
                className={cn(
                  "rounded-pill border px-2 py-0.5",
                  isActive ? "border-foreground" : "border-border text-muted"
                )}
                key={preset.id}
                onClick={() => applyPreset(settings)}
                type="button"
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ambientStripeContent.variants.map(v => (
            <button
              aria-pressed={v.id === variant}
              className={cn(
                "rounded-pill border px-2 py-0.5",
                v.id === variant ? "border-foreground" : "border-border text-muted"
              )}
              key={v.id}
              onClick={() => choose(v.id)}
              type="button"
            >
              <PillText>{v.label}</PillText>
            </button>
          ))}
        </div>
        <p className="mt-md text-pretty text-muted">{active?.description}</p>
        {VARIANTS[variant].lantern && (
          <div className="mt-md">
            <p className="text-muted">{ambientStripeContent.lanternStepLabel}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {ambientStripeContent.lanternSteps.map(step => (
                <button
                  aria-pressed={step.id === lanternStep}
                  className={cn(
                    "rounded-pill border px-2 py-0.5",
                    step.id === lanternStep
                      ? "border-foreground"
                      : "border-border text-muted"
                  )}
                  key={step.id}
                  onClick={() => setLanternStep(step.id)}
                  type="button"
                >
                  {step.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <label className="mt-md flex items-center gap-2">
          <span className="text-muted">{ambientStripeContent.strengthLabel}</span>
          <input
            className="flex-1 accent-foreground"
            max={2}
            min={0}
            onChange={event => setStrength(Number(event.target.value))}
            step={0.05}
            type="range"
            value={strength}
          />
          <span className="w-8 text-right tabular-nums">{strength.toFixed(2)}</span>
        </label>
        <label className="mt-md flex items-center gap-2">
          <input
            checked={showBar}
            className="accent-foreground"
            onChange={event => setShowBar(event.target.checked)}
            type="checkbox"
          />
          <span className="text-muted">{ambientStripeContent.barLabel}</span>
        </label>
      </section>
    </>
  );
}
