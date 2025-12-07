// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image_url: string | null;
  listing_count: number | null;
  order_index: number | null;
}

