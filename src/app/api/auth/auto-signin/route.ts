import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import * as schema from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        const { profileId } = await request.json();

        if (!profileId) {
            return NextResponse.json(
                { error: "Profile ID is required" },
                { status: 400 }
            );
        }

        // Get the profile and associated user
        const profile = await db
            .select({
                profileId: schema.profiles.id,
                userId: schema.profiles.user_id,
                userEmail: schema.users.email,
                userName: schema.users.name,
            })
            .from(schema.profiles)
            .innerJoin(schema.users, eq(schema.profiles.user_id, schema.users.id))
            .where(eq(schema.profiles.id, profileId))
            .limit(1);

        if (profile.length === 0) {
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 }
            );
        }

        const user = profile[0];

        // Return user data for auto-signin
        return NextResponse.json({
            success: true,
            user: {
                id: user.userId,
                email: user.userEmail,
                name: user.userName,
            }
        });
    } catch (error) {
        console.error("Auto-signin error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}