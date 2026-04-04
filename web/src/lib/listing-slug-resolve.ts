import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugifyCityPathSegment } from "@/lib/slug";

/**
 * Şehir segmenti için metin: önce `listings.city_name` (kullanıcının gördüğü lokasyon),
 * boşsa veya saçma (sadece rakam) ise `cities.name` (city_id ile).
 */
export async function resolveCityDisplayNameForListingSlug(
  cityId: string | null | undefined,
  cityNameFromListing: string | null | undefined,
): Promise<string> {
  const raw = (cityNameFromListing || "").trim();
  if (raw) {
    const seg = slugifyCityPathSegment(raw);
    if (seg && !/^\d+$/.test(seg)) {
      return raw;
    }
  }
  if (cityId) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from("cities").select("name").eq("id", cityId).maybeSingle();
    const n = (data as { name?: string } | null)?.name?.trim();
    if (n) {
      return n;
    }
  }
  return "";
}
