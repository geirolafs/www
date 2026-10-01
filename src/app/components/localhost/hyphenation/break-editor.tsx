"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ControlButton } from "@/app/components/localhost/hyphenation/control-button";
import {
  CODE_CLASS,
  FOCUS_CLASS,
  LABEL_CLASS,
} from "@/app/components/localhost/hyphenation/styles";
import { Tip } from "@/app/components/localhost/hyphenation/tip";
import { localhostHyphenationClientContent } from "@/lib/content/localhost-hyphenation-client";
import { cn } from "@/lib/utils";
import { useSkiptingar } from "@/packages/skiptingar/src/client";

const { breakEditor: content } = localhostHyphenationClientContent;

type Core = NonNullable<ReturnType<typeof useSkiptingar>>;
type Gap = keyof typeof content.states;
type CopyState = keyof typeof content.copy;

const LETTER = /^\p{L}$/u;
const COPY_RESET_MS = 1500;

/** What a click on a gap turns it into: none, then break, then joint, then none. */
const NEXT_GAP: Record<Gap, Gap> = { none: "break", break: "joint", joint: "none" };

function lettersOf(value: string): string[] {
  // NFC first: a decomposed á is a letter and a combining accent, and the
  // filter would drop the accent.
  return [...value.normalize("NFC")].filter(character => LETTER.test(character));
}

/**
 * The engine's answer for a word, as one state per gap between letters. A gap
 * is a joint where the word's exception line has `=` (or the engine finds a
 * name ending), else a break where the ritreglur rules allow one, else none.
 */
function engineGaps(core: Core, letters: string[]): Gap[] {
  const { breaks, joints } = core.analyzeWord(letters.join(""), {
    rules: "ritreglur",
  });
  return letters.slice(0, -1).map((_, index) => {
    if (joints.includes(index + 1)) {
      return "joint";
    }
    return breaks.includes(index + 1) ? "break" : "none";
  });
}

/** The exception line: the word in lowercase, with `-` and `=` between letters. */
function exceptionLine(letters: string[], gaps: Gap[]): string {
  return letters
    .map((letter, index) => {
      const gap = gaps[index] ?? "none";
      return letter + (gap === "none" ? "" : content.states[gap].mark);
    })
    .join("")
    .toLowerCase();
}

/**
 * Lets you fix the breaks for one word and copy the result as a line for
 * `data/exceptions.txt`. It starts from what the engine gives for the word
 * under the ritreglur rules.
 */
export function BreakEditor() {
  const wordId = useId();
  const [word, setWord] = useState<string>(content.initialWord);
  const core = useSkiptingar();
  const [edit, setEdit] = useState<{ word: string; gaps: Gap[] } | null>(null);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    };
  }, []);

  const letters = lettersOf(word);
  const key = letters.join("");
  const gapCount = Math.max(0, letters.length - 1);
  let gaps: Gap[];
  if (edit && edit.word === key) {
    gaps = edit.gaps;
  } else if (core) {
    gaps = engineGaps(core, letters);
  } else {
    gaps = Array.from({ length: gapCount }, () => "none");
  }

  const cycle = (index: number) => {
    setEdit({
      word: key,
      gaps: gaps.map((gap, at) => (at === index ? NEXT_GAP[gap] : gap)),
    });
  };

  const line = exceptionLine(letters, gaps);
  const copy = async () => {
    let next: CopyState = "copied";
    try {
      await navigator.clipboard.writeText(line);
    } catch {
      next = "failed";
    }
    // The clipboard call can outlive the component; don't start a timer then.
    if (!mounted.current) {
      return;
    }
    setCopyState(next);
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }
    resetTimer.current = setTimeout(() => setCopyState("idle"), COPY_RESET_MS);
  };

  // Letters and the gap after each, keyed by position: the word is edited as a
  // whole, so a letter's place is its identity.
  const cells = letters.map((letter, index) => ({
    id: `${index}-${letter}`,
    letter,
    index,
    gap: gaps[index],
  }));

  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-col gap-xs">
        <label className={LABEL_CLASS} htmlFor={wordId}>
          {content.wordLabel}
        </label>
        <input
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          className={cn(
            "w-full border border-border p-sm font-book text-foreground text-hy-body",
            FOCUS_CLASS
          )}
          id={wordId}
          lang="is"
          onChange={event => setWord(event.target.value)}
          spellCheck={false}
          type="text"
          value={word}
        />
      </div>

      <div className="flex flex-col gap-xs">
        <span className={LABEL_CLASS}>{content.keyLabel}</span>
        <ul className="flex flex-wrap gap-x-md gap-y-2xs font-book text-hy-note">
          {Object.values(content.states).map(state => (
            <li key={state.name}>
              <Tip className="min-h-6" tip={state.tip}>
                {`${state.mark} ${state.name}`}
              </Tip>
            </li>
          ))}
        </ul>
      </div>

      <fieldset className="flex flex-wrap items-center">
        <legend className="sr-only">{content.gapsLabel}</legend>
        {cells.map(cell => (
          <span className="flex items-center" key={cell.id}>
            {/* Only the letters are Icelandic; the gap buttons' names are English. */}
            <span className="font-hy-title text-foreground text-hy-title" lang="is">
              {cell.letter}
            </span>
            {cell.gap ? (
              <button
                aria-label={content.gapLabel(cell.letter, content.states[cell.gap].name)}
                className={cn(
                  "min-w-md px-2xs py-xs font-bold text-hy-body",
                  FOCUS_CLASS,
                  cell.gap === "none" && "text-muted",
                  cell.gap === "break" && "text-hy-signal-ink",
                  cell.gap === "joint" && "bg-hy-accent text-foreground"
                )}
                onClick={() => cycle(cell.index)}
                type="button"
              >
                {content.states[cell.gap].mark}
              </button>
            ) : null}
          </span>
        ))}
      </fieldset>

      <div className="flex flex-col gap-xs">
        <span className={LABEL_CLASS}>{content.lineLabel}</span>
        <div className="flex flex-wrap items-center gap-sm">
          <code
            className={cn(
              CODE_CLASS,
              "break-words border border-border p-sm text-foreground text-hy-body"
            )}
            lang="is"
          >
            {line}
          </code>
          <ControlButton onClick={copy}>{content.copy[copyState]}</ControlButton>
        </div>
      </div>
    </div>
  );
}
