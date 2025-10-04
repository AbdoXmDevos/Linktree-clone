import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { updateProfile, type ProfileUpdateData } from "../../../lib/actions/profile";
import { db } from "../../../../lib/db";
import { profiles } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { display_name, bio, avatar_url }: ProfileUpdateData = body;

    // Validate required fields
    if (display_name === undefined || bio === undefined || avatar_url === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user's profile
    const userProfiles = await db
      .select()
      .from(profiles)
      .where(eq(profiles.user_id, session.user.id))
      .limit(1);

    if (userProfiles.length === 0) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const profile = userProfiles[0];

    // Update profile
    const result = await updateProfile(profile.id, {
      display_name,
      bio,
      avatar_url
    });

    if (!result.success) {
      const statusCode = result.error?.type === 'validation' ? 400 : 
                        result.error?.type === 'not_found' ? 404 : 500;
      
      return NextResponse.json(
        { error: result.error?.message || "Failed to update profile" },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error("Profile update API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's profile
    const userProfiles = await db
      .select()
      .from(profiles)
      .where(eq(profiles.user_id, session.user.id))
      .limit(1);

    if (userProfiles.length === 0) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: userProfiles[0]
    });

  } catch (error) {
    console.error("Profile fetch API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}