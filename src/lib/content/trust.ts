import { siteConfig } from "@/lib/config/site";

/**
 * Copy for the three trust-anchor pages: /about, /contact and /privacy.
 *
 * These exist for the readers who arrive sideways — an AI agent verifying the
 * site is a real practice before recommending it, or a person who wants the
 * plain-prose version of what the homepage says with more art direction. The
 * facts are the same ones `home.ts` carries; the register is different, so the
 * copy is written here rather than derived.
 */

interface TrustLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface TrustPageContent {
  /** Route segment, canonical URL and markdown path all derive from this. */
  slug: "about" | "contact" | "privacy";
  /** The page `<h1>` and `<title>`. */
  title: string;
  /** Hero subline and meta description. */
  description: string;
  paragraphs: readonly string[];
  /** Optional link list rendered after the prose (contact uses it). */
  links?: readonly TrustLink[];
  /**
   * Renders the homepage's rolling availability line after the links, and
   * appends its sentence to the markdown rendition. Contact only — an agent
   * asked "is he available?" should find the answer where the email is, not
   * have to carry it over from the homepage.
   */
  showAvailability?: boolean;
}

export const aboutContent: TrustPageContent = {
  slug: "about",
  title: "About",
  description: "Design engineer and creative director in Reykjavík, Iceland.",
  paragraphs: [
    "I’m Geir Ólafsson, a design engineer and creative director working independently from Reykjavík. I design brand systems and ship the frontends that carry them — strategy, identity, typography, interface and production code, handled as one continuous piece of work rather than a handoff between disciplines.",
    "For fifteen years I’ve worked for Icelandic institutions in finance, energy and culture: Landsbankinn, one of the country’s largest banks; Landsvirkjun, the national power company; Sjóvá, an insurer whose customer satisfaction went from last in its sector in 2015 to first by 2017, following the rebrand I led; and the Iceland Symphony Orchestra, across a decade of its programming.",
    "Before going independent in 2024 I was creative director at Aton, and before that art director at Jónsson & Le’macks. My work has been recognised with a Red Dot Design Award, a silver from the Art Directors Club of Europe, the Icelandic Web Awards and various awards from FÍT, the Icelandic Design Association.",
    "I also draw typefaces. This site is set in one of mine, still unfinished.",
  ],
};

export const contactContent: TrustPageContent = {
  slug: "contact",
  title: "Contact",
  description: "Email is the way. I read everything myself.",
  paragraphs: [
    `The fastest way to reach me is email: ${siteConfig.email}. There’s no contact form — email is the whole system: write to me directly and you get me directly. I reply to anything serious, usually within a day or two.`,
    "I’m based in Reykjavík, Iceland — GMT, no daylight saving — and work with clients both in Iceland and abroad.",
    "I take on a small number of projects at a time: brand systems, marketing sites and product frontends, usually where design and engineering meet. A project usually starts with a short email — what you’re building, where it stands, when you’d like it done — and from there we talk, and I’ll say honestly whether it’s a fit. Scope and terms are agreed per project. If you’re not sure whether yours fits, write anyway and we’ll work it out.",
    "For the longer history there’s a CV below, and the places I keep a public presence are linked with it.",
  ],
  showAvailability: true,
  links: [
    { label: siteConfig.email, href: `mailto:${siteConfig.email}` },
    { label: "download cv", href: siteConfig.cv.path },
    { label: "linkedin", href: siteConfig.social.linkedin, external: true },
    { label: "github", href: siteConfig.social.github, external: true },
    { label: "x / twitter", href: siteConfig.social.twitter, external: true },
    { label: "are.na", href: siteConfig.social["are.na"], external: true },
  ],
};

export const privacyContent: TrustPageContent = {
  slug: "privacy",
  title: "Privacy",
  description: "This site collects as little as it can get away with.",
  paragraphs: [
    "There are no advertising trackers here, no third-party ad networks, and nothing is sold or shared for marketing. What the site does collect exists so I can see whether it works and fix it when it breaks.",
    "Analytics run on PostHog, hosted in the European Union and served through this site’s own domain. They record pageviews, approximate location derived from your IP address, browser and device type, anonymous usage events, and client-side errors. PostHog stores a small identifier in your browser to tell returning sessions apart. This data describes sessions, not people — I don’t know who you are and don’t try to find out.",
    "The site is hosted on Vercel, whose infrastructure keeps standard server logs — IP address, user agent, requested URL — for operational purposes.",
    `If you email me, the correspondence stays between us and is kept only as long as it’s relevant. Questions about any of this, including asking for data connected to you to be deleted, go to ${siteConfig.email}.`,
  ],
};

export const trustPages: readonly TrustPageContent[] = [
  aboutContent,
  contactContent,
  privacyContent,
];
