import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactFooter, HeaderBar, RevealObserver, Stripe } from "@/app/components/home";
import { NotesPosts } from "@/components/blog/posts";
import { SectionWrapper } from "@/components/home/section-wrapper";
import { TextLink } from "@/components/home/text-link";
import { getNotesPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/config/site";
import { notesContent } from "@/lib/content";

export function generateStaticParams() {
  const posts = getNotesPosts();
  const tags = new Set<string>();

  for (const post of posts) {
    for (const tag of post.metadata.tags ?? []) {
      tags.add(tag.toLowerCase());
    }
  }

  // Must return at least one param for Cache Components
  if (tags.size === 0) {
    return [{ tag: "_placeholder" }];
  }

  return [...tags].map(tag => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  // Next has already percent-decoded the param; decoding again would
  // mangle any tag containing `%`.
  const { tag } = await params;

  return {
    title: `Posts tagged "${tag}"`,
    description: `Articles and notes about ${tag}`,
    alternates: {
      canonical: `${siteConfig.url}/notes/tag/${encodeURIComponent(tag)}`,
    },
  };
}

export default async function ({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const normalizedTag = tag.toLowerCase();

  const allPosts = getNotesPosts();
  const filteredPosts = allPosts.filter(post =>
    post.metadata.tags?.some(t => t.toLowerCase() === normalizedTag)
  );

  if (filteredPosts.length === 0) {
    notFound();
  }

  const { countSuffix } = notesContent.tag;

  return (
    <>
      <RevealObserver />
      <HeaderBar />
      <SectionWrapper gapVariant="hero">
        <div className="lg:col-span-7 lg:col-start-6">
          {/* The back link leads, at label size, so the tag itself still
              opens the page the way a name opens the homepage. */}
          <p className="lg:cap-trim font-regular text-label text-muted">
            <TextLink href="/notes">
              <span aria-hidden="true">← </span>
              {notesContent.tag.backLink}
            </TextLink>
          </p>
          <h1 className="lg:cap-trim mt-md text-balance font-regular text-display text-foreground">
            #{normalizedTag}
          </h1>
          <p className="lg:cap-trim text-balance font-regular text-display text-muted lg:mt-md">
            {filteredPosts.length}{" "}
            {filteredPosts.length === 1 ? countSuffix.one : countSuffix.other}
          </p>
        </div>
      </SectionWrapper>
      <div className="relative mt-section">
        <Stripe />
        <NotesPosts
          gapVariant="none"
          heading={notesContent.tag.label}
          id="tagged-heading"
          posts={filteredPosts}
        />
        <ContactFooter />
      </div>
    </>
  );
}
