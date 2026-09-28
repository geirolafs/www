import localFont from "next/font/local";

/**
 * Same Univers — the site's custom typeface. Variable, single `wght` axis
 * 400–900, so one file covers every weight.
 *
 * Two regulars, and they are not interchangeable:
 *   Book (400)    paragraphs and multi-line body copy
 *   Regular (430) a single word, one line, or a lone sentence
 *
 * Never rely on `font-weight: normal` — it resolves to Book. Set the token.
 */
export const SameUnivers = localFont({
  src: [
    {
      path: "./local-fonts/SameUnivers-beta_IP4VF.woff2",
      weight: "400 900",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-same-univers",
  preload: true,
});
