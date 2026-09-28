import type { ComponentProps } from "react";
import { NoteRow } from "@/components/blog/note-row";
import { SectionWrapper } from "@/components/home/section-wrapper";
import { getNotesPosts, sortPostsByDate } from "@/lib/blog";
import { notesContent } from "@/lib/content";

type NotesPostsProps = {
  posts?: ReturnType<typeof getNotesPosts>;
  /** Pill label for the band. Rendered as the section's `<h2>`. */
  heading?: string;
  id?: string;
  gapVariant?: ComponentProps<typeof SectionWrapper>["gapVariant"];
};

/**
 * The notes list as one homepage band: a pill label on columns 2–3 and a
 * subgrid list of `NoteRow`s on 4–11, on the same rhythm as Selected work,
 * Experience and Awards. This is the same shape `EntrySection`
 * (`components/home/entry-section.tsx`) renders, and the two are meant to
 * be read as the same component even though they take different content.
 *
 * `reveal="items"` so the rows stagger in and the band itself does not
 * double-fade behind them — see the scroll reveal notes in `globals.css`.
 *
 * The cover images the v1 list ran are deliberately not here. The v2
 * language for a list is a text row; the one band that carries imagery is
 * the portfolio carousel, and it earns that by being the work itself.
 */
export function NotesPosts({
  posts,
  heading = notesContent.posts.heading,
  id = "notes-heading",
  gapVariant,
}: NotesPostsProps) {
  const allBlogs = posts ?? sortPostsByDate(getNotesPosts());

  if (allBlogs.length === 0) {
    return (
      <SectionWrapper gapVariant={gapVariant} id={id} label={heading}>
        <p className="text-pretty font-book text-body text-muted lg:col-span-8">
          {notesContent.posts.empty}
        </p>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper gapVariant={gapVariant} id={id} label={heading} reveal="items">
      {/* `gap-y-md`, not the `gap-y-2xs` an entry section runs. Experience and
          Awards rows are single fixed-height lines, so 8 separates them
          cleanly. A note carries a three-line summary, and at 8 the next
          date and title read as a fourth line of the summary above it. */}
      <ul className="flex flex-col gap-md lg:col-span-8 lg:grid lg:grid-cols-subgrid lg:gap-y-md">
        {allBlogs.map((post, index) => (
          <NoteRow
            index={index + 1}
            key={post.slug}
            publishedAt={post.metadata.publishedAt}
            readingTime={post.metadata.readingTime}
            slug={post.slug}
            summary={post.metadata.summary}
            title={post.metadata.title}
          />
        ))}
      </ul>
    </SectionWrapper>
  );
}
