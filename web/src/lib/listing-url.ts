/**
 * Public listing path: prefer SEO slug; UUID segment still resolves (301 → slug).
 */
export function listingPublicPath(listing: { id: string; slug?: string | null }): string {
  const s = listing.slug?.trim();
  if (s) {
    return `/listing/${s}`;
  }
  return `/listing/${listing.id}`;
}
