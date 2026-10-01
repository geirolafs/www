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
import { localhostHyphenationClientContent } from "@/lib/content/localhost-hyphenation-client";
import { cn } from "@/lib/utils";
import {
  NO_BREAK_SPACE,
  SOFT_HYPHEN,
  useHyphenate,
  useSkiptingar,
} from "@/packages/skiptingar/src/client";

const { liveEditor: content, tips } = localhostHyphenationClientContent;

type Mode = (typeof content.mode.options)[number]["value"];
type Rules = (typeof content.rules.options)[number]["value"];

function count(text: string, character: string): number {
  return text.split(character).length - 1;
}

type LiveEditorProps = {
  /**
   * The editor's initial text, processed on the server with the initial
   * options (`content.initial`). Until the engine has loaded, the box shows it
   * while the text and every option are still at their initial values, so the
   * first paint is the processed text and nothing reflows when the engine
   * arrives. Once anything changes it shows the text as typed until then.
   */
  initialOutput: string;
};

/**
 * The text you type, run through the engine in the browser, in a box you can
 * resize. The engine loads on first render as its own chunk.
 */
export function LiveEditor({ initialOutput }: LiveEditorProps) {
  const textId = useId();
  const widthId = useId();
  const [text, setText] = useState<string>(content.initialText);
  const [mode, setMode] = useState<Mode>(content.initial.mode);
  const [rules, setRules] = useState<Rules>(content.initial.rules);
  const [typeset, setTypeset] = useState<boolean>(content.initial.typeset);
  const [showBreaks, setShowBreaks] = useState(false);
  const [pretty, setPretty] = useState(true);
  const [width, setWidth] = useState<number>(content.width.initial);

  const core = useSkiptingar();
  const processed = useHyphenate(text, { mode, rules, typeset });
  const atInitial =
    text === content.initialText &&
    mode === content.initial.mode &&
    rules === content.initial.rules &&
    typeset === content.initial.typeset;
  // The server HTML and the first client render both have no core, so they
  // both show `initialOutput` and hydration matches.
  const output = !core && atInitial ? initialOutput : processed;
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

      <section
        className={cn(
          "max-w-full hyphens-manual border border-border border-dashed p-sm text-foreground",
          isHeading ? cn(TITLE_CLASS, "text-hy-title") : EDITOR_CLASS,
          !pretty && "text-wrap",
          pretty && (isHeading ? "text-balance" : "text-pretty")
        )}
        lang="is"
        aria-label={content.outputLabel}
        // A live user value from the slider, not a design token.
        style={{ width }}
      >
        {showBreaks ? <MarkedText text={output} /> : output}
      </section>

      <p className="flex flex-wrap gap-x-md font-medium text-meta text-muted">
        <Tip tip={tips.softHyphen}>{content.breaks(count(output, SOFT_HYPHEN))}</Tip>
        <Tip tip={tips.noBreakSpace}>
          {content.noBreakSpaces(count(output, NO_BREAK_SPACE))}
        </Tip>
      </p>
    </div>
  );
}
