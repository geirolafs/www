import { ContactLink } from "@/app/components/home/contact-link";
import { contactFooterContent } from "@/lib/content/home";
import { cn } from "@/lib/utils";

/** Footer blocks share the page's tracks; reveals follow visible DOM order. */
export function ContactFooter() {
  const visibleLinks = contactFooterContent.links.filter(link => !link.hidden);
  const linkGroups = [
    { id: "contact", columns: "sm:col-span-3 lg:col-span-3 lg:col-start-3" },
    { id: "social", columns: "sm:col-span-2 lg:col-span-2 lg:col-start-6" },
    // The easter egg: over the colophon at both frames, last on mobile.
    {
      id: "localhost",
      columns:
        "whitespace-nowrap sm:col-span-1 sm:col-start-6 lg:col-span-3 lg:col-start-8",
    },
  ].map(group => ({
    ...group,
    links: visibleLinks.filter(link => link.group === group.id),
  }));

  return (
    <footer
      className="page-grid mt-footergap gap-y-group pb-footerpad font-regular text-foreground text-link lg:gap-y-footerrow"
      data-reveal="items"
    >
      <div className="grid grid-cols-subgrid content-start gap-y-xl lg:col-span-10 lg:col-start-2">
        <div className="col-span-full lg:col-span-2" data-reveal-item>
          <p>{contactFooterContent.name}</p>
        </div>

        {linkGroups.map(group => (
          <ul className={cn("col-span-full", group.columns)} key={group.id}>
            {group.links.map(link => (
              <li data-reveal-item key={link.href}>
                <ContactLink
                  className={cn(
                    "text-foreground no-underline hover:underline focus-visible:underline",
                    link.weight === "medium" ? "font-medium" : "font-regular"
                  )}
                  external={link.external}
                  href={link.href}
                  label={link.label}
                  location="footer"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>

      <div className="grid grid-cols-subgrid content-start gap-y-md lg:col-span-10 lg:col-start-2">
        <p className="col-span-full sm:col-span-3 lg:col-span-2" data-reveal-item>
          {contactFooterContent.copyright}
        </p>
        <p
          className="col-span-full text-pretty font-book sm:col-span-3 lg:col-span-3 lg:col-start-8"
          data-reveal-item
        >
          {contactFooterContent.colophon}
        </p>
      </div>
    </footer>
  );
}
