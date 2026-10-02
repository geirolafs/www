/**
 * The title with each typed hyphen in red (`hy-signal`), the colour the
 * specimens below give a break. The bar's page name uses it too, so it is the
 * hero's title at a smaller size.
 */
export function marked(title: string) {
  let offset = 0;
  return title.split(/(-)/).map(part => {
    const key = offset;
    offset += part.length;
    return part === "-" ? (
      <span className="text-hy-signal" key={key}>
        -
      </span>
    ) : (
      part
    );
  });
}
