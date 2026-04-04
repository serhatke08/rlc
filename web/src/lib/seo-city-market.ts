import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { City, Country } from "@/lib/types/location";
import { getSeoCityMarketFromHost, type SeoCityMarket } from "@/lib/domain";

/**
 * Location dropdown: path prefix for SEO city URLs.
 * UK profile → /uk/…; US profile → /us/…; anon / unknown → domain default (.co.uk → uk, .com → us).
 */
export function resolveCityPathPrefixFromCountry(
  country: Country | null,
  domainMarket: SeoCityMarket,
): "uk" | "us" {
  if (!country) {
    return domainMarket;
  }
  const code = (country.code || "").toUpperCase();
  const name = (country.name || "").toLowerCase();
  if (
    code === "GB" ||
    code === "SCT" ||
    code === "WLS" ||
    code === "NIR" ||
    code === "ENG" ||
    name === "england" ||
    name.includes("united kingdom")
  ) {
    return "uk";
  }
  if (code === "US" || code === "USA" || name === "united states" || name.includes("united states")) {
    return "us";
  }
  return domainMarket;
}

/** Old ?cityId= redirects → /uk/ or /us/ based on city’s country, then host. */
export async function resolveSeoMarketForCity(city: Pick<City, "country_id">): Promise<"uk" | "us"> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("countries").select("code").eq("id", city.country_id).maybeSingle();
  const code = ((data as { code?: string } | null)?.code || "").toUpperCase();
  if (["GB", "SCT", "WLS", "NIR", "ENG"].includes(code)) {
    return "uk";
  }
  if (["US", "USA"].includes(code)) {
    return "us";
  }
  return getSeoCityMarketFromHost();
}
