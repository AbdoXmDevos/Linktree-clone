import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import * as schema from "../../../../db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { userId, username, displayName, bio, avatarUrl } = await request.json();

    if (!userId || !username) {
      return NextResponse.json(
        { error: "User ID and username are required" },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const existingProfile = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.username, username))
      .limit(1);

    if (existingProfile.length > 0) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    // Check if user already has a profile
    const userProfile = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.user_id, userId))
      .limit(1);

    if (userProfile.length > 0) {
      return NextResponse.json(
        { error: "User already has a profile" },
        { status: 400 }
      );
    }

    // Create profile
    const newProfile = await db
      .insert(schema.profiles)
      .values({
        user_id: userId,
        username,
        display_name: displayName || null,
        bio: bio || null,
        avatar_url: avatarUrl || null,
        theme_id: null, // Will be set later when user chooses a theme
        created_at: new Date(),
      })
      .returning();

    return NextResponse.json(
      { 
        message: "Profile created successfully", 
        profile: newProfile[0] 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Profile creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const profile = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.user_id, userId))
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