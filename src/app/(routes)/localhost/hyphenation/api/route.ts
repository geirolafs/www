import { handleSkiptingarRequest } from "@/packages/skiptingar/src";

/**
 * The playground's hyphenation endpoint: the editor and the live specimens
 * send their text here (`configureSkiptingar` in `playground.tsx`), so the
 * browser never downloads the patterns.
 */
export const POST = (request: Request) => handleSkiptingarRequest(request);
