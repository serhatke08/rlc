import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  countryCodeToListingMarket,
  itemSlugFromTitle,
  listingTypeToPathSegment,
  type ListingMarket,
} from "@/lib/listing-seo-path";
import { slugifyCityPathSegment } from "@/lib/slug";
import { listingSlugWithSuffix } from "@/lib/listing-slug";

export async function getCityMarketAndSlugForListing(
  cityId: string | null,
): Promise<{ market: ListingMarket; citySlug: string } | null> {
  if (!cityId) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("cities")
    .select("name, country:countries(code)")
    .eq("id", cityId)
    .maybeSingle();

  const row = data as { name?: string; country?: { code?: string } | null } | null;
  if (!row?.name) return null;
  const code = row.country?.code ?? null;
  const market = countryCodeToListingMarket(code);
  const citySlug = slugifyCityPathSegment(row.name);
  if (!citySlug) return null;
  return { market, citySlug };
}

/**
 * `uk/manchester/free/electronics/iphone-12` — başında / yok, DB ile aynı
 */
export async function allocateUniqueSeoPath(
  params: {
    cityId: string | null;
    cityName: string | null;
    categoryId: string | null;
    title: string;
    listingType: string | null;
    excludeListingId?: string;
  },
): Promise<string | null> {
  const { cityId, cityName, categoryId, title, listingType, excludeListingId } = params;

  const loc = await getCityMarketAndSlugForListing(cityId);
  if (!loc) {
    return null;
  }

  const { market, citySlug } = loc;
  const intent = listingTypeToPathSegment(listingType);
  const supabase = await createSupabaseServerClient();

  let categorySlug = "general";
  if (categoryId) {
    const { data: cat } = await supabase
      .from("product_categories")
      .select("slug")
      .eq("id", categoryId)
      .maybeSingle();
    const cs = (cat as { slug?: string } | null)?.slug?.trim();
    if (cs) categorySlug = slugifyCityPathSegment(cs) || cs;
  }

  const itemBase = itemSlugFromTitle(title);
  const prefix = `${market}/${citySlug}/${intent}/${categorySlug}`;

  for (let i = 0; i < 500; i++) {
    const itemSeg = listingSlugWithSuffix(itemBase, i);
    const seo_path = `${prefix}/${itemSeg}`;

    const { data: hit, error } = await supabase
      .from("listings")
      .select("id")
      .eq("seo_path", seo_path)
      .maybeSingle();
    if (error) continue;
    const row = hit as { id: string } | null;
    if (!row) {
      return seo_path;
    }
    if (excludeListingId && row.id === excludeListingId) {
      return seo_path;
    }
  }

  return null;
}

/** Mevcut kayıt için seo_path üret (backfill / güncelleme) */
export async function computeSeoPathForExistingListing(
  listingId: string,
): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase
    .from("listings")
    .select("id, title, listing_type, category_id, city_id, city_name")
    .eq("id", listingId)
    .single();

  if (error || !row) return null;
  const r = row as {
    id: string;
    title: string;
    listing_type: string | null;
    category_id: string | null;
    city_id: string | null;
    city_name: string | null;
  };

  return allocateUniqueSeoPath({
    cityId: r.city_id,
    cityName: r.city_name,
    categoryId: r.category_id,
    title: r.title,
    listingType: r.listing_type,
    excludeListingId: r.id,
  });
}

/**
 * seo_path yazımı — anon ziyaretçi RLS yüzünden güncelleyemez; service role gerekir.
 */
export async function persistListingSeoPath(
  listingId: string,
  seoPath: string,
): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return false;
  }
  const { error } = await (admin.from("listings") as any).update({ seo_path: seoPath }).eq("id", listingId);
  return !error;
}
