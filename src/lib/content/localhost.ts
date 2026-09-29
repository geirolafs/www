/**
 * Copy for /localhost: an unlisted index of experiments that aren't wired into
 * the site. An entry points either at a route
 * under `src/app/(routes)/localhost/` or, with `external`, somewhere else
 * entirely.
 */

interface Experiment {
  href: string;
  external?: boolean;
  /** Page title, and the name the experiment's own page shows. */
  title: string;
  description: string;
  /** Screenshot that fills the index's reel while this entry is active. */
  preview: string;
}

export const localhostContent = {
  hero: {
    heading: "localhost:3000/localhost",
    description: "",
  },
  /** Link from an experiment page back to the index. */
  backLabel: "← localhost",
  /** Accessible name for the reel of experiments on the index. */
  listLabel: "Experiments",
  experiments: [
    {
      href: "/localhost/ambilight",
      title: "Ambilight",
      description: "A glow behind images and video, sampled from their own colours.",
      preview: "/localhost/previews/ambilight.webp",
    },
    {
      href: "/localhost/ambient-stripe",
      title: "Ambient stripe",
      description:
        "The stripe at 10px with a soft glow that stirs with scroll and the cursor.",
      preview: "/localhost/previews/ambient-stripe.webp",
    },
    {
      href: "/localhost/particle-hover",
      title: "Particle hover",
      description: "Particles that gather where the cursor is.",
      preview: "/localhost/previews/particle-hover.webp",
    },
    {
      href: "/localhost/pills",
      title: "Pills",
      description: "Three ways to centre a pill's text, against three casings.",
      preview: "/localhost/previews/pills.webp",
    },
    {
      href: "/localhost/portfolio-preview",
      title: "Portfolio preview",
      description: "Every file in the portfolio bucket, as a contact sheet.",
      preview: "/localhost/previews/portfolio-preview.webp",
    },
    {
      href: "/localhost/spring-hover",
      title: "Spring hover",
      description: "Letters on springs that give way to the cursor and settle back.",
      preview: "/localhost/previews/spring-hover.webp",
    },
    {
      href: "/localhost/variable-weight",
      title: "Variable weight",
      description: "Text that lightens under the cursor, along the font's weight axis.",
      preview: "/localhost/previews/variable-weight.webp",
    },
    {
      href: "https://card-amber-psi.vercel.app/",
      external: true,
      title: "Card",
      description: "Archived site that was closer to a namecard than a website.",
      preview: "/localhost/previews/card.webp",
    },
  ] satisfies readonly Experiment[],
} as const;
