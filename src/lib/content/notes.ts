export const notesContent = {
  hero: {
    heading: "Notes",
    description:
      "I work in strategy, design, and development. I think about systems, why things feel the way they do, and the gap between what we say and what we actually mean.",
  },
  posts: {
    /**
     * The pill label above the list. `SectionLabel` applies `lowercase`
     * itself, but the copy is written that way so it reads correctly
     * wherever else it is used.
     */
    heading: "notes",
    empty: "Nothing published yet.",
  },
  post: {
    relatedHeading: "more notes",
    readingTimeSuffix: "min read",
    updatedPrefix: "Updated",
  },
  tag: {
    label: "tagged",
    backLink: "All notes",
    countSuffix: {
      one: "post",
      other: "posts",
    },
  },
} as const;
