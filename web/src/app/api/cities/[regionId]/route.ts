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

  const { data, error } = await supabase
    .from("cities")
    .select("id, name, region_id, country_id")
    .eq("region_id", resolvedParams.regionId)
    .order("name", { ascending: true })
    .limit(100);

  if (error) {
    console.error("❌ Supabase error:", error);
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: 500 }
    );
  }

  console.log("✅ Cities fetched:", data?.length || 0);
  return NextResponse.json(data || []);
}

