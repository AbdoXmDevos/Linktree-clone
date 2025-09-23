import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import * as schema from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 }
      );
    }

    const profile = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.id, profileId))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(profile[0]);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}