import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import * as schema from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const existingProfile = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.username, username))
      .limit(1);

    return NextResponse.json({
      available: existingProfile.length === 0,
    });
  } catch (error) {
    console.error("Username check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}