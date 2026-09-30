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
  usePageTint(SITE_STRIPE.background, SITE_STRIPE.tint);

  return (
    <AmbientStripe
      blend={SITE_STRIPE.blend}
      core={SITE_STRIPE.core}
      grain={SITE_STRIPE.grain}
      lanternStep={SITE_STRIPE.lanternStep}
      showBar={SITE_STRIPE.showBar}
      strength={SITE_STRIPE.strength}
      variant={SITE_STRIPE.variant}
    />
  );
}
