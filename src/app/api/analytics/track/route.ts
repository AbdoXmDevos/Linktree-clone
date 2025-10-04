import { NextRequest, NextResponse } from "next/server";
import { trackLinkClick, trackProfileView } from "../../../../lib/actions/analytics";

// POST /api/analytics/track - Track analytics events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, linkId, profileId, metadata } = body;

    // Extract metadata from request headers
    const userAgent = request.headers.get("user-agent") || "";
    const referrer = request.headers.get("referer") || "";
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    
    // Get IP address (prioritize x-real-ip, then x-forwarded-for)
    let ipAddress = realIp || (forwardedFor ? forwardedFor.split(",")[0].trim() : null);
    
    const trackingMetadata = {
      userAgent,
      referrer,
      ipAddress: ipAddress || undefined,
      countryCode: metadata?.countryCode,
      ...metadata,
    };

    let result;

    switch (type) {
      case "click":
        if (!linkId) {
          return NextResponse.json({ error: "Link ID is required for click tracking" }, { status: 400 });
        }
        result = await trackLinkClick(linkId, trackingMetadata);
        break;

      case "profile_view":
        if (!profileId) {
          return NextResponse.json({ error: "Profile ID is required for profile view tracking" }, { status: 400 });
        }
        result = await trackProfileView(profileId, trackingMetadata);
        break;

      default:
        return NextResponse.json({ error: "Invalid tracking type" }, { status: 400 });
    }

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}