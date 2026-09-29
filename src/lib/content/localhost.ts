/**
 * Copy for /localhost: an unlisted index of experiments that aren't wired into
 * the site. An entry points either at a route under
 * `src/app/(routes)/localhost/` or, with `external`, somewhere else entirely.
 */

interface Experiment {
  href: string;
  external?: boolean;
  title: string;
  description: string;
}

export const localhostContent = {
  hero: {
    heading: "localhost",
    description: "Experiments that aren't wired into the site yet.",
  },
  /** The pill label above the list. Written lowercase, as the pill renders it. */
  listHeading: "experiments",
  experiments: [
    {
      href: "https://card-amber-psi.vercel.app/",
      external: true,
      title: "Card",
      description: "The previous site, closer to a namecard than a website.",
    },
  ] satisfies readonly Experiment[],
} as const;
