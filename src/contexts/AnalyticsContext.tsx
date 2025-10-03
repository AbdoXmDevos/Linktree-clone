"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { analyticsClient, privacyAnalytics } from "../lib/utils/analytics-client";
import type { AnalyticsData } from "../../types/dashboard";

interface AnalyticsContextType {
  // Analytics data
  analyticsData: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  
  // Consent management
  hasConsent: boolean;
  setConsent: (consent: boolean) => void;
  
  // Tracking functions
  trackLinkClick: (linkId: string, metadata?: any) => Promise<void>;
  trackProfileView: (profileId: string, metadata?: any) => Promise<void>;
  
  // Data management
  refreshAnalytics: () => Promise<void>;
  clearAnalytics: () => void;
  
  // Real-time updates
  isRealTimeEnabled: boolean;
  setRealTimeEnabled: (enabled: boolean) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
  profileId?: string;
}

export function AnalyticsProvider({ children, profileId }: AnalyticsProviderProps) {
  const { data: session } = useSession();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasConsent, setHasConsent] = useState(false);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);

  // Initialize consent from localStorage
  useEffect(() => {
    const consent = privacyAnalytics.getConsent();
    setHasConsent(consent);
    analyticsClient.setEnabled(consent);
  }, []);

  // Set consent and update privacy settings
  const setConsent = (consent: boolean) => {
    setHasConsent(consent);
    privacyAnalytics.setConsent(consent);
    analyticsClient.setEnabled(consent);
    
    // Update server-side consent if user is logged in
    if (session?.user?.id && profileId) {
      fetch("/api/analytics/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, analyticsEnabled: consent }),
      }).catch(console.error);
    }
  };

  // Fetch analytics data
  const refreshAnalytics = async () => {
    if (!profileId || !hasConsent) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics?profileId=${profileId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear analytics data
  const clearAnalytics = () => {
    setAnalyticsData(null);
    setError(null);
  };

  // Track link click with consent check
  const trackLinkClick = async (linkId: string, metadata?: any) => {
    if (!hasConsent) return;
    
    try {
      await analyticsClient.trackLinkClick(linkId, metadata);
      
      // Optionally refresh analytics data for real-time updates
      if (isRealTimeEnabled && analyticsData) {
        // Update local state optimistically
        setAnalyticsData(prev => prev ? {
          ...prev,
          totalClicks: prev.totalClicks + 1,
          todayClicks: prev.todayClicks + 1,
        } : null);
      }
    } catch (error) {
      console.warn("Failed to track link click:", error);
    }
  };

  // Track profile view with consent check
  const trackProfileView = async (profileId: string, metadata?: any) => {
    if (!hasConsent) return;
    
    try {
      await analyticsClient.trackProfileView(profileId, metadata);
      
      // Optionally refresh analytics data for real-time updates
      if (isRealTimeEnabled && analyticsData) {
        // Update local state optimistically
        setAnalyticsData(prev => prev ? {
          ...prev,
          profileViews: prev.profileViews + 1,
        } : null);
      }
    } catch (error) {
      console.warn("Failed to track profile view:", error);
    }
  };

  // Auto-refresh analytics data
  useEffect(() => {
    if (profileId && hasConsent) {
      refreshAnalytics();
      
      // Set up periodic refresh if real-time is enabled
      if (isRealTimeEnabled) {
        const interval = setInterval(refreshAnalytics, 30000); // 30 seconds
        return () => clearInterval(interval);
      }
    }
  }, [profileId, hasConsent, isRealTimeEnabled]);

  // Track page view on mount
  useEffect(() => {
    if (profileId && hasConsent) {
      trackProfileView(profileId);
    }
  }, [profileId, hasConsent]);

  const value: AnalyticsContextType = {
    analyticsData,
    isLoading,
    error,
    hasConsent,
    setConsent,
    trackLinkClick,
    trackProfileView,
    refreshAnalytics,
    clearAnalytics,
    isRealTimeEnabled,
    setRealTimeEnabled,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// Hook to use analytics context
export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalyticsContext must be used within an AnalyticsProvider");
  }
  return context;
}

// HOC to wrap components with analytics tracking
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>,
  trackingOptions?: {
    trackMount?: boolean;
    trackUnmount?: boolean;
    trackProps?: (keyof P)[];
  }
) {
  return function AnalyticsWrappedComponent(props: P) {
    const { trackProfileView } = useAnalyticsContext();

    useEffect(() => {
      if (trackingOptions?.trackMount) {
        // Track component mount
        console.log(`Component ${Component.name} mounted`);
      }

      return () => {
        if (trackingOptions?.trackUnmount) {
          // Track component unmount
          console.log(`Component ${Component.name} unmounted`);
        }
      };
    }, []);

    // Track prop changes
    useEffect(() => {
      if (trackingOptions?.trackProps) {
        trackingOptions.trackProps.forEach(propName => {
          console.log(`Prop ${String(propName)} changed:`, props[propName]);
        });
      }
    }, trackingOptions?.trackProps?.map(prop => props[prop]) || []);

    return <Component {...props} />;
  };
}