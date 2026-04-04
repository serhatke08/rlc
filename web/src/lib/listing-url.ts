/**
 * Public listing path: hierarchical `seo_path` when set; else legacy `/listing/{slug}`; else UUID.
 */
export function listingPublicPath(listing: {
  id: string;
  slug?: string | null;
  seo_path?: string | null;
}): string {
  const sp = listing.seo_path?.trim();
  if (sp) {
    return `/${sp}`;
  }
  const s = listing.slug?.trim();
  if (s) {
    return `/listing/${s}`;
  }
  return `/listing/${listing.id}`;
}
