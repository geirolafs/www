import { LABEL_CLASS } from "@/app/components/localhost/fluid-typography/styles";
import { MarkedText } from "@/app/components/localhost/skiptingar/marked-text";
import { TypographyFeature } from "@/app/components/localhost/skiptingar/typography-feature";
import { localhostSkiptingarContent } from "@/lib/content/localhost-skiptingar";
import { cn } from "@/lib/utils";
import { typeset } from "@/packages/skiptingar/src";

const { noBreak } = localhostSkiptingarContent;

/**
 * The typesetting rules where Icelandic doesn't break, as rows, Off beside On, across the section's
 * `wide` layout. The typeset text is computed here, with each no-break space
 * shown as a mark. A rule with `options` turns on only that option; the rest
 * are on by default.
 */
export function Typography() {
  const { off, on, rules } = noBreak;

  return (
    <div className="col-span-full flex flex-col lg:grid lg:grid-cols-subgrid">
      {/* The column captions, once, over Off and On. Each row also carries
          them, hidden from `lg` up, for a phone and a screen reader. */}
      <div
        aria-hidden="true"
        className="hidden lg:col-span-full lg:grid lg:grid-cols-subgrid lg:pb-sm"
      >
        <span className={cn(LABEL_CLASS, "lg:col-span-4 lg:col-start-5")}>{off}</span>
        <span className={cn(LABEL_CLASS, "lg:col-span-4")}>{on}</span>
      </div>
      {rules.map(rule => (
        <TypographyFeature
          captions={{ off, on }}
          key={rule.id}
          label={rule.label}
          measure={"measure" in rule ? rule.measure : undefined}
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
