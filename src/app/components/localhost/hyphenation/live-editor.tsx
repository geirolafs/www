"use client";

import { useId, useState } from "react";
import {
  ChoiceGroup,
  ControlGroup,
  Switch,
} from "@/app/components/localhost/hyphenation/choice-group";
import { MarkedText } from "@/app/components/localhost/hyphenation/marked-text";
import {
  EDITOR_CLASS,
  FOCUS_CLASS,
  GROUP_LABEL_CLASS,
  LABEL_CLASS,
  TITLE_CLASS,
} from "@/app/components/localhost/hyphenation/styles";
import { HelpTip, Tip } from "@/app/components/localhost/hyphenation/tip";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";
import { useHyphenate } from "@/packages/skiptingar/src/client";

const { liveEditor: content, tips } = localhostHyphenationContent;

type Mode = (typeof content.mode.options)[number]["value"];
type Rules = (typeof content.rules.options)[number]["value"];

const SOFT_HYPHEN = "­";
const NO_BREAK_SPACE = " ";

function count(text: string, character: string): number {
  return text.split(character).length - 1;
}

/**
 * The text you type, run through the engine in the browser, in a box you can
 * resize. The engine loads on first render as its own chunk, so until then
 * the box shows the text as typed.
 */
export function LiveEditor() {
  const textId = useId();
  const widthId = useId();
  const [text, setText] = useState<string>(content.initialText);
  const [mode, setMode] = useState<Mode>("body");
  const [rules, setRules] = useState<Rules>("typographic");
  const [typeset, setTypeset] = useState(true);
  const [showBreaks, setShowBreaks] = useState(false);
  const [pretty, setPretty] = useState(true);
  const [width, setWidth] = useState<number>(content.width.initial);

  const output = useHyphenate(text, { mode, rules, typeset });
  const isHeading = mode === "heading";

  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-col gap-xs">
        <label className={LABEL_CLASS} htmlFor={textId}>
          {content.textLabel}
        </label>
        <textarea
          className={cn(
            EDITOR_CLASS,
            "w-full rounded-pill border border-border bg-transparent px-2.5 py-2xs",
            FOCUS_CLASS
          )}
          id={textId}
          lang="is"
          onChange={event => setText(event.target.value)}
          rows={5}
          value={text}
        />
      </div>

      <div className="flex flex-col gap-sm">
        <div className="flex flex-wrap items-start gap-x-xl gap-y-md">
          <ChoiceGroup
            label={content.mode.label}
            onChange={setMode}
            options={content.mode.options}
            tip={content.mode.tip}
            value={mode}
          />
          <ChoiceGroup
            label={content.rules.label}
            onChange={setRules}
            options={content.rules.options}
            tip={content.rules.tip}
            value={rules}
          />
          <ControlGroup label={content.options.label}>
            <Switch
              checked={typeset}
              label={content.typeset.label}
              onChange={setTypeset}
              tip={content.typeset.tip}
            />
            <Switch
              checked={showBreaks}
              label={content.showBreaks.label}
              onChange={setShowBreaks}
              tip={content.showBreaks.tip}
            />
            <Switch
              checked={pretty}
              label={content.textWrap.label}
              onChange={setPretty}
              tip={content.textWrap.tip}
            />
          </ControlGroup>
        </div>
        <div className="flex items-center gap-xs">
          <label className={cn(GROUP_LABEL_CLASS, "pb-0")} htmlFor={widthId}>
            {content.width.label}
          </label>
          <HelpTip name={content.width.label} tip={content.width.tip} />
          <input
            className="flex-1 accent-foreground"
            id={widthId}
            max={content.width.max}
            min={content.width.min}
            onChange={event => setWidth(Number(event.target.value))}
            step={content.width.step}
            type="range"
            value={width}
          />
          {/* Tabular figures, so the readout does not jitter as you drag. */}
          <output
            className="w-16 text-right font-medium text-foreground text-hy-control tabular-nums"
            htmlFor={widthId}
          >
            {content.width.value(width)}
          </output>
        </div>
      </div>

      <div
        className={cn(
          "max-w-full hyphens-manual border border-border border-dashed p-sm text-foreground",
          isHeading ? cn(TITLE_CLASS, "text-hy-title") : EDITOR_CLASS,
          !pretty && "text-wrap",
          pretty && (isHeading ? "text-balance" : "text-pretty")
        )}
        lang="is"
        // A live user value from the slider, not a design token.
        style={{ width }}
      >
        {showBreaks ? <MarkedText text={output} /> : output}
      </div>

      <p className="flex flex-wrap gap-x-md font-medium text-meta text-muted">
        <Tip tip={tips.softHyphen}>{content.breaks(count(output, SOFT_HYPHEN))}</Tip>
        <Tip tip={tips.noBreakSpace}>
          {content.noBreakSpaces(count(output, NO_BREAK_SPACE))}
        </Tip>
      </p>
    </div>
  );
}
