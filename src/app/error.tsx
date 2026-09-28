"use client";

import { ErrorContent } from "@/components/shell/error-content";

export default function GlobalErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorContent reset={reset} />;
}
