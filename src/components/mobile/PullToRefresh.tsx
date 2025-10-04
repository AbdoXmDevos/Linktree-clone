"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Box, Loader, Text, Stack } from "@mantine/core";
import { IconArrowDown, IconRefresh } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  disabled?: boolean;
  threshold?: number;
  maxPullDistance?: number;
}

export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  threshold = 80,
  maxPullDistance = 120,
}: PullToRefreshProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const [canPull, setCanPull] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Don't render pull-to-refresh on desktop
  if (!isMobile) {
    return <>{children}</>;
  }

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    // Only allow pull-to-refresh when at the top of the page
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > 0) {
      setCanPull(false);
      return;
    }
    
    setCanPull(true);
    setStartY(e.touches[0].clientY);
    setIsPulling(false);
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!canPull || disabled || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    
    // Only pull down
    if (deltaY > 0) {
      setIsPulling(true);
      
      // Apply resistance curve for natural feel
      const resistance = Math.min(1, deltaY / maxPullDistance);
      const easedDistance = deltaY * (1 - resistance * 0.5);
      const clampedDistance = Math.min(maxPullDistance, easedDistance);
      
      setPullDistance(clampedDistance);
      
      // Prevent default scrolling when pulling
      if (deltaY > 10) {
        e.preventDefault();
      }
    }
  }, [canPull, disabled, isRefreshing, startY, maxPullDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!canPull || disabled || isRefreshing) return;
    
    setIsPulling(false);
    setCanPull(false);
    
    // Trigger refresh if pulled far enough
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error("Refresh failed:", error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    // Animate back to original position
    animateToPosition(0);
  }, [canPull, disabled, isRefreshing, pullDistance, threshold, onRefresh]);

  const animateToPosition = (targetPosition: number) => {
    const animate = () => {
      const current = pullDistance;
      const distance = targetPosition - current;
      
      if (Math.abs(distance) < 1) {
        setPullDistance(targetPosition);
        return;
      }
      
      setPullDistance(current + distance * 0.15);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add passive: false to allow preventDefault
    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const getRefreshIndicator = () => {
    const progress = Math.min(1, pullDistance / threshold);
    const isTriggered = pullDistance >= threshold;
    
    if (isRefreshing) {
      return (
        <Stack align="center" gap="xs">
          <Loader size="sm" color="blue" />
          <Text size="sm" c="blue" fw={500}>
            Refreshing...
          </Text>
        </Stack>
      );
    }
    
    if (isPulling && pullDistance > 20) {
      return (
        <Stack align="center" gap="xs">
          <Box
            style={{
              transform: `rotate(${progress * 180}deg)`,
              transition: "transform 0.1s ease",
              color: isTriggered ? "#3B82F6" : "#6B7280",
            }}
          >
            {isTriggered ? (
              <IconRefresh size={20} />
            ) : (
              <IconArrowDown size={20} />
            )}
          </Box>
          <Text 
            size="sm" 
            c={isTriggered ? "blue" : "dimmed"}
            fw={isTriggered ? 500 : 400}
            style={{ transition: "color 0.2s ease" }}
          >
            {isTriggered ? "Release to refresh" : "Pull to refresh"}
          </Text>
        </Stack>
      );
    }
    
    return null;
  };

  return (
    <Box ref={containerRef} style={{ position: "relative" }}>
      {/* Pull indicator */}
      <Box
        style={{
          position: "absolute",
          top: -60,
          left: 0,
          right: 0,
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${Math.min(60, pullDistance)}px)`,
          transition: isPulling ? "none" : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 10,
        }}
      >
        {getRefreshIndicator()}
      </Box>
      
      {/* Main content */}
      <Box
        style={{
          transform: `translateY(${isRefreshing ? 60 : Math.min(60, pullDistance)}px)`,
          transition: isPulling ? "none" : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}