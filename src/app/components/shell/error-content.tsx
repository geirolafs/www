"use client";

import posthog from "posthog-js";
import { errorContent } from "@/lib/content";

type ErrorContentProps = {
  reset: () => void;
};

export function ErrorContent({ reset }: ErrorContentProps) {
  const handleReset = () => {
    posthog.capture("error_retry_clicked");
    reset();
  };

  return (
    <section className="flex min-h-dvh flex-col items-center justify-center gap-md bg-background text-foreground">
      <h2 className="text-balance">{errorContent[500].title}</h2>
      <button
        className="transition-opacity duration-150 ease-out hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 active:opacity-70"
        onClick={handleReset}
        type="button"
      >
        {errorContent[500].buttonText}
      </button>
    </section>
  );
}
