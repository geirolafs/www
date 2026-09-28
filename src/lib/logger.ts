import { type AnyValueMap, type Logger, SeverityNumber } from "@opentelemetry/api-logs";

type LoggerHost = { __posthogLogger?: Logger };

type Attributes = AnyValueMap;

function getLogger(): Logger | undefined {
  return (globalThis as LoggerHost).__posthogLogger;
}

function emit(
  severityNumber: SeverityNumber,
  severityText: string,
  body: string,
  attributes?: Attributes
) {
  getLogger()?.emit({ severityNumber, severityText, body, attributes });
}

export const logger = {
  warn: (body: string, attributes?: Attributes) =>
    emit(SeverityNumber.WARN, "WARN", body, attributes),
  error: (body: string, attributes?: Attributes) =>
    emit(SeverityNumber.ERROR, "ERROR", body, attributes),
};
