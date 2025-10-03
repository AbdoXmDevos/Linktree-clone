import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { getAnalyticsData, getAnalyticsSummary } from "../../../lib/actions/analytics";

// GET /api/analytics - Get analytics data for a profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");
    const summary = searchParams.get("summary") === "true";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    const timeRange = startDate && endDate ? {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    } : undefined;

    if (summary) {
      const analyticsData = await getAnalyticsSummary(profileId);
      return NextResponse.json(analyticsData);
    } else {
      const analyticsData = await getAnalyticsData(profileId, timeRange);
      return NextResponse.json(analyticsData);
    }
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}