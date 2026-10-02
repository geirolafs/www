/**
 * Package pages that live on their own host. Each one is a route under
 * /localhost, served at the root of a geir.studio subdomain by `src/proxy.ts`:
 * `skiptingar.geir.studio/x` renders `/localhost/skiptingar/x`.
 *
 * The proxy matches on the first label of the host, so the same table works in
 * dev at `skiptingar.localhost:3000` — browsers resolve `*.localhost` to
 * 127.0.0.1 with no hosts-file entry.
 */
type Subsite = {
  /** The route that renders the subsite, under /localhost. */
  readonly path: string;
  /** The production origin, and the canonical URL of the page. */
  readonly origin: string;
};

export const subsites = {
  skiptingar: {
    path: "/localhost/skiptingar",
    origin: "https://skiptingar.geir.studio",
  },
  "settle-rag": {
    path: "/localhost/settle-rag",
    origin: "https://settle-rag.geir.studio",
  },
} as const satisfies Record<string, Subsite>;

export type SubsiteKey = keyof typeof subsites;

/** The subsite a host serves, keyed by its first label. */
export function subsiteForHost(hostname: string): Subsite | undefined {
  const label = hostname.split(".")[0];
  return Object.hasOwn(subsites, label) ? subsites[label as SubsiteKey] : undefined;
}

/** The subsite whose route a path falls under, with the rest of the path. */
export function subsiteForPath(
  pathname: string
): { subsite: Subsite; rest: string } | undefined {
  for (const subsite of Object.values(subsites)) {
    if (pathname === subsite.path || pathname.startsWith(`${subsite.path}/`)) {
      return { subsite, rest: pathname.slice(subsite.path.length) || "/" };
    }
  }
  return undefined;
}
