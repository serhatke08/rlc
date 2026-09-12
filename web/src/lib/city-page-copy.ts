import type { City } from "@/lib/types/location";

/** Intro paragraph under H1 on /us/[city] — copy is static (no DB SEO column). */
export function resolveCityPageIntro(city: City): string {
  return `Find free items, swaps and sales in ${city.name} on İkel. Join your local community today.`;
}

/** Meta description (~160 chars) */
export function resolveCityMetaDescription(city: City): string {
  const intro = resolveCityPageIntro(city);
  if (intro.length <= 160) return intro;
  return `${intro.slice(0, 157)}...`;
}
