import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactFooter, HeaderBar, RevealObserver, Stripe } from "@/app/components/home";
import { CustomMDX } from "@/components/blog/mdx";
import { PostViewTracker } from "@/components/blog/post-view-tracker";
import { NotesPosts } from "@/components/blog/posts";
import { RelativeDate } from "@/components/blog/relative-date";
import { SectionWrapper } from "@/components/home/section-wrapper";
import { getNotesPosts, sortPostsByDate } from "@/lib/blog";
import { siteConfig } from "@/lib/config/site";
import { notesContent } from "@/lib/content";
import { jsonLd } from "@/lib/utils";

// Every note shares the site's pre-made card. The page's `openGraph` replaces
// the layout's wholesale, so the image has to be restated here.
const ogImage = {
  url: `${siteConfig.url}${siteConfig.ogImage.path}`,
  width: siteConfig.ogImage.width,
  height: siteConfig.ogImage.height,
  alt: siteConfig.ogImage.alt,
};

export function generateStaticParams() {
  const posts = getNotesPosts();

  return posts.map(post => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getNotesPosts().find(blogPost => blogPost.slug === slug);
  if (!post) {
    return {};
  }

  const { title, publishedAt: publishedTime, summary: description } = post.metadata;

  const postUrl = `${siteConfig.url}/notes/${post.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: postUrl,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}

export default async function ({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const allPosts = sortPostsByDate(getNotesPosts());
  const post = allPosts.find(blogPost => blogPost.slug === slug);
  const readingTime = post?.metadata.readingTime ?? 0;
  const hasUpdate =
    post?.metadata.updatedAt && post.metadata.updatedAt !== post.metadata.publishedAt;

  if (!post) {
    notFound();
  }

  const relatedPosts = allPosts.filter(p => p.slug !== slug);

  return (
    <>
      <PostViewTracker
        slug={post.slug}
        title={post.metadata.title}
        readingTime={readingTime}
      />
      <RevealObserver />
      <HeaderBar />
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Recommended way to add JSON-LD schema
        dangerouslySetInnerHTML={{
          __html: jsonLd([
            {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.metadata.title,
              datePublished: post.metadata.publishedAt,
              dateModified: post.metadata.updatedAt ?? post.metadata.publishedAt,
              description: post.metadata.summary,
              image: ogImage.url,
              url: `${siteConfig.url}/notes/${post.slug}`,
              author: {
                "@type": "Person",
                name: siteConfig.name,
                url: siteConfig.url,
                sameAs: [
                  siteConfig.social.twitter,
                  siteConfig.social.github,
                  siteConfig.social.linkedin,
                  siteConfig.social["are.na"],
                ],
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: siteConfig.url,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Notes",
                  item: `${siteConfig.url}/notes`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: post.metadata.title,
                  item: `${siteConfig.url}/notes/${post.slug}`,
                },
              ],
            },
          ]),
        }}
        suppressHydrationWarning
        type="application/ld+json"
      />
      {/* Title and summary take the hero pair's placement and treatment —
          columns 6–12, `text-display`, foreground over muted. Same shape as
          the name and role on the homepage. */}
      <SectionWrapper gapVariant="hero">
        <header className="lg:col-span-7 lg:col-start-6">
          <h1 className="lg:cap-trim text-balance font-regular text-display text-foreground">
            {post.metadata.title}
          </h1>
          {post.metadata.summary ? (
            <p className="lg:cap-trim text-pretty font-book text-display text-muted lg:mt-md">
              {post.metadata.summary}
            </p>
          ) : null}
        </header>
      </SectionWrapper>

      <div className="relative mt-section">
        <Stripe />

        {/* The meta takes the entry row's year column (4–5) and the prose
            takes the introduction's measure (6–11). 34em against
            `--text-prose` is 680px and that column is 684 at 1440, so the
            article's own `max-width` and the grid agree rather than one
            silently overriding the other. */}
        <SectionWrapper className="gap-y-md" gapVariant="none">
          <p className="flex flex-col gap-2xs text-balance font-regular text-label text-muted lg:col-span-2 lg:col-start-4">
            <RelativeDate className="text-foreground" date={post.metadata.publishedAt} />
            <span>
              {readingTime} {notesContent.post.readingTimeSuffix}
            </span>
            {hasUpdate && post.metadata.updatedAt ? (
              <span>
                {notesContent.post.updatedPrefix}{" "}
                <RelativeDate date={post.metadata.updatedAt} />
              </span>
            ) : null}
          </p>

          <article className="lg:col-span-6 lg:col-start-6">
            <CustomMDX source={post.content} />
          </article>
        </SectionWrapper>

        {relatedPosts.length > 0 && (
          <NotesPosts
            heading={notesContent.post.relatedHeading}
            id="more-notes-heading"
            posts={relatedPosts}
          />
        )}

        <ContactFooter />
      </div>
    </>
  );
}
