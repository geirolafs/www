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
