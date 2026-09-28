import type { PortfolioMedia } from "@/lib/content/portfolio";

/**
 * Fisher–Yates on a copy of the input. Uniform over all permutations.
 */
function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];

  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = out[i];
    const b = out[j];
    out[i] = b;
    out[j] = a;
  }

  return out;
}

/**
 * The order the carousel runs in for one visit.
 *
 * Everything from card 3 on is a plain uniform shuffle. The only constraint is
 * on the head of the strip: **exactly one of the first two cards is a video.**
 * Two stills side by side is the one opening the design rules out, and since
 * those two cards are all that is on screen at the narrow end, a still pair
 * reads as a page that has not finished loading.
 *
 * Card 1 is a uniform pick over everything — video or image, no thumb on the
 * scale. Card 2 is then whichever kind card 1 is not.
 *
 * Picking card 2 as the *first* item of the wanted kind in an already-shuffled
 * pool is a uniform pick over that kind, not a biased one: in a uniform random
 * permutation every member of a subset is equally likely to be the earliest of
 * that subset. So this is one shuffle, not a shuffle plus a second draw.
 */
export function buildCarouselOrder(
  media: readonly PortfolioMedia[]
): readonly PortfolioMedia[] {
  const order = shuffle(media);

  const first = order[0];
  const second = order[1];

  // Fewer than two assets: there is no pair to constrain.
  if (!(first && second)) {
    return order;
  }

  const wantedKind = first.kind === "video" ? "image" : "video";

  if (second.kind === wantedKind) {
    return order;
  }

  const partnerIndex = order.findIndex(
    (item, index) => index > 1 && item.kind === wantedKind
  );

  // The manifest holds only one kind. Nothing to swap in; leave the shuffle be
  // rather than fail.
  if (partnerIndex === -1) {
    return order;
  }

  const partner = order[partnerIndex];
  if (partner) {
    order[partnerIndex] = second;
    order[1] = partner;
  }

  return order;
}
