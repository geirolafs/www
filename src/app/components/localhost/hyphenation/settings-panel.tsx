"use client";

import {
  ChoiceGroup,
  ControlGroup,
  HintLine,
  Switch,
  useHints,
} from "@/app/components/localhost/hyphenation/choice-group";
import { usePlayground } from "@/app/components/localhost/hyphenation/playground";
import { localhostHyphenationClientContent } from "@/lib/content/localhost-hyphenation-client";
import { cn } from "@/lib/utils";

const { liveEditor: content } = localhostHyphenationClientContent;

/**
 * The page settings: mode, rules and the three switches. They set every live
 * specimen on the page, not just the editor. The editor shows them in its
 * header column, and the dock shows the same controls once that column has
 * scrolled away; both write to one `PlaygroundProvider`.
 *
 * No label carries a mark for its explanation. The line under the controls
 * shows what the setting under the pointer, in focus or last tapped does.
 */
export function SettingsPanel({ layout }: { layout: "column" | "row" }) {
  const { settings, setSetting } = usePlayground();
  const { tip, HintProvider, report, areaProps } = useHints();

  return (
    <HintProvider value={report}>
      <div className="flex flex-col gap-xl" {...areaProps}>
        <div
          className={cn(
            "flex flex-wrap items-start gap-x-xl gap-y-md",
            layout === "column" && "lg:flex-col lg:gap-xl"
          )}
        >
          <ChoiceGroup
            label={content.mode.label}
            onChange={value => setSetting("mode", value)}
            options={content.mode.options}
            tip={content.mode.tip}
            value={settings.mode}
          />
          <ChoiceGroup
            label={content.rules.label}
            onChange={value => setSetting("rules", value)}
            options={content.rules.options}
            tip={content.rules.tip}
            value={settings.rules}
          />
          <ControlGroup label={content.options.label}>
            <Switch
              checked={settings.typeset}
              label={content.typeset.label}
              onChange={value => setSetting("typeset", value)}
              tip={content.typeset.tip}
            />
            <Switch
              checked={settings.showBreaks}
              label={content.showBreaks.label}
              onChange={value => setSetting("showBreaks", value)}
              tip={content.showBreaks.tip}
            />
            <Switch
              checked={settings.rag}
              label={content.rag.label}
              onChange={value => setSetting("rag", value)}
              tip={content.rag.tip}
            />
            <Switch
              checked={settings.overhang}
              label={content.overhang.label}
              onChange={value => setSetting("overhang", value)}
              tip={content.overhang.tip}
            />
            <Switch
              checked={settings.tighten}
              label={content.tighten.label}
              onChange={value => setSetting("tighten", value)}
              tip={content.tighten.tip}
            />
            <Switch
              checked={settings.pretty}
              // Settle rag picks every break itself, so `text-wrap` has
              // nothing left to do while it is on.
              inactive={settings.rag}
              label={content.textWrap.label}
              onChange={value => setSetting("pretty", value)}
              tip={content.textWrap.tip}
            />
          </ControlGroup>
        </div>
        <HintLine
          className="max-w-80"
          placeholder={content.hint}
          reserve={[
            content.mode.tip,
            content.rules.tip,
            content.typeset.tip,
            content.showBreaks.tip,
            content.rag.tip,
            content.overhang.tip,
            content.tighten.tip,
            content.textWrap.tip,
          ]}
          tip={tip}
        />
      </div>
    </HintProvider>
  );
}
