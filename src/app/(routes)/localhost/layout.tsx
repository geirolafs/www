import type { Metadata } from "next";
import type { ReactNode } from "react";
import { localhostContent } from "@/lib/content/localhost";

/**
 * The experiment pages under /localhost stand alone, so their tab titles are
 * their own names with no site suffix: this template replaces the root
 * layout's `%s | name` for those sub-routes. It does not reach the index,
 * `/localhost`, which keeps its site look and its site suffix. A layout's
 * template applies to its child segments, not to the page beside it.
 */
export const metadata: Metadata = {
  title: { template: "%s", default: localhostContent.hero.heading },
};

export default function LocalhostLayout({ children }: { children: ReactNode }) {
  return children;
}
