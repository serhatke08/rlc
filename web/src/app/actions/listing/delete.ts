"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function deleteListingServer(listingId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { ok: false, status: 401, message: "Unauthorized" };
    }

    // Verify ownership - get listing with seller_id
    const { data: listing, error: selectError } = await supabase
      .from("listings")
      .select("seller_id, status")
      .eq("id", listingId)
      .single();

    if (selectError || !listing) {
      return { ok: false, status: 404, message: "Listing not found" };
    }

    // Check ownership
    if (listing.seller_id !== user.id) {
      return { ok: false, status: 403, message: "Forbidden: You don't own this listing" };
    }

    // Soft delete - update status to 'deleted'
    const { error: updateError } = await supabase
      .from("listings")
      .update({ status: "deleted" })
      .eq("id", listingId)
      .eq("seller_id", user.id); // Double check ownership in update

    if (updateError) {
      console.error("Error deleting listing:", updateError);
      return { ok: false, status: 500, message: updateError.message || "Failed to delete listing" };
    }

    return { ok: true, status: 200 };
  } catch (error: any) {
    console.error("Unexpected error in deleteListingServer:", error);
    return { ok: false, status: 500, message: error?.message || "Internal server error" };
  }
}

