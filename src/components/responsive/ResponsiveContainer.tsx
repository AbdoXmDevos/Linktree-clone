"use client";

import { Box, Container } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  padding?: "xs" | "sm" | "md" | "lg" | "xl";
  fluid?: boolean;
  className?: string;
}

export function ResponsiveContainer({
  children,
  maxWidth = "xl",
  padding,
  fluid = false,
  className,
}: ResponsiveContainerProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  const isDesktop = useMediaQuery("(min-width: 1025px)");

  // Responsive padding based on screen size
  const responsivePadding = padding || (isMobile ? "sm" : isTablet ? "md" : "lg");
  
  // Responsive max width
  const responsiveMaxWidth = typeof maxWidth === "number" 
    ? maxWidth 
    : isMobile 
      ? "100%" 
      : isTablet 
        ? "lg" 
        : maxWidth;

  if (fluid) {
    return (
      <Box
        className={className}
        style={{
          width: "100%",
          padding: isMobile ? "8px" : isTablet ? "16px" : "24px",
          maxWidth: "100%",
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Container
      size={responsiveMaxWidth}
      px={responsivePadding}
      className={className}
      style={{
        transition: "all 0.3s ease",
      }}
    >
      {children}
    </Container>
  );
}