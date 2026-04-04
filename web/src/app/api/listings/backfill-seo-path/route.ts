import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  computeSeoPathForExistingListing,
  persistListingSeoPath,
} from "@/lib/listing-seo-path-server";

/**
 * Tek seferlik toplu doldurma: Authorization: Bearer <LISTING_SEO_BACKFILL_SECRET>
 * Gerekli: SUPABASE_SERVICE_ROLE_KEY + LISTING_SEO_BACKFILL_SECRET (Vercel env)
 */
export async function POST(request: Request) {
  const secret = process.env.LISTING_SEO_BACKFILL_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "LISTING_SEO_BACKFILL_SECRET is not set" },
      { status: 503 },
    );
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not set" },
      { status: 503 },
    );
  }

  const { data: rows, error } = await admin
    .from("listings")
    .select("id")
    .eq("status", "active")
    .is("seo_path", null)
    .limit(2000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let written = 0;
  let failed = 0;
  let skipped = 0;

  for (const r of rows || []) {
    const id = (r as { id: string }).id;
    const path = await computeSeoPathForExistingListing(id);
    if (!path) {
      skipped++;
      continue;
    }
    const saved = await persistListingSeoPath(id, path);
    if (saved) {
      written++;
    } else {
      failed++;
    }
  }

  return NextResponse.json({
    scanned: (rows || []).length,
    written,
    failed,
    skippedNoPath: skipped,
  });
}
