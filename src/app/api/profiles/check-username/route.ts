import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // TODO: Implement username availability check
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}