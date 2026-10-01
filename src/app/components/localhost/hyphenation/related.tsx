import { RichText } from "@/app/components/localhost/hyphenation/rich-text";
import {
  BODY_CLASS,
  FOCUS_CLASS,
  INTRO_CLASS,
  ITEM_TITLE_CLASS,
  LABEL_CLASS,
  NOTE_CLASS,
  SUBTITLE_CLASS,
} from "@/app/components/localhost/hyphenation/styles";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";

const { related } = localhostHyphenationContent;

/** Notes on what the platform does for Icelandic and what it does not. */
function Platform() {
  const { platform } = related;

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex flex-col gap-xs">
        <h3 className={cn(SUBTITLE_CLASS, "scroll-mt-project")} id={platform.id}>
          {platform.title}
        </h3>
        <p className={cn(INTRO_CLASS, "max-w-measure")}>{platform.intro}</p>
      </div>
      <ul className="flex flex-col">
        {platform.items.map(item => (
          <li
            className="flex flex-col gap-1 border-border border-t py-md md:grid md:grid-cols-3 md:gap-x-md"
            key={item.id}
          >
            <p className={ITEM_TITLE_CLASS}>{item.term}</p>
            <p className={cn(BODY_CLASS, "md:col-span-2")}>
              <RichText parts={item.body} />
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Reading and tools that sit next to the package, in two groups, then notes
 * on what the platform does for Icelandic. Each row is the title as a link,
 * where it comes from, and one line on why it belongs beside skiptingar. The
 * links leave the page, so the arrow says so.
 */
export function Related() {
  return (
    <div className="flex flex-col gap-hyblock">
      {related.groups.map(group => (
        <section
          aria-labelledby={`related-${group.id}`}
          className="flex flex-col gap-sm"
          key={group.id}
        >
          <h3 className={LABEL_CLASS} id={`related-${group.id}`}>
            {group.label}
          </h3>
          <ul className="flex flex-col">
            {group.items.map(item => (
              <li
                className="flex flex-col gap-xs border-border border-t py-md md:grid md:grid-cols-3 md:gap-x-md"
                key={item.id}
              >
                <div className="flex flex-col">
                  <a
                    className={cn(
                      ITEM_TITLE_CLASS,
                      "underline decoration-border underline-offset-4 hover:decoration-foreground",
                      FOCUS_CLASS
                    )}
                    href={item.href}
                    rel="noopener"
                    target="_blank"
                  >
                    {item.title}
                    {/* The arrow is decoration; a new tab is the browser's to announce. */}
                    <span aria-hidden="true" className="ml-1 text-muted no-underline">
                      ↗
                    </span>
                  </a>
                  <span className={NOTE_CLASS}>{item.source}</span>
                </div>
                <p className={cn(BODY_CLASS, "md:col-span-2")}>
                  <RichText parts={item.body} />
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <Platform />
    </div>
  );
}
