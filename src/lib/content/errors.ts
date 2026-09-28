export const errorContent = {
  404: {
    title: "404 - Page Not Found",
    message: "This page doesn't exist",
    /**
     * Recovery links, for people and for agents alike — a 404 that only
     * declares failure strands both. The markdown rendition served to agents
     * carries the same set: see `agent404Content` in `content/agents.ts`.
     */
    linksLead: "Where to look instead:",
    links: [
      { label: "home", href: "/" },
      { label: "notes", href: "/notes" },
      { label: "sitemap", href: "/sitemap.xml" },
      { label: "llms.txt", href: "/llms.txt" },
    ],
  },
  500: {
    title: "Something went wrong",
    buttonText: "Try again",
  },
} as const;
