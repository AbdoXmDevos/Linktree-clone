import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import * as schema from "../../../../db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { userId, username, displayName, bio, avatarUrl } = await request.json();

    if (!userId || !username || !displayName) {
      return NextResponse.json(
        { error: "User ID, username, and display name are required" },
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

    // Update user's name with the display name
    await db
      .update(schema.users)
      .set({ name: displayName })
      .where(eq(schema.users.id, userId));

    // Create profile
    const newProfile = await db
      .insert(schema.profiles)
      .values({
        user_id: userId,
        username,
        display_name: displayName,
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

export async function PUT(request: NextRequest) {
  try {
    const { profileId, displayName, bio, avatarUrl } = await request.json();

    if (!profileId || !displayName) {
      return NextResponse.json(
        { error: "Profile ID and display name are required" },
        { status: 400 }
      );
    }

    // Update profile
    const updatedProfile = await db
      .update(schema.profiles)
      .set({
        display_name: displayName,
        bio: bio || null,
        avatar_url: avatarUrl || null,
      })
      .where(eq(schema.profiles.id, profileId))
      .returning();

    if (updatedProfile.length === 0) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Also update the user's name in the users table
    await db
      .update(schema.users)
      .set({ name: displayName })
      .where(eq(schema.users.id, updatedProfile[0].user_id));

    return NextResponse.json(
      { 
        message: "Profile updated successfully", 
        profile: updatedProfile[0] 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}