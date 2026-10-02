import { handleSkiptingarRequest } from "@/packages/skiptingar/src";

/**
 * The page's hyphenation endpoint: the Try it editor and the live specimens
 * send their text here (`configureSkiptingar` in the playground), so the
 * browser never downloads the patterns.
 */
export const POST = (request: Request) => handleSkiptingarRequest(request);
