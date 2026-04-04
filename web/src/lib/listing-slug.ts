import { slugifyCityPathSegment } from "@/lib/slug";

const MAX_BASE_LEN = 200;

/**
 * Single URL segment: "{title-slug}-{city-slug}" e.g. vintage-wooden-chair-london
 */
export function buildListingSlugBase(title: string, cityDisplayName: string): string {
  const t = slugifyCityPathSegment(title);
  const c = slugifyCityPathSegment(cityDisplayName);
  /** Sadece rakamlardan oluşan “şehir” segmenti (timestamp vb.) URL’e konmasın */
  const cSafe = c && /^\d+$/.test(c) ? "" : c;
  if (!t && !cSafe) return "listing";
  if (!t) return cSafe.slice(0, MAX_BASE_LEN);
  if (!cSafe) return t.slice(0, MAX_BASE_LEN);
  const combined = `${t}-${cSafe}`;
  return combined.length <= MAX_BASE_LEN ? combined : combined.slice(0, MAX_BASE_LEN);
}

/**
 * İlk çakışmada -2, sonra -3 … (base aynı kalır)
 */
export function listingSlugWithSuffix(base: string, duplicateIndex: number): string {
  if (duplicateIndex <= 0) return base;
  return `${base}-${duplicateIndex + 1}`;
}
