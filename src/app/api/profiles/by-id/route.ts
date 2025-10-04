import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // TODO: Implement profile by ID lookup
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}