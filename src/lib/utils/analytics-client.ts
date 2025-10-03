"use client";

// Client-side analytics utilities for tracking user interactions

interface TrackingMetadata {
  countryCode?: string;
  customData?: Record<string, any>;
}

class AnalyticsClient {
  private baseUrl: string;
  private isEnabled: boolean = true;

  constructor() {
    this.baseUrl = "/api/analytics/track";
  }

  // Enable or disable analytics tracking
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // Track link click event
  async trackLinkClick(linkId: string, metadata?: TrackingMetadata) {
    if (!this.isEnabled) return;

    try {
      await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "click",
          linkId,
          metadata,
        }),
      });
    } catch (error) {
      console.warn("Failed to track link click:", error);
    }
  }

  // Track profile view event
  async trackProfileView(profileId: string, metadata?: TrackingMetadata) {
    if (!this.isEnabled) return;

    try {
      await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "profile_view",
          profileId,
          metadata,
        }),
      });
    } catch (error) {
      console.warn("Failed to track profile view:", error);
    }
  }

  // Track custom event
  async trackCustomEvent(eventType: string, data: Record<string, any>) {
    if (!this.isEnabled) return;

    try {
      await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "custom",
          eventType,
          data,
        }),
      });
    } catch (error) {
      console.warn("Failed to track custom event:", error);
    }
  }

  // Get user's country code (optional, for enhanced tracking)
  async getUserCountry(): Promise<string | null> {
    try {
      // Use a free IP geolocation service
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      return data.country_code || null;
    } catch (error) {
      console.warn("Failed to get user country:", error);
      return null;
    }
  }

  // Track page view with automatic country detection
  async trackPageView(profileId: string) {
    const countryCode = await this.getUserCountry();
    await this.trackProfileView(profileId, { countryCode });
  }

  // Batch track multiple events (for performance)
  async trackBatch(events: Array<{
    type: "click" | "profile_view" | "custom";
    linkId?: string;
    profileId?: string;
    eventType?: string;
    data?: Record<string, any>;
    metadata?: TrackingMetadata;
  }>) {
    if (!this.isEnabled || events.length === 0) return;

    try {
      await fetch(`${this.baseUrl}/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.warn("Failed to track batch events:", error);
    }
  }
}

// Create singleton instance
export const analyticsClient = new AnalyticsClient();

// React hook for analytics tracking
export function useAnalytics() {
  return {
    trackLinkClick: analyticsClient.trackLinkClick.bind(analyticsClient),
    trackProfileView: analyticsClient.trackProfileView.bind(analyticsClient),
    trackCustomEvent: analyticsClient.trackCustomEvent.bind(analyticsClient),
    trackPageView: analyticsClient.trackPageView.bind(analyticsClient),
    setEnabled: analyticsClient.setEnabled.bind(analyticsClient),
  };
}

// Privacy-compliant tracking wrapper
export class PrivacyCompliantAnalytics {
  private analytics: AnalyticsClient;
  private consentGiven: boolean = false;

  constructor() {
    this.analytics = analyticsClient;
    this.loadConsentFromStorage();
  }

  // Load consent status from localStorage
  private loadConsentFromStorage() {
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem("analytics-consent");
      this.consentGiven = consent === "true";
      this.analytics.setEnabled(this.consentGiven);
    }
  }

  // Set user consent for analytics
  setConsent(consent: boolean) {
    this.consentGiven = consent;
    this.analytics.setEnabled(consent);
    
    if (typeof window !== "undefined") {
      localStorage.setItem("analytics-consent", consent.toString());
    }
  }

  // Get current consent status
  getConsent(): boolean {
    return this.consentGiven;
  }

  // Track event only if consent is given
  async trackWithConsent(
    trackingFunction: () => Promise<void>,
    fallbackMessage?: string
  ) {
    if (this.consentGiven) {
      await trackingFunction();
    } else if (fallbackMessage) {
      console.info(fallbackMessage);
    }
  }
}

// Export privacy-compliant instance
export const privacyAnalytics = new PrivacyCompliantAnalytics();

// Utility functions for common tracking scenarios
export const trackingUtils = {
  // Track link click with automatic consent check
  trackLinkClick: async (linkId: string, metadata?: TrackingMetadata) => {
    await privacyAnalytics.trackWithConsent(
      () => analyticsClient.trackLinkClick(linkId, metadata),
      `Link click would be tracked: ${linkId}`
    );
  },

  // Track profile view with automatic consent check
  trackProfileView: async (profileId: string, metadata?: TrackingMetadata) => {
    await privacyAnalytics.trackWithConsent(
      () => analyticsClient.trackProfileView(profileId, metadata),
      `Profile view would be tracked: ${profileId}`
    );
  },

  // Track with enhanced metadata
  trackWithEnhancedMetadata: async (
    trackingFunction: (metadata: TrackingMetadata) => Promise<void>
  ) => {
    const countryCode = await analyticsClient.getUserCountry();
    const metadata: TrackingMetadata = {
      countryCode: countryCode || undefined,
      customData: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    await privacyAnalytics.trackWithConsent(() => trackingFunction(metadata));
  },
};