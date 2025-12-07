"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type ListingRow = Database["public"]["Tables"]["listings"]["Row"];

type ListingUpdateData = {
  title?: string;
  description?: string;
  category_id?: string | null;
  subcategory_id?: string | null;
  listing_type?: string;
  condition?: string;
  region_id?: string | null;
  city_id?: string | null;
  city_name?: string;
  district_name?: string | null;
  images?: string[];
  thumbnail_url?: string;
  updated_at?: string;
};

export async function updateListingServer(
  listingId: string,
  updates: ListingUpdateData
) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { ok: false, status: 401, message: "Unauthorized" };
    }

    // Verify ownership
    const { data: listing, error: selectError } = await supabase
      .from("listings")
      .select("seller_id")
      .eq("id", listingId)
      .single();

    if (selectError || !listing) {
      return { ok: false, status: 404, message: "Listing not found" };
    }

    // Type assertion for selected fields
    const listingData = listing as Pick<ListingRow, "seller_id">;

    if (listingData.seller_id !== user.id) {
      return { ok: false, status: 403, message: "Forbidden: You don't own this listing" };
    }

    // Whitelist allowed fields only
    const allowedFields: ListingUpdateData = {
      title: updates.title?.trim(),
      description: updates.description?.trim(),
      category_id: updates.category_id || null,
      subcategory_id: updates.subcategory_id || null,
      listing_type: updates.listing_type,
      condition: updates.condition,
      region_id: updates.region_id || null,
      city_id: updates.city_id || null,
      city_name: updates.city_name,
      district_name: updates.district_name || null,
      images: updates.images,
      thumbnail_url: updates.thumbnail_url,
      updated_at: updates.updated_at || new Date().toISOString(),
    };

    // Remove undefined fields
    const cleanUpdates = Object.fromEntries(
      Object.entries(allowedFields).filter(([_, v]) => v !== undefined)
    ) as ListingUpdateData;

    // Update listing with ownership check
    const { error: updateError } = await (supabase
      .from("listings") as any)
      .update(cleanUpdates)
      .eq("id", listingId)
      .eq("seller_id", user.id); // Double check ownership in update

    if (updateError) {
      console.error("Error updating listing:", updateError);
      return { ok: false, status: 500, message: updateError.message || "Failed to update listing" };
    }

    return { ok: true, status: 200 };
  } catch (error: any) {
    console.error("Unexpected error in updateListingServer:", error);
    return { ok: false, status: 500, message: error?.message || "Internal server error" };
  }
}

