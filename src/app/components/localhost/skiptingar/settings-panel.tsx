"use client";

import {
  ControlGroup,
  HintLine,
  Switch,
  useHints,
} from "@/app/components/localhost/fluid-typography/choice-group";
import { usePlayground } from "@/app/components/localhost/skiptingar/playground";
import { localhostSkiptingarClientContent } from "@/lib/content/localhost-skiptingar-client";
import { cn } from "@/lib/utils";

const { liveEditor: content } = localhostSkiptingarClientContent;

/**
 * The page settings, four switches. They set every live specimen on the
 * page, not just the editor. The editor shows them in its
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
          <ControlGroup label={content.options.label}>
            <Switch
              checked={settings.typographic}
              label={content.typographic.label}
              onChange={value => setSetting("typographic", value)}
              tip={content.typographic.tip}
            />
            <Switch
              checked={settings.localeDetails}
              label={content.localeDetails.label}
              onChange={value => setSetting("localeDetails", value)}
              tip={content.localeDetails.tip}
            />
            <Switch
              checked={settings.pretty}
              label={content.textWrap.label}
              onChange={value => setSetting("pretty", value)}
              tip={content.textWrap.tip}
            />
            <Switch
              checked={settings.showBreaks}
              label={content.showBreaks.label}
              onChange={value => setSetting("showBreaks", value)}
              tip={content.showBreaks.tip}
            />
          </ControlGroup>
        </div>
        <HintLine
          className="max-w-80"
          placeholder={content.hint}
          reserve={[
            content.typographic.tip,
            content.localeDetails.tip,
            content.showBreaks.tip,
            content.textWrap.tip,
          ]}
          tip={tip}
        />
      </div>
    </HintProvider>
  );
}
