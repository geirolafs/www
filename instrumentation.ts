import type { Logger } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { LoggerProvider, SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs";

export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (!token) {
    return;
  }

  const exporter = new OTLPLogExporter({
    url: "https://eu.i.posthog.com/i/v1/logs",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const loggerProvider = new LoggerProvider({
    resource: resourceFromAttributes({
      "service.name": "geir-is",
    }),
    processors: [new SimpleLogRecordProcessor({ exporter })],
  });

  (globalThis as unknown as { __posthogLogger: Logger }).__posthogLogger =
    loggerProvider.getLogger("geir-is");
}
