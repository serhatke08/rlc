/** Shared Supabase select for listing detail (legacy /listing and hierarchical /uk/... /us/...) */
export const LISTING_PAGE_DETAIL_SELECT = `
  *,
  seller:profiles(id, username, display_name, avatar_url, reputation, joined_at),
  country:countries(name, code, flag_emoji),
  region:regions(name, code),
  city:cities(name, is_major),
  category:product_categories(name, slug)
`;
