import posthog from "posthog-js";

// Only with a token. Without one PostHog logs a critical error and the
// client entry never finishes booting — nothing hydrates, no effect runs.
// The hostname check alone missed a phone loading the dev server by the
// Mac's LAN address, which is not `localhost` and has no token either.
const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (token && window.location.hostname !== "localhost") {
  posthog.init(token, {
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    defaults: "2026-01-30",
    capture_exceptions: true,
  });
}
