/**
 * Deliberately empty of providers.
 *
 * There were two — `next-themes` and a `motion` config wrapper — and neither
 * did anything. The theme was hard-forced to light with no `dark:` class
 * anywhere on the site, and nothing animates, so `LazyMotion` was shipping
 * client JS to configure zero motion components. Both are one `git show` away
 * when they have something to do; Phase 4 is when motion arrives.
 *
 * Kept as a component so `layout.tsx` has one obvious seam to add the first
 * real provider back into.
 */
export const Providers = ({ children }: { children: React.ReactNode }) => children;
