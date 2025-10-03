"use server";

import { db } from "../../../lib/db";
import { link_analytics, links, profiles } from "../../../db/schema";
import { eq, and, desc, count, sql, gte, lte, inArray } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { headers } from "next/headers";
import type { AnalyticsData } from "../../../types/dashboard";

// Track link click event
export async function trackLinkClick(linkId: string, metadata?: {
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  countryCode?: string;
}) {
  try {
    const headersList = headers();
    const userAgent = metadata?.userAgent || headersList.get("user-agent") || "";
    const referrer = metadata?.referrer || headersList.get("referer") || "";
    
    // Insert analytics event
    await db.insert(link_analytics).values({
      link_id: linkId,
      event_type: "click",
      user_agent: userAgent,
      referrer: referrer,
      ip_address: metadata?.ipAddress,
      country_code: metadata?.countryCode,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to track link click:", error);
    return { success: false, error: "Failed to track click" };
  }
}

// Track profile view event
export async function trackProfileView(profileId: string, metadata?: {
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  countryCode?: string;
}) {
  try {
    const headersList = headers();
    const userAgent = metadata?.userAgent || headersList.get("user-agent") || "";
    const referrer = metadata?.referrer || headersList.get("referer") || "";
    
    // For profile views, we'll create a special analytics entry
    // We can use a dummy link_id or create a separate profile_analytics table later
    await db.insert(link_analytics).values({
      link_id: profileId, // Using profile_id as link_id for profile views
      event_type: "profile_view",
      user_agent: userAgent,
      referrer: referrer,
      ip_address: metadata?.ipAddress,
      country_code: metadata?.countryCode,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to track profile view:", error);
    return { success: false, error: "Failed to track profile view" };
  }
}

// Get analytics data for a specific profile
export async function getAnalyticsData(profileId: string, timeRange?: {
  startDate?: Date;
  endDate?: Date;
}): Promise<AnalyticsData | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Verify profile ownership
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, profileId),
    });

    if (!profile || profile.user_id !== session.user.id) {
      throw new Error("Profile not found or unauthorized");
    }

    const now = new Date();
    const startDate = timeRange?.startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = timeRange?.endDate || now;

    // Get all links for this profile
    const profileLinks = await db.query.links.findMany({
      where: eq(links.profile_id, profileId),
    });

    const linkIds = profileLinks.map(link => link.id);

    // Get total clicks for all links
    const totalClicksResult = await db
      .select({ count: count() })
      .from(link_analytics)
      .where(
        and(
          inArray(link_analytics.link_id, linkIds),
          eq(link_analytics.event_type, "click"),
          gte(link_analytics.timestamp, startDate),
          lte(link_analytics.timestamp, endDate)
        )
      );

    // Get profile views
    const profileViewsResult = await db
      .select({ count: count() })
      .from(link_analytics)
      .where(
        and(
          eq(link_analytics.link_id, profileId),
          eq(link_analytics.event_type, "profile_view"),
          gte(link_analytics.timestamp, startDate),
          lte(link_analytics.timestamp, endDate)
        )
      );

    // Get today's clicks
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayClicksResult = await db
      .select({ count: count() })
      .from(link_analytics)
      .where(
        and(
          inArray(link_analytics.link_id, linkIds),
          eq(link_analytics.event_type, "click"),
          gte(link_analytics.timestamp, todayStart)
        )
      );

    // Get weekly clicks (last 7 days)
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyClicksResult = await db
      .select({ count: count() })
      .from(link_analytics)
      .where(
        and(
          inArray(link_analytics.link_id, linkIds),
          eq(link_analytics.event_type, "click"),
          gte(link_analytics.timestamp, weekStart)
        )
      );

    // Get monthly clicks (last 30 days)
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthlyClicksResult = await db
      .select({ count: count() })
      .from(link_analytics)
      .where(
        and(
          inArray(link_analytics.link_id, linkIds),
          eq(link_analytics.event_type, "click"),
          gte(link_analytics.timestamp, monthStart)
        )
      );

    // Get top links with click counts
    const topLinksResult = await db
      .select({
        linkId: link_analytics.link_id,
        clicks: count(),
      })
      .from(link_analytics)
      .where(
        and(
          inArray(link_analytics.link_id, linkIds),
          eq(link_analytics.event_type, "click"),
          gte(link_analytics.timestamp, startDate),
          lte(link_analytics.timestamp, endDate)
        )
      )
      .groupBy(link_analytics.link_id)
      .orderBy(desc(count()))
      .limit(10);

    // Get recent activity
    const recentActivityResult = await db
      .select({
        id: link_analytics.id,
        type: link_analytics.event_type,
        timestamp: link_analytics.timestamp,
        linkId: link_analytics.link_id,
        userAgent: link_analytics.user_agent,
        referrer: link_analytics.referrer,
      })
      .from(link_analytics)
      .where(
        and(
          inArray(link_analytics.link_id, [...linkIds, profileId]),
          gte(link_analytics.timestamp, startDate),
          lte(link_analytics.timestamp, endDate)
        )
      )
      .orderBy(desc(link_analytics.timestamp))
      .limit(20);

    // Get clicks over time (daily aggregation)
    const clicksOverTimeResult = await db
      .select({
        date: sql<string>`DATE(${link_analytics.timestamp})`,
        clicks: count(),
      })
      .from(link_analytics)
      .where(
        and(
          inArray(link_analytics.link_id, linkIds),
          eq(link_analytics.event_type, "click"),
          gte(link_analytics.timestamp, startDate),
          lte(link_analytics.timestamp, endDate)
        )
      )
      .groupBy(sql`DATE(${link_analytics.timestamp})`)
      .orderBy(sql`DATE(${link_analytics.timestamp})`);

    // Get top countries
    const topCountriesResult = await db
      .select({
        countryCode: link_analytics.country_code,
        clicks: count(),
      })
      .from(link_analytics)
      .where(
        and(
          inArray(link_analytics.link_id, linkIds),
          eq(link_analytics.event_type, "click"),
          gte(link_analytics.timestamp, startDate),
          lte(link_analytics.timestamp, endDate)
        )
      )
      .groupBy(link_analytics.country_code)
      .orderBy(desc(count()))
      .limit(10);

    // Process top links data
    const topLinks = await Promise.all(
      topLinksResult.map(async (item) => {
        const link = profileLinks.find(l => l.id === item.linkId);
        const totalClicks = totalClicksResult[0]?.count || 0;
        const clickRate = totalClicks > 0 ? (item.clicks / totalClicks) * 100 : 0;
        
        return {
          linkId: item.linkId,
          title: link?.title || "Unknown Link",
          url: link?.url || "",
          clicks: item.clicks,
          clickRate,
          trend: "stable" as const, // TODO: Calculate actual trend
        };
      })
    );

    // Process recent activity
    const recentActivity = recentActivityResult.map((activity) => {
      const link = profileLinks.find(l => l.id === activity.linkId);
      return {
        id: activity.id,
        type: activity.type as "click" | "view" | "edit" | "create" | "delete",
        timestamp: activity.timestamp!,
        details: activity.type === "click" 
          ? `Link "${link?.title || "Unknown"}" was clicked`
          : activity.type === "profile_view"
          ? "Profile was viewed"
          : `${activity.type} event`,
        linkId: activity.linkId,
        linkTitle: link?.title,
        metadata: {
          userAgent: activity.userAgent,
          referrer: activity.referrer,
        },
      };
    });

    // Process countries data
    const topCountries = topCountriesResult
      .filter(item => item.countryCode)
      .map((item) => {
        const totalClicks = totalClicksResult[0]?.count || 0;
        return {
          countryCode: item.countryCode!,
          countryName: getCountryName(item.countryCode!),
          clicks: item.clicks,
          percentage: totalClicks > 0 ? (item.clicks / totalClicks) * 100 : 0,
        };
      });

    // Calculate metrics
    const totalClicks = totalClicksResult[0]?.count || 0;
    const profileViews = profileViewsResult[0]?.count || 0;
    const todayClicks = todayClicksResult[0]?.count || 0;
    const weeklyClicks = weeklyClicksResult[0]?.count || 0;
    const monthlyClicks = monthlyClicksResult[0]?.count || 0;
    const totalLinks = profileLinks.length;
    const averageClicksPerLink = totalLinks > 0 ? totalClicks / totalLinks : 0;
    const clickThroughRate = profileViews > 0 ? (totalClicks / profileViews) * 100 : 0;

    const analyticsData: AnalyticsData = {
      totalClicks,
      profileViews,
      uniqueVisitors: profileViews, // TODO: Calculate actual unique visitors
      totalLinks,
      todayClicks,
      weeklyClicks,
      monthlyClicks,
      topLinks,
      recentActivity,
      topCountries,
      topReferrers: [], // TODO: Implement referrer analysis
      clicksOverTime: clicksOverTimeResult.map(item => ({
        date: item.date,
        clicks: item.clicks,
        views: 0, // TODO: Add view tracking
      })),
      averageClicksPerLink,
      clickThroughRate,
      bounceRate: 0, // TODO: Implement bounce rate calculation
    };

    return analyticsData;
  } catch (error) {
    console.error("Failed to get analytics data:", error);
    return null;
  }
}

// Helper function to get country name from country code
function getCountryName(countryCode: string): string {
  const countryNames: Record<string, string> = {
    US: "United States",
    GB: "United Kingdom",
    CA: "Canada",
    AU: "Australia",
    DE: "Germany",
    FR: "France",
    JP: "Japan",
    CN: "China",
    IN: "India",
    BR: "Brazil",
    // Add more as needed
  };
  
  return countryNames[countryCode] || countryCode;
}

// Aggregate analytics data for dashboard summary
export async function getAnalyticsSummary(profileId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const analyticsData = await getAnalyticsData(profileId);
    if (!analyticsData) {
      return null;
    }

    return {
      totalClicks: analyticsData.totalClicks,
      profileViews: analyticsData.profileViews,
      totalLinks: analyticsData.totalLinks,
      topPerformingLink: analyticsData.topLinks[0] || null,
      recentActivity: analyticsData.recentActivity.slice(0, 5),
      clickTrend: calculateTrend(analyticsData.clicksOverTime),
    };
  } catch (error) {
    console.error("Failed to get analytics summary:", error);
    return null;
  }
}

// Helper function to calculate trend
function calculateTrend(clicksOverTime: Array<{ date: string; clicks: number; views: number }>): 'up' | 'down' | 'stable' {
  if (clicksOverTime.length < 2) return 'stable';
  
  const recent = clicksOverTime.slice(-7); // Last 7 days
  const previous = clicksOverTime.slice(-14, -7); // Previous 7 days
  
  const recentTotal = recent.reduce((sum, day) => sum + day.clicks, 0);
  const previousTotal = previous.reduce((sum, day) => sum + day.clicks, 0);
  
  if (recentTotal > previousTotal * 1.1) return 'up';
  if (recentTotal < previousTotal * 0.9) return 'down';
  return 'stable';
}

// Privacy-compliant tracking with user consent
export async function updateAnalyticsConsent(profileId: string, analyticsEnabled: boolean) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await db
      .update(profiles)
      .set({ analytics_enabled: analyticsEnabled })
      .where(
        and(
          eq(profiles.id, profileId),
          eq(profiles.user_id, session.user.id)
        )
      );

    return { success: true };
  } catch (error) {
    console.error("Failed to update analytics consent:", error);
    return { success: false, error: "Failed to update consent" };
  }
}