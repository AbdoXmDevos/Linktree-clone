"use client";

import { useState, useEffect, useCallback } from "react";
import type { AnalyticsData } from "../../types/dashboard";

interface UseAnalyticsOptions {
  profileId: string;
  refreshInterval?: number; // in milliseconds
  autoRefresh?: boolean;
  timeRange?: {
    startDate: Date;
    endDate: Date;
  };
}

interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  summary: any | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateTimeRange: (startDate: Date, endDate: Date) => void;
}

export function useAnalytics({
  profileId,
  refreshInterval = 30000, // 30 seconds default
  autoRefresh = true,
  timeRange,
}: UseAnalyticsOptions): UseAnalyticsReturn {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [summary, setSummary] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTimeRange, setCurrentTimeRange] = useState(timeRange);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    if (!profileId) return;

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        profileId,
      });

      if (currentTimeRange) {
        params.append("startDate", currentTimeRange.startDate.toISOString());
        params.append("endDate", currentTimeRange.endDate.toISOString());
      }

      const [analyticsResponse, summaryResponse] = await Promise.all([
        fetch(`/api/analytics?${params}`),
        fetch(`/api/analytics?${params}&summary=true`),
      ]);

      if (!analyticsResponse.ok || !summaryResponse.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const [analyticsData, summaryData] = await Promise.all([
        analyticsResponse.json(),
        summaryResponse.json(),
      ]);

      setData(analyticsData);
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics");
      console.error("Analytics fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [profileId, currentTimeRange]);

  // Update time range
  const updateTimeRange = useCallback((startDate: Date, endDate: Date) => {
    setCurrentTimeRange({ startDate, endDate });
  }, []);

  // Refresh data manually
  const refresh = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh || !profileId) return;

    const interval = setInterval(fetchAnalytics, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchAnalytics, autoRefresh, refreshInterval, profileId]);

  return {
    data,
    summary,
    isLoading,
    error,
    refresh,
    updateTimeRange,
  };
}

// Hook for real-time analytics updates
export function useRealTimeAnalytics(profileId: string) {
  const [realtimeData, setRealtimeData] = useState<{
    totalClicks: number;
    profileViews: number;
    onlineUsers: number;
    lastUpdate: Date;
  } | null>(null);

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!profileId) return;

    // In a real implementation, this would use WebSockets or Server-Sent Events
    // For now, we'll simulate with polling
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/analytics?profileId=${profileId}&summary=true`);
        if (response.ok) {
          const data = await response.json();
          setRealtimeData({
            totalClicks: data.totalClicks || 0,
            profileViews: data.profileViews || 0,
            onlineUsers: Math.floor(Math.random() * 10), // Simulated
            lastUpdate: new Date(),
          });
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Real-time analytics error:", error);
        setIsConnected(false);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [profileId]);

  return {
    data: realtimeData,
    isConnected,
  };
}

// Hook for analytics consent management
export function useAnalyticsConsent(profileId: string) {
  const [consent, setConsent] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial consent status
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedConsent = localStorage.getItem("analytics-consent");
      setConsent(savedConsent === "true");
    }
  }, []);

  // Update consent
  const updateConsent = useCallback(async (analyticsEnabled: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/analytics/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId,
          analyticsEnabled,
        }),
      });

      if (response.ok) {
        setConsent(analyticsEnabled);
        localStorage.setItem("analytics-consent", analyticsEnabled.toString());
      } else {
        throw new Error("Failed to update consent");
      }
    } catch (error) {
      console.error("Consent update error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  return {
    consent,
    updateConsent,
    isLoading,
  };
}

// Hook for analytics performance metrics
export function useAnalyticsPerformance(data: AnalyticsData | null) {
  const [performance, setPerformance] = useState<{
    clickThroughRate: number;
    averageClicksPerLink: number;
    topPerformingDay: string | null;
    growthRate: number;
    engagementScore: number;
  } | null>(null);

  useEffect(() => {
    if (!data) {
      setPerformance(null);
      return;
    }

    // Calculate performance metrics
    const clickThroughRate = data.profileViews > 0 
      ? (data.totalClicks / data.profileViews) * 100 
      : 0;

    const averageClicksPerLink = data.totalLinks > 0 
      ? data.totalClicks / data.totalLinks 
      : 0;

    // Find top performing day
    const topDay = data.clicksOverTime.reduce((max, day) => 
      day.clicks > max.clicks ? day : max, 
      { date: "", clicks: 0 }
    );

    // Calculate growth rate (comparing recent vs previous period)
    const recentClicks = data.clicksOverTime.slice(-7).reduce((sum, day) => sum + day.clicks, 0);
    const previousClicks = data.clicksOverTime.slice(-14, -7).reduce((sum, day) => sum + day.clicks, 0);
    const growthRate = previousClicks > 0 
      ? ((recentClicks - previousClicks) / previousClicks) * 100 
      : 0;

    // Calculate engagement score (0-100)
    const engagementScore = Math.min(100, Math.max(0, 
      (clickThroughRate * 0.4) + 
      (Math.min(averageClicksPerLink / 10, 1) * 30) + 
      (Math.min(data.totalLinks / 20, 1) * 30)
    ));

    setPerformance({
      clickThroughRate,
      averageClicksPerLink,
      topPerformingDay: topDay.date || null,
      growthRate,
      engagementScore,
    });
  }, [data]);

  return performance;
}