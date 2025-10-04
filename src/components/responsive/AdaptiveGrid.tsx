"use client";

import React from "react";
import { Grid, Box } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

interface AdaptiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: {
    mobile?: "xs" | "sm" | "md" | "lg" | "xl";
    tablet?: "xs" | "sm" | "md" | "lg" | "xl";
    desktop?: "xs" | "sm" | "md" | "lg" | "xl";
  };
  align?: "stretch" | "center" | "flex-start" | "flex-end";
  justify?: "center" | "flex-start" | "flex-end" | "space-between" | "space-around";
  className?: string;
}

export function AdaptiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: "sm", tablet: "md", desktop: "lg" },
  align = "stretch",
  justify = "flex-start",
  className,
}: AdaptiveGridProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  const isDesktop = useMediaQuery("(min-width: 1025px)");

  // Determine current breakpoint values
  const currentColumns = isMobile 
    ? columns.mobile || 1
    : isTablet 
      ? columns.tablet || 2
      : columns.desktop || 3;

  const currentGap = isMobile
    ? gap.mobile || "sm"
    : isTablet
      ? gap.tablet || "md"
      : gap.desktop || "lg";

  // Calculate span for each item
  const itemSpan = 12 / currentColumns;

  return (
    <Grid
      gutter={currentGap}
      align={align}
      justify={justify}
      className={className}
      style={{
        transition: "all 0.3s ease",
      }}
    >
      {React.Children.map(children, (child, index) => (
        <Grid.Col
          key={index}
          span={itemSpan}
          style={{
            transition: "all 0.3s ease",
          }}
        >
          {child}
        </Grid.Col>
      ))}
    </Grid>
  );
}

// Masonry-style grid for variable height items
interface MasonryGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
  className?: string;
}

export function MasonryGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 16,
  className,
}: MasonryGridProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  const isDesktop = useMediaQuery("(min-width: 1025px)");

  const currentColumns = isMobile 
    ? columns.mobile || 1
    : isTablet 
      ? columns.tablet || 2
      : columns.desktop || 3;

  return (
    <Box
      className={className}
      style={{
        columnCount: currentColumns,
        columnGap: gap,
        transition: "column-count 0.3s ease",
      }}
    >
      {React.Children.map(children, (child, index) => (
        <Box
          key={index}
          style={{
            breakInside: "avoid",
            marginBottom: gap,
            display: "inline-block",
            width: "100%",
          }}
        >
          {child}
        </Box>
      ))}
    </Box>
  );
}

// Responsive flex container
interface ResponsiveFlexProps {
  children: React.ReactNode;
  direction?: {
    mobile?: "row" | "column" | "row-reverse" | "column-reverse";
    tablet?: "row" | "column" | "row-reverse" | "column-reverse";
    desktop?: "row" | "column" | "row-reverse" | "column-reverse";
  };
  wrap?: {
    mobile?: "nowrap" | "wrap" | "wrap-reverse";
    tablet?: "nowrap" | "wrap" | "wrap-reverse";
    desktop?: "nowrap" | "wrap" | "wrap-reverse";
  };
  gap?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  align?: "stretch" | "center" | "flex-start" | "flex-end" | "baseline";
  justify?: "center" | "flex-start" | "flex-end" | "space-between" | "space-around" | "space-evenly";
  className?: string;
}

export function ResponsiveFlex({
  children,
  direction = { mobile: "column", tablet: "row", desktop: "row" },
  wrap = { mobile: "nowrap", tablet: "wrap", desktop: "wrap" },
  gap = { mobile: 8, tablet: 16, desktop: 24 },
  align = "stretch",
  justify = "flex-start",
  className,
}: ResponsiveFlexProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  const isDesktop = useMediaQuery("(min-width: 1025px)");

  const currentDirection = isMobile
    ? direction.mobile || "column"
    : isTablet
      ? direction.tablet || "row"
      : direction.desktop || "row";

  const currentWrap = isMobile
    ? wrap.mobile || "nowrap"
    : isTablet
      ? wrap.tablet || "wrap"
      : wrap.desktop || "wrap";

  const currentGap = isMobile
    ? gap.mobile || 8
    : isTablet
      ? gap.tablet || 16
      : gap.desktop || 24;

  return (
    <Box
      className={className}
      style={{
        display: "flex",
        flexDirection: currentDirection,
        flexWrap: currentWrap,
        gap: currentGap,
        alignItems: align,
        justifyContent: justify,
        transition: "all 0.3s ease",
      }}
    >
      {children}
    </Box>
  );
}

// Responsive stack with different spacing
interface ResponsiveStackProps {
  children: React.ReactNode;
  spacing?: {
    mobile?: "xs" | "sm" | "md" | "lg" | "xl" | number;
    tablet?: "xs" | "sm" | "md" | "lg" | "xl" | number;
    desktop?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  };
  align?: "stretch" | "center" | "flex-start" | "flex-end";
  className?: string;
}

export function ResponsiveStack({
  children,
  spacing = { mobile: "sm", tablet: "md", desktop: "lg" },
  align = "stretch",
  className,
}: ResponsiveStackProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  const isDesktop = useMediaQuery("(min-width: 1025px)");

  const currentSpacing = isMobile
    ? spacing.mobile || "sm"
    : isTablet
      ? spacing.tablet || "md"
      : spacing.desktop || "lg";

  return (
    <Box
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align,
        gap: typeof currentSpacing === "number" ? currentSpacing : undefined,
        transition: "gap 0.3s ease",
      }}
    >
      {children}
    </Box>
  );
}