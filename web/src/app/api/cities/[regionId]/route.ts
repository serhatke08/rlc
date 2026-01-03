import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ regionId: string }> | { regionId: string } }
) {
  // Next.js 16'da params Promise olabilir - await et
  const resolvedParams = params instanceof Promise ? await params : params;
  
  console.log("🔍 API REGION PARAM:", resolvedParams);
  console.log("🔍 API REGION PARAM regionId:", resolvedParams?.regionId);

  if (!resolvedParams?.regionId) {
    console.error("❌ Region ID is missing in params:", resolvedParams);
    return NextResponse.json(
      { error: "Region ID is missing" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  // Use cities_full_info view to get cities with full info
  const { data, error } = await supabase
    .from("cities_full_info")
    .select("city_id, city_name, region_id, country_id")
    .eq("region_id", resolvedParams.regionId)
    .order("city_name", { ascending: true })
    .limit(100);

  if (error) {
    console.error("❌ Supabase error:", error);
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: 500 }
    );
  }

  console.log("✅ Cities fetched:", data?.length || 0);

  // Map view columns to City interface
  const cities = (data || []).map((c: any) => ({
    id: c.city_id,
    name: c.city_name,
    region_id: c.region_id,
    country_id: c.country_id,
  }));

  // Return direct array (not wrapped in object) - create-listing expects array
  return NextResponse.json(cities);
}

