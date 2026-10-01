import { MarkedText } from "@/app/components/localhost/hyphenation/marked-text";
import { LABEL_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { TypographyFeature } from "@/app/components/localhost/hyphenation/typography-feature";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";
import { typeset } from "@/packages/skiptingar/src";

const { typography } = localhostHyphenationContent;

/**
 * Every typesetting rule as a row, Off beside On, across the section's
 * `wide` layout. The typeset text is computed here, with each no-break space
 * shown as a mark. A rule with `options` turns on only that option; the rest
 * are on by default.
 */
export function Typography() {
  return (
    <div className="col-span-full flex flex-col gap-y-sm lg:grid lg:grid-cols-subgrid">
      {/* The column captions, once, over Off and On. Each row also carries
          them, hidden from `lg` up, for a phone and a screen reader. */}
      <div
        aria-hidden="true"
        className="hidden lg:col-span-full lg:grid lg:grid-cols-subgrid"
      >
        <span className={cn(LABEL_CLASS, "lg:col-span-4 lg:col-start-5")}>
          {typography.off}
        </span>
        <span className={cn(LABEL_CLASS, "lg:col-span-4")}>{typography.on}</span>
      </div>
      {typography.rules.map(rule => (
        <TypographyFeature
          key={rule.id}
          label={rule.label}
          off={rule.input}
          on={
            <MarkedText
              text={typeset(rule.input, "options" in rule ? rule.options : undefined)}
            />
          }
          tag={rule.tag}
          tip={rule.tip}
        />
      ))}
    </div>
  );
}
