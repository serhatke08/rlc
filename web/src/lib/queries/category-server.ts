import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types/category";

// Server-side queries for categories (only use in Server Components)
export async function getCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("product_categories")
      .select("id, name, slug, icon, image_url, listing_count, order_index")
      .order("order_index", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true })
      .limit(50);

    if (error) {
      console.error("Error fetching categories:", JSON.stringify(error, null, 2));
      return [];
    }

    return (data || []) as Category[];
  } catch (err) {
    console.error("Unexpected error in getCategories:", err);
    return [];
  }
}

