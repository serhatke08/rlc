export const ukCitySeo: Record<string, string> = {
  london:
    "Looking for free items in London? İkel is London's community platform to give, get, swap or sell second-hand items locally. Join thousands of Londoners reducing waste and saving money.",
  manchester:
    "Looking for free items in Manchester? İkel connects Manchester locals to give, swap and sell second-hand items. Join your local Manchester community today.",
  birmingham:
    "Find free items, swaps and sales in Birmingham on İkel. Join Birmingham's growing community and help reduce waste.",
  liverpool:
    "İkel connects Liverpool locals to share, swap and rehome unwanted items for free. Join Liverpool's circular economy community.",
  leeds:
    "Find free stuff, swaps and local sales in Leeds on İkel. Help reduce waste and save money in your Leeds community.",
  bristol:
    "İkel is Bristol's platform for free items, swaps and local sales. Join Bristol's eco-friendly reuse community today.",
  sheffield:
    "Give, get or swap items for free in Sheffield on İkel. Join Sheffield's growing reuse and circular economy community.",
  edinburgh:
    "Find free items and swaps in Edinburgh on İkel. Connect with your local Edinburgh community to give and get second-hand items.",
  glasgow:
    "İkel connects Glasgow locals to share, swap and rehome unwanted items. Join Glasgow's free reuse community today.",
  cardiff:
    "Find free stuff and swaps in Cardiff on İkel. Join Cardiff's community platform for giving, getting and swapping items locally.",
};

export function getCitySeoText(slug: string, cityName: string): string {
  const key = slug.toLowerCase().trim();
  return (
    ukCitySeo[key] ??
    `Looking for free items in ${cityName}? İkel is ${cityName}'s community platform to give, get, swap or sell second-hand items locally. Join your local community today.`
  );
}

export function getCityMetaDescriptionFirst160(slug: string, cityName: string): string {
  const full = getCitySeoText(slug, cityName);
  return full.length <= 160 ? full : `${full.slice(0, 157)}...`;
}
