"use client";

import type { ReactNode } from "react";
import { createContext, use, useMemo, useState } from "react";
import {
  DEFAULT_SETTINGS,
  type Settings,
} from "@/app/components/localhost/hyphenation/settings";
import { localhostHyphenationClientContent } from "@/lib/content/localhost-hyphenation-client";
import { configureSkiptingar } from "@/packages/skiptingar/src/client";

const { liveEditor: content } = localhostHyphenationClientContent;

// The page's text is hyphenated by the server (`api/route.ts`), so the
// browser never downloads the 47 kB of patterns. If the endpoint fails, the
// hooks load the patterns instead.
configureSkiptingar({ endpoint: "/localhost/hyphenation/api" });

type Playground = {
  settings: Settings;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  /** The text the editor has handed to the rest of the page. */
  text: string;
  /** Hands a text to the rest of the page, and puts it in the editor's box. */
  commit: (text: string) => void;
};

type Draft = {
  /** What is in the editor's text box, handed on or not. */
  draft: string;
  setDraft: (draft: string) => void;
};

const PlaygroundContext = createContext<Playground | null>(null);

/**
 * The draft is a context of its own: it changes on every keystroke, and only
 * the composer and the example picker read it. Kept apart, typing re-renders
 * those two and not every specimen on the page.
 */
const DraftContext = createContext<Draft | null>(null);

/**
 * Holds the page's settings and the text the editor has handed on, so every
 * live specimen follows the controls, and the editor's draft. Server
 * components pass through it as `children`; only the specimens that read it
 * are client components.
 */
export function PlaygroundProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [draft, setDraft] = useState<string>(content.initialText);
  const [text, setText] = useState<string>(content.initialText);

  const value = useMemo<Playground>(
    () => ({
      settings,
      setSetting: (key, next) => setSettings(current => ({ ...current, [key]: next })),
      text,
      commit: next => {
        setDraft(next);
        setText(next);
      },
    }),
    [settings, text]
  );
  const draftValue = useMemo<Draft>(() => ({ draft, setDraft }), [draft]);

  return (
    <PlaygroundContext value={value}>
      <DraftContext value={draftValue}>{children}</DraftContext>
    </PlaygroundContext>
  );
}

export function usePlayground(): Playground {
  const playground = use(PlaygroundContext);
  if (!playground) {
    throw new Error("usePlayground needs a PlaygroundProvider above it.");
  }
  return playground;
}

export function useDraft(): Draft {
  const draft = use(DraftContext);
  if (!draft) {
    throw new Error("useDraft needs a PlaygroundProvider above it.");
  }
  return draft;
}
