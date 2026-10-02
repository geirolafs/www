export function register() {
  // Dev-only tooling for the react-grab MCP server (.mcp.json, port 4723).
  // It starts here and not in next.config.ts: Next loads the config in other
  // processes too, among them the telemetry flush that `next dev` spawns on
  // exit. A server started there keeps that process alive and holds the port.
  // Imported lazily so a production install without devDependencies still
  // boots, and a failure never blocks `next dev`.
  if (process.env.NODE_ENV !== "development" || process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  import("@react-grab/mcp/server")
    .then(({ startMcpServer }) => startMcpServer())
    .catch((error: unknown) => {
      console.warn("[react-grab] MCP server failed to start:", error);
    });
}
