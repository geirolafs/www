"use client";

import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
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
      <Button type="button" onClick={handleReset}>
        {errorContent[500].buttonText}
      </Button>
    </section>
  );
}
