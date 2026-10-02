// `cssstudio` ships no type declarations. Dev-only, loaded by
// `components/shell/css-studio.tsx`.
declare module "cssstudio" {
  /** Mounts the panel and returns its teardown. */
  export function startStudio(options?: Record<string, unknown>): () => void;
}
