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

    // Check if username meets requirements
    if (username.length < 3 || username.length > 30) {
      return NextResponse.json({
        available: false,
        error: "Username must be between 3 and 30 characters"
      });
    }

    // Check if username contains only allowed characters
    const validUsername = /^[a-z0-9_-]+$/.test(username);
    if (!validUsername) {
      return NextResponse.json({
        available: false,
        error: "Username can only contain lowercase letters, numbers, hyphens, and underscores"
      });
    }

    // Check if username is already taken
    const existingProfile = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.username, username))
      .limit(1);

    const available = existingProfile.length === 0;

    return NextResponse.json({
      available,
      username
    });
  } catch (error) {
    console.error("Username check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}