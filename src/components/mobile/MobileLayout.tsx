"use client";

import { Box, Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { MobileBottomNavigation } from "./MobileBottomNavigation";
import { PullToRefresh } from "./PullToRefresh";

interface MobileLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddLink?: () => void;
  onRefresh?: () => Promise<void> | void;
  showBottomNav?: boolean;
  enablePullToRefresh?: boolean;
}

export function MobileLayout({
  children,
  activeTab,
  onTabChange,
  onAddLink,
  onRefresh,
  showBottomNav = true,
  enablePullToRefresh = true,
}: MobileLayoutProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (!isMobile) {
    return <>{children}</>;
  }

  const content = (
    <Box
      style={{
        minHeight: "100vh",
        paddingBottom: showBottomNav ? "80px" : "0", // Space for bottom navigation
        paddingTop: "env(safe-area-inset-top)", // iOS safe area
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <Stack
        gap="md"
        style={{
          padding: "16px",
          paddingBottom: showBottomNav ? "24px" : "16px",
        }}
      >
        {children}
      </Stack>
    </Box>
  );

  const wrappedContent = enablePullToRefresh && onRefresh ? (
    <PullToRefresh onRefresh={onRefresh}>
      {content}
    </PullToRefresh>
  ) : content;

  return (
    <>
      {wrappedContent}
      
      {showBottomNav && (
        <MobileBottomNavigation
          activeTab={activeTab}
          onTabChange={onTabChange}
          onAddLink={onAddLink}
        />
      )}
    </>
  );
}

// Touch-friendly spacing utilities
export const mobileSpacing = {
  // Minimum touch target size (44px recommended by Apple/Google)
  touchTarget: "44px",
  
  // Safe spacing for touch interactions
  touchSafe: "8px",
  
  // Comfortable spacing between interactive elements
  comfortable: "16px",
  
  // Generous spacing for important sections
  generous: "24px",
  
  // Extra spacing for visual separation
  extra: "32px",
};

// Touch-friendly component styles
export const mobileStyles = {
  // Card with touch-friendly padding and spacing
  card: {
    padding: mobileSpacing.comfortable,
    borderRadius: "12px",
    minHeight: mobileSpacing.touchTarget,
  },
  
  // Button with proper touch target
  button: {
    minHeight: mobileSpacing.touchTarget,
    minWidth: mobileSpacing.touchTarget,
    padding: `${mobileSpacing.touchSafe} ${mobileSpacing.comfortable}`,
    borderRadius: "8px",
  },
  
  // Input with comfortable touch interaction
  input: {
    minHeight: mobileSpacing.touchTarget,
    padding: mobileSpacing.comfortable,
    borderRadius: "8px",
    fontSize: "16px", // Prevents zoom on iOS
  },
  
  // List item with proper spacing
  listItem: {
    padding: mobileSpacing.comfortable,
    minHeight: "60px", // Comfortable for content + touch
    borderRadius: "8px",
  },
  
  // Modal with safe area consideration
  modal: {
    margin: mobileSpacing.comfortable,
    marginTop: "env(safe-area-inset-top, 16px)",
    marginBottom: "env(safe-area-inset-bottom, 16px)",
    borderRadius: "16px",
    maxHeight: "calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 32px)",
  },
};

// Responsive breakpoints
export const mobileBreakpoints = {
  mobile: "(max-width: 768px)",
  tablet: "(min-width: 769px) and (max-width: 1024px)",
  desktop: "(min-width: 1025px)",
  
  // Orientation
  landscape: "(orientation: landscape)",
  portrait: "(orientation: portrait)",
  
  // Device-specific
  iPhone: "(max-width: 428px)",
  iPad: "(min-width: 768px) and (max-width: 1024px)",
};

// Animation presets for mobile
export const mobileAnimations = {
  // Slide transitions for tab changes
  slideIn: {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  
  // Fade for overlays
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  
  // Scale for buttons and interactions
  scale: {
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 17 },
  },
  
  // Bounce for success states
  bounce: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: "spring", stiffness: 500, damping: 15 },
  },
};