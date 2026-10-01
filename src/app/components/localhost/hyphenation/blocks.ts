/**
 * The editor's text as blocks. A blank line ends a block, and a block that
 * starts with `# ` is a title. Pure functions, so the server and the client
 * split a text the same way.
 */

export type Block = { id: number; kind: "title" | "body"; text: string };

const BLANK_LINES = /\n\s*\n/;
const TITLE = /^#\s+/;

export function parseBlocks(text: string): Block[] {
  return text
    .split(BLANK_LINES)
    .map(block => block.trim())
    .filter(block => block !== "")
    .map((block, id) =>
      TITLE.test(block)
        ? { id, kind: "title", text: block.replace(TITLE, "") }
        : { id, kind: "body", text: block }
    );
}

/**
 * The first body block, for the specimens that set one paragraph: Sizes and
 * Compare. A text with no body block gives its first title instead.
 */
export function firstParagraph(text: string): string {
  const blocks = parseBlocks(text);
  return (blocks.find(block => block.kind === "body") ?? blocks[0])?.text ?? "";
}
