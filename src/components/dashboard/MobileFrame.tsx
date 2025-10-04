"use client";

import { Box, Card, Skeleton, Center } from "@mantine/core";
import { ReactNode } from "react";
import { colors, shadows, borderRadius, animation } from "../../styles/design-tokens";

interface MobileFrameProps {
  children: ReactNode;
  isLoading?: boolean;
  variant?: 'modern' | 'classic' | 'minimal';
}

export function MobileFrame({ children, isLoading = false, variant = 'modern' }: MobileFrameProps) {
  const frameStyles = {
    modern: {
      backgroundColor: colors.neutral[900],
      borderRadius: 32,
      padding: 8,
      shadow: shadows.xl,
      screenRadius: 24,
    },
    classic: {
      backgroundColor: colors.neutral[800],
      borderRadius: 28,
      padding: 6,
      shadow: shadows.lg,
      screenRadius: 20,
    },
    minimal: {
      backgroundColor: colors.neutral[200],
      borderRadius: 16,
      padding: 4,
      shadow: shadows.md,
      screenRadius: 12,
    }
  };

  const style = frameStyles[variant];

  if (isLoading) {
    return (
      <Card 
        padding={{ base: "md", sm: "lg", md: "xl" }}
        radius="xl" 
        withBorder 
        style={{ 
          flex: 1,
          background: colors.gradients.glass,
          backdropFilter: "blur(20px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "500px",
          border: `1px solid ${colors.neutral[200]}`,
        }}
      >
        <Center>
          <Skeleton width={320} height={580} radius={32} />
        </Center>
      </Card>
    );
  }

  return (
    <Card 
      padding={{ base: "md", sm: "lg", md: "xl" }}
      radius="xl" 
      withBorder 
      style={{ 
        flex: 1,
        background: colors.gradients.glass,
        backdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "500px",
        transition: `all ${animation.duration.normal} ${animation.easing.inOut}`,
        border: `1px solid ${colors.neutral[200]}`,
      }}
      className="enhanced-mobile-frame-container"
    >
      <Box
        style={{
          width: "320px",
          height: "580px",
          maxWidth: "100%",
          backgroundColor: style.backgroundColor,
          borderRadius: style.borderRadius,
          padding: style.padding,
          position: "relative",
          boxShadow: style.shadow,
          transition: `all ${animation.duration.normal} ${animation.easing.inOut}`,
          transform: "scale(1)",
        }}
        className="enhanced-mobile-frame"
      >
        {/* Modern device decorations */}
        {variant === 'modern' && (
          <>
            {/* Dynamic Island */}
            <Box
              style={{
                position: "absolute",
                top: 12,
                left: "50%",
                transform: "translateX(-50%)",
                width: 60,
                height: 6,
                backgroundColor: colors.neutral[900],
                borderRadius: borderRadius.full,
                zIndex: 10,
                transition: `all ${animation.duration.normal}`,
              }}
            />
            {/* Home indicator */}
            <Box
              style={{
                position: "absolute",
                bottom: 8,
                left: "50%",
                transform: "translateX(-50%)",
                width: 40,
                height: 4,
                backgroundColor: colors.neutral[900],
                borderRadius: borderRadius.full,
                zIndex: 10,
              }}
            />
            {/* Side buttons */}
            <Box
              style={{
                position: "absolute",
                left: -2,
                top: 80,
                width: 4,
                height: 30,
                backgroundColor: colors.neutral[700],
                borderRadius: "2px 0 0 2px",
              }}
            />
            <Box
              style={{
                position: "absolute",
                left: -2,
                top: 120,
                width: 4,
                height: 50,
                backgroundColor: colors.neutral[700],
                borderRadius: "2px 0 0 2px",
              }}
            />
            <Box
              style={{
                position: "absolute",
                right: -2,
                top: 100,
                width: 4,
                height: 80,
                backgroundColor: colors.neutral[700],
                borderRadius: "0 2px 2px 0",
              }}
            />
          </>
        )}

        {/* Classic device decorations */}
        {variant === 'classic' && (
          <>
            {/* Home button */}
            <Box
              style={{
                position: "absolute",
                bottom: 12,
                left: "50%",
                transform: "translateX(-50%)",
                width: 20,
                height: 20,
                backgroundColor: colors.neutral[900],
                borderRadius: borderRadius.full,
                border: `2px solid ${colors.neutral[700]}`,
                zIndex: 10,
              }}
            />
            {/* Speaker */}
            <Box
              style={{
                position: "absolute",
                top: 16,
                left: "50%",
                transform: "translateX(-50%)",
                width: 40,
                height: 4,
                backgroundColor: colors.neutral[700],
                borderRadius: borderRadius.full,
                zIndex: 10,
              }}
            />
          </>
        )}

        {/* Screen */}
        <Box
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: colors.neutral[50],
            borderRadius: style.screenRadius,
            overflow: "hidden",
            position: "relative",
            boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Status bar overlay for modern variant */}
          {variant === 'modern' && (
            <Box
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 30,
                background: "linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, transparent 100%)",
                zIndex: 5,
                pointerEvents: "none",
              }}
            />
          )}
          
          {/* Scrollable content area */}
          <Box
            style={{
              height: "100%",
              overflowY: "auto",
              overflowX: "hidden",
              paddingTop: variant === 'modern' ? "24px" : "16px",
              paddingBottom: variant === 'modern' ? "16px" : "12px",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              scrollBehavior: "smooth",
            }}
            className="enhanced-mobile-content"
          >
            <style jsx>{`
              .enhanced-mobile-content::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {children}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}