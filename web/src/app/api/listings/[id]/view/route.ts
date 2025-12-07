import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }> | { id: string };
}

export async function POST(
  req: Request,
  { params }: RouteParams
) {
  try {
    // Resolve params (Next.js 15+ compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const listingId = resolvedParams.id;

    if (!listingId) {
      return NextResponse.json(
        { ok: false, message: "Listing ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    
    // Get authenticated user (optional - allow anonymous views)
    const { data: { user } } = await supabase.auth.getUser();

    // Check if user has viewed this listing in the last 24 hours
    if (user) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data: recentView } = await supabase
        .from("listing_views")
        .select("id")
        .eq("listing_id", listingId)
        .eq("user_id", user.id)
        .gte("created_at", twentyFourHoursAgo)
        .limit(1)
        .maybeSingle();

      if (recentView) {
        // Already counted in last 24 hours
        return NextResponse.json({ ok: false, reason: "Already counted" });
      }

      // Record the view
      await supabase
        .from("listing_views")
        .insert({
          listing_id: listingId,
          user_id: user.id,
        });
    } else {
      // For anonymous users, use IP-based rate limiting
      // Note: This is a basic implementation. For production, consider using
      // Upstash Ratelimit or similar service with Redis
      const ip = req.headers.get("x-forwarded-for") || 
                 req.headers.get("x-real-ip") || 
                 "unknown";
      
      // Basic check: allow one view per IP per hour for anonymous users
      // In production, implement proper rate limiting with Redis/Upstash
      // For now, we'll just increment the count (RLS should handle abuse)
    }

    // Increment view count
    const { error: updateError } = await supabase.rpc("increment_listing_view_count", {
      listing_id: listingId,
    });

    // If RPC doesn't exist, fall back to direct update
    if (updateError) {
      const { data: listing } = await supabase
        .from("listings")
        .select("view_count")
        .eq("id", listingId)
        .single();

      if (listing) {
        await supabase
          .from("listings")
          .update({ view_count: (listing.view_count || 0) + 1 })
          .eq("id", listingId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error in view count API:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

