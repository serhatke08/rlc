import { NextResponse } from "next/server";
import { POPULAR_SEARCHES } from "@/data/homepage";

export function GET() {
  return NextResponse.json({ searches: POPULAR_SEARCHES });
}
