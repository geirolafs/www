/**
 * JSON for an inline `<script type="application/ld+json">`. Plain
 * `JSON.stringify` leaves `<` as is, so a string containing `</script>`
 * would close the tag early. The escape `<` is the same character to
 * a JSON parser, but not to the HTML parser.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
