import type { City } from "@/lib/types/location";

/** Intro paragraph under H1 on /uk/[city] and /us/[city] */
export function resolveCityPageIntro(city: City): string {
  const t = city.seo_description?.trim();
  if (t) return t;
  return `Find free items, swaps and sales in ${city.name} on ReloopCycle. Join your local community today.`;
}

/** Meta description (~160 chars) */
export function resolveCityMetaDescription(city: City): string {
  const intro = resolveCityPageIntro(city);
  if (intro.length <= 160) return intro;
  return `${intro.slice(0, 157)}...`;
}
