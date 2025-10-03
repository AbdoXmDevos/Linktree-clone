import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { updateAnalyticsConsent } from "../../../../lib/actions/analytics";

// POST /api/analytics/consent - Update analytics consent
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { profileId, analyticsEnabled } = body;

    if (!profileId || typeof analyticsEnabled !== "boolean") {
      return NextResponse.json(
        { error: "Profile ID and analytics enabled status are required" },
        { status: 400 }
      );
    }

    const result = await updateAnalyticsConsent(profileId, analyticsEnabled);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("Analytics consent error:", error);
    return NextResponse.json(
      { error: "Failed to update analytics consent" },
      { status: 500 }
    );
  }
}