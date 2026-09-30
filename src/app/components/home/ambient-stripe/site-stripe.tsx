"use client";

import { AmbientStripe } from "./ambient-stripe";
import { SITE_STRIPE } from "./config";
import { usePageTint } from "./tint";

/**
 * The site's stripe: the ambient glow, tuned as preset 1 on
 * /localhost/ambient-stripe and held in `SITE_STRIPE`, plus the page tint that
 * follows it.
 *
 * It must be the first child of a page-level `relative isolate` wrapper. The
 * glow spans that wrapper at `-z-10`: in front of the page background, under
 * all the text.
 */
export function SiteStripe() {
  const { background, tint, ...stripe } = SITE_STRIPE;
  usePageTint(background, tint);

  return <AmbientStripe {...stripe} />;
}
