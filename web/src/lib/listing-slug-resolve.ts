import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugifyCityPathSegment } from "@/lib/slug";

/**
 * Slug için şehir etiketi: city_id varsa her zaman DB'deki canonical isim (form yanlış/boş olsa bile).
 */
export async function resolveCityDisplayNameForListingSlug(
  cityId: string | null | undefined,
  formCityName: string | null | undefined,
): Promise<string> {
  if (cityId) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from("cities").select("name").eq("id", cityId).maybeSingle();
    const n = (data as { name?: string } | null)?.name?.trim();
    if (n) {
      return n;
    }
  }
  const trimmed = (formCityName || "").trim();
  const seg = slugifyCityPathSegment(trimmed);
  if (seg && /^\d+$/.test(seg)) {
    return "";
  }
  return trimmed;
}
