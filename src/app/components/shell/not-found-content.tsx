import { TextLink } from "@/app/components/home/text-link";
import { errorContent } from "@/lib/content";

export function NotFoundContent() {
  return (
    <section className="h-[50dvh] bg-background px-site text-foreground">
      <div className="flex flex-col justify-center">
        <div className="h-full">
          <h1 className="mb-8 text-balance">{errorContent[404].title}</h1>
          <p className="mb-4 text-pretty">{errorContent[404].message}</p>
          <p className="mb-2 text-pretty text-muted">{errorContent[404].linksLead}</p>
          <ul className="flex flex-col gap-2xs">
            {errorContent[404].links.map(link => (
              <li key={link.href}>
                <TextLink
                  className="font-regular text-foreground text-link"
                  href={link.href}
                >
                  {link.label}
                </TextLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
