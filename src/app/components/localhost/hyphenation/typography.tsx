import { MarkedText } from "@/app/components/localhost/hyphenation/marked-text";
import { TypographyFeature } from "@/app/components/localhost/hyphenation/typography-feature";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { typeset } from "@/packages/skiptingar/src";

const { typography } = localhostHyphenationContent;

/**
 * Every typesetting rule as an Off/On row. The typeset text is computed here,
 * with each no-break space shown as a mark, and handed to the client toggle as
 * ready-made nodes. A rule with `options` turns on only that option; the rest
 * are on by default.
 */
export function Typography() {
  return (
    <div className="flex flex-col gap-sm">
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
