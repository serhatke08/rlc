import { slugifyCityPathSegment } from "@/lib/slug";

const MAX_BASE_LEN = 200;

/**
 * Single URL segment: "{title-slug}-{city-slug}" e.g. vintage-wooden-chair-london
 */
export function buildListingSlugBase(title: string, cityDisplayName: string): string {
  const t = slugifyCityPathSegment(title);
  const c = slugifyCityPathSegment(cityDisplayName);
  if (!t && !c) return "listing";
  if (!t) return c.slice(0, MAX_BASE_LEN);
  if (!c) return t.slice(0, MAX_BASE_LEN);
  const combined = `${t}-${c}`;
  return combined.length <= MAX_BASE_LEN ? combined : combined.slice(0, MAX_BASE_LEN);
}

/**
 * İlk çakışmada -2, sonra -3 … (base aynı kalır)
 */
export function listingSlugWithSuffix(base: string, duplicateIndex: number): string {
  if (duplicateIndex <= 0) return base;
  return `${base}-${duplicateIndex + 1}`;
}
