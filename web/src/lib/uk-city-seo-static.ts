/**
 * UK city landing SEO copy — static in repo (no DB column required).
 * ~50–100 words per page for Google; listings render below via HomeListings.
 */

const GENERIC_TEMPLATE = (
  city: string,
) => `Looking for free items in ${city}? ReloopCycle is ${city}'s community marketplace for people who want to give, swap, or sell second-hand goods locally instead of throwing them away. Browse furniture, electronics, clothes, baby gear, and more from neighbours in ${city}. Message sellers safely, arrange collection, and keep useful things in use. Whether you are decluttering, moving house, or trying to live more sustainably, ReloopCycle helps ${city} residents save money and cut waste together. Join your local ${city} community today and put the circular economy into practice on your own street.`;

/** Hand-tuned copy for high-traffic slugs (slugifyCityPathSegment output, lower case). */
const BY_SLUG: Record<string, string> = {
  london: `London moves fast — flats change hands, tastes shift, and perfectly good items get left on the pavement. ReloopCycle gives Londoners a better option: a city-wide community to give, swap, or sell second-hand items with people nearby. From Camden to Croydon, you can list what you no longer need or find free and affordable things for your home, family, or hobby. It is built for real neighbourhoods, not anonymous nationwide shipping. Use ReloopCycle in London to declutter with purpose, discover local gems, and help reduce the capital's waste footprint one item at a time.`,

  manchester: `Manchester has always been a city that shares ideas and resources — ReloopCycle brings that spirit to your stuff. Whether you are in the city centre or Greater Manchester, you can give away unwanted items, swap with neighbours, or sell pre-loved goods without listing fees eating your margin. Students, renters, and families use ReloopCycle to furnish flats, kit out kids, and clear spare rooms after a move. It is local, practical, and geared toward reuse instead of landfill. Join Manchester's ReloopCycle community to save money, meet people nearby, and keep valuable items circulating across the region.`,

  birmingham: `Birmingham is one of the UK's largest urban areas — that means huge potential for reuse if we connect the right people. ReloopCycle helps Brummies give, swap, and sell second-hand items across the city and surrounding towns, from small electronics to sofas someone else still needs. List in minutes, browse what's available near you, and message securely. Whether you are downsizing, redecorating, or just clearing the garage, you will find others in Birmingham who want what you are offering. Use ReloopCycle to support a cleaner, thriftier West Midlands and keep good gear in circulation.`,

  liverpool: `From the waterfront to the suburbs, Liverpool residents know how to look after each other — ReloopCycle makes sharing stuff easier. Give away things you no longer need, swap items you would rather trade than buy new, or sell quality second-hand goods to locals who will collect. It is ideal for families, students, and anyone trying to stretch a budget while reducing waste. Listings are tied to real people in the Liverpool area, so you can arrange pickup without complicated postage. Join ReloopCycle in Liverpool and help Merseyside reuse more and throw away less.`,

  leeds: `Leeds blends vibrant city life with Yorkshire practicality — ReloopCycle fits right in. Find free items, swaps, and local sales across Leeds and nearby areas, whether you need office furniture, baby equipment, or hobby gear someone else has outgrown. Listing is straightforward, and you deal with neighbours instead of anonymous buyers miles away. If you are moving house, upgrading tech, or decluttering after a clear-out, ReloopCycle helps your items find a second home in Leeds. Be part of a growing community that saves money and keeps usable goods out of the bin.`,

  bristol: `Bristol cares about creativity and the environment — ReloopCycle turns that into action on your doorstep. Give away items you no longer use, swap with people who share your values, or sell second-hand goods to locals who will collect. From Clifton to the eastern fringe, you can browse listings across the city and message securely. It is a simple way to support reuse, meet people nearby, and avoid unnecessary packaging and delivery emissions. Use ReloopCycle in Bristol to live lighter, spend smarter, and keep great items circulating in the West Country.`,

  sheffield: `Sheffield is built on industry and community — ReloopCycle helps both by making reuse easy across the city and South Yorkshire. List furniture, tools, clothes, or kids' items you no longer need, or discover what others are giving away or swapping nearby. Students, renters, and homeowners all use the platform to furnish spaces and clear them without sending vanloads to the tip. Local messaging means you can arrange collection that suits you. Join Sheffield's ReloopCycle users to save money, reduce waste, and support a circular economy in the Steel City.`,

  edinburgh: `Edinburgh's compact footprint and busy rental market mean furniture and household goods change hands constantly — ReloopCycle helps you do it responsibly. Give, swap, or sell second-hand items to people in Edinburgh and nearby, from textbooks to white goods. The platform is built for local handover, so you avoid unnecessary shipping across the UK. Whether you are a student leaving halls, a family upgrading, or someone downsizing, you will find others who need what you are offering. Use ReloopCycle in Edinburgh to support reuse, save money, and keep Scotland's capital a little greener.`,

  glasgow: `Glasgow is full of people who know how to get things done — ReloopCycle helps you pass on goods the smart way. List items you no longer need, browse free and affordable second-hand finds across the city, and message locals securely. From the West End to the Southside, you can arrange pickup that works for both sides. It is ideal for clearing flats, kitting out a first home, or finding parts and kit without buying new. Join Glasgow's ReloopCycle community to cut waste, save cash, and keep useful things in use across Scotland's largest city.`,

  cardiff: `Cardiff and South Wales have a strong sense of place — ReloopCycle connects neighbours who want to reuse instead of dumping. Give away household items, swap hobby gear, or sell quality second-hand goods to people who can collect locally. Whether you are in the city centre or the wider capital region, listings help you find takers without complicated logistics. Students, young professionals, and families all benefit from a marketplace focused on the circular economy. Use ReloopCycle in Cardiff to declutter kindly, shop sustainably, and support Welsh communities that care about waste.`,
};

export function getUkCitySeoBody(citySlug: string, cityName: string): string {
  const key = citySlug.toLowerCase().trim();
  const fixed = BY_SLUG[key];
  if (fixed) return fixed;
  return GENERIC_TEMPLATE(cityName);
}

/** Meta tag (~155 chars); independent of body length. */
export function getUkCityMetaDescription(cityName: string): string {
  const s = `Free stuff, swaps & second-hand sales in ${cityName}. Browse local listings on ReloopCycle — give, get, and reuse items near you.`;
  return s.length <= 160 ? s : `${s.slice(0, 157)}...`;
}
