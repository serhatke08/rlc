export type ListingLifecycle = "available" | "reserved" | "claimed" | "pending";
export type ListingCondition = "new" | "like_new" | "used" | "for_parts";
export type ListingIntent = "give" | "swap" | "lend" | "sell" | "need" | "adoption";

export interface FeaturedListing {
  id: string;
  title: string;
  description: string;
  city: string;
  region?: string | null;
  country?: string | null;
  category: string;
  categoryId?: string | null;
  subcategoryId?: string | null;
  condition: ListingCondition;
  status: ListingLifecycle;
  price?: string | null;
  currency?: string | null;
  listingType: ListingIntent;
  coverImage?: string | null;
  tags: string[];
  createdAt: string;
  views: number;
  comments: number;
  metadata?: Record<string, unknown>;
}

