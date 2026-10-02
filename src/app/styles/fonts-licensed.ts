import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

/**
 * Geist, the text and UI face of /localhost/hyphenation. By Vercel, under the
 * SIL Open Font License. next/font downloads it at build time and serves it
 * from this site, so it is not a committed file. It is variable (`wght`
 * 100–900) and has a `tnum` feature, so it shows `tabular-nums` itself.
 * Icelandic's extra letters (ð, þ, æ, ö) are all in the `latin` subset.
 */
export const GeistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-face",
});

/**
 * Geist Mono, the code face of /localhost/hyphenation: code blocks, code in a
 * sentence, and the break editor's exception line. Geist's monospace sibling,
 * also by Vercel under the SIL Open Font License, also variable (`wght`
 * 100–900). Each character has its own width and shape, so `l`, `I` and `1`
 * cannot be mistaken for one another.
 */
export const GeistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono-face",
});

/**
 * Bespoke Serif, the title face of /localhost/hyphenation: titles, the intro
 * and the editor text. By the Indian Type Foundry, from Fontshare, under the
 * ITF Free Font License. The license allows self-hosting on our own site but
 * not distributing the file through a public repository. The file is
 * gitignored, comes from a private fonts repo
 * (`scripts/fetch-licensed-fonts.ts` downloads it before `dev` and `build`),
 * and is used exactly as shipped: no subsetting, no conversion.
 *
 * It is variable, `wght` 300–800, with no optical size axis. Its digits are
 * proportional but it has no `tnum` feature.
 *
 * Kept out of `fonts.ts` on purpose: the root layout imports that file, and a
 * font declared there would load on every page. Only /localhost/hyphenation
 * imports this one.
 */
export const BespokeSerif = localFont({
  src: [
    {
      path: "./local-fonts/licensed/BespokeSerif-Variable.woff2",
      weight: "300 800",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-bespoke-serif-face",
});

/**
 * ABC Areal, the text and code face of the fluid-typography pages
 * (/localhost/skiptingar, /localhost/settle-rag). By Dinamo, under a
 * commercial licence: it is self-hosted on this site and the file never goes
 * in the public repo. Like Bespoke Serif it is gitignored and comes from the
 * private fonts repo (`scripts/fetch-licensed-fonts.ts`), used as shipped.
 *
 * One variable file does both jobs. Its axes are `wght` 400–700, `slnt`
 * −12–0 (the italic, so no italic file is declared), `MONO` 0–100 (0 is the
 * proportional text face, 100 is the monospace) and `DRKM` 0–1 (a grade for
 * light text on a dark ground). Code gets `"MONO" 100` from the
 * `font-hy-mono` token (see `globals.css`). It has `tnum`, `pnum`, `case`,
 * `zero` and `ss01`–`ss11`; note that `ss01` swaps the `a` for an alternate.
 * It has U+00A0 and the Icelandic quotes, but not U+2011 or U+2060; the
 * browser draws those from a fallback font.
 */
export const ArealSuperfamily = localFont({
  src: [
    {
      path: "./local-fonts/licensed/ABCArealSuperfamilyVariable.woff2",
      weight: "400 700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-areal-face",
});
