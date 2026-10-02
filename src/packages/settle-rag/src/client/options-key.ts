/** The same value with every object's keys sorted and `undefined` values dropped. */
function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([name, item]) => [name, sortKeys(item)])
    );
  }
  return value;
}

/**
 * A string that is equal for equal options, whatever the key order (nested
 * objects too) and object identity. React can use it as a dependency, so an
 * inline options object does not cause new work on every render.
 */
export function optionsKey(options: object | undefined): string {
  return JSON.stringify(sortKeys(options ?? {}));
}
