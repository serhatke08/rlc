import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildListingSlugBase, listingSlugWithSuffix } from "@/lib/listing-slug";

async function isSlugAvailable(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  candidate: string,
  excludeListingId?: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("listings")
    .select("id")
    .eq("slug", candidate)
    .maybeSingle();

  if (error) {
    return false;
  }
  const row = data as { id: string } | null;
  if (!row) {
    return true;
  }
  if (excludeListingId && row.id === excludeListingId) {
    return true;
  }
  return false;
}

export async function allocateUniqueListingSlug(
  title: string,
  cityDisplayName: string,
  excludeListingId?: string,
): Promise<string> {
  const supabase = await createSupabaseServerClient();
  let base = buildListingSlugBase(title, cityDisplayName);
  if (!base) {
    base = "listing";
  }

  for (let i = 0; i < 500; i++) {
    const candidate = listingSlugWithSuffix(base, i);
    const ok = await isSlugAvailable(supabase, candidate, excludeListingId);
    if (ok) {
      return candidate;
    }
  }

  throw new Error("Could not allocate unique listing slug");
}
