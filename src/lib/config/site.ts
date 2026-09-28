type SocialLinks = {
  readonly twitter: string;
  readonly github: string;
  readonly linkedin: string;
  readonly "are.na": string;
};
type CVInfo = {
  readonly path: string;
  readonly filename: string;
};
type OgImage = {
  readonly path: string;
  readonly width: number;
  readonly height: number;
  /**
   * Describes what the card image itself depicts. Deliberately not derived from
   * `title` — the card is a static PNG with its text baked in, so an alt tied to
   * `title` would silently drift from the artwork the next time `title` changes.
   */
  readonly alt: string;
};
type SiteConfig = {
  readonly name: string;
  readonly lastName: string;
  readonly domain: string;
  readonly url: string;
  readonly email: string;
  /**
   * The role, used as the `<title>` suffix, the OG/Twitter title and the
   * schema.org `jobTitle`. Keyword-bearing — it is the blue link in search
   * results and the browser-tab text.
   */
  readonly title: string;
  /** Strapline for display copy. Never a page title — see `title`. */
  readonly tagline: string;
  /** Meta description and search results. Google truncates near 155 chars. */
  readonly description: string;
  /** Twitter/X card, which allows 200 chars. Longer than `description`. */
  readonly socialDescription: string;
  readonly ogImage: OgImage;
  readonly social: SocialLinks;
  readonly cv: CVInfo;
};
export const siteConfig: SiteConfig = {
  name: "Geir Ólafsson",
  lastName: "olafsson",
  domain: "geir.is",
  // Must match the domain Vercel serves as Production. `www.geir.is` is
  // Production; the apex redirects to it. Declaring the apex here made every
  // canonical, sitemap entry and feed link point at a URL that 307s.
  url: "https://www.geir.is",
  email: "hallo@geir.is",
  title: "Design engineer and creative director",
  tagline: "Brand, product and code.",
  description:
    "Designer and developer in Reykjavík. I design the system and ship the frontend. Fifteen years of brand and creative direction for Icelandic institutions.",
  socialDescription:
    "Designer and developer in Reykjavík. I design the system and ship the frontend myself. Fifteen years of brand and creative direction for Icelandic institutions in finance, energy and culture.",
  ogImage: {
    path: "/og-image.png",
    width: 1200,
    height: 630,
    alt: "Geir Ólafsson, design engineer and creative director",
  },
  social: {
    twitter: "https://x.com/geirolafs",
    github: "https://github.com/geirolafs",
    linkedin: "https://www.linkedin.com/in/geir-olafsson/",
    "are.na": "https://are.na/geir-olafsson",
  },
  cv: {
    path: "/cv.pdf",
    filename: "Geir-Olafsson-CV.pdf",
  },
};
