/**
 * URL path segment for city SEO pages: lowercase ASCII, hyphen-separated.
 * Derived from display name (no DB slug column).
 */
export function slugifyUkCityPathSegment(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";

  const ascii = trimmed
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");

  return ascii
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

export function isValidUkCitySlugFormat(slug: string): boolean {
  if (!slug || slug.length > 120) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export const slugifyCityPathSegment = slugifyUkCityPathSegment;
export const isValidCitySlugFormat = isValidUkCitySlugFormat;
