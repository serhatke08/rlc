import { slugifyCityPathSegment } from "@/lib/slug";
import { stripTrailingTimestampFromListingTitle } from "@/lib/listing-slug";

/** URL segment: free, swap, sale, need, adoption */
export function listingTypeToPathSegment(listingType: string | null | undefined): string {
  const t = (listingType || "").toLowerCase();
  const map: Record<string, string> = {
    give: "free",
    free: "free",
    exchange: "swap",
    swap: "swap",
    sale: "sale",
    need: "need",
    ownership: "adoption",
    adoption: "adoption",
  };
  return map[t] || "free";
}

export function pathSegmentToListingType(segment: string): string | null {
  const s = segment.toLowerCase();
  const map: Record<string, string> = {
    free: "give",
    swap: "exchange",
    sale: "sale",
    need: "need",
    adoption: "ownership",
  };
  return map[s] ?? null;
}

export function itemSlugFromTitle(title: string): string {
  const cleaned = stripTrailingTimestampFromListingTitle(title);
  let s = slugifyCityPathSegment(cleaned);
  if (!s) s = "item";
  return s.slice(0, 80);
}

export type ListingMarket = "uk" | "us";

export function countryCodeToListingMarket(code: string | null | undefined): ListingMarket {
  const c = (code || "").toUpperCase();
  if (c === "US" || c === "USA") return "us";
  return "uk";
}
