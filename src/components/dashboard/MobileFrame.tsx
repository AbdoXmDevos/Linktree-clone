"use client";

import { Box, Card } from "@mantine/core";
import { ReactNode } from "react";

interface MobileFrameProps {
  children: ReactNode;
}

export function MobileFrame({ children }: MobileFrameProps) {
  return (
    <Card 
      padding={{ base: "md", sm: "lg", md: "xl" }}
      radius="md" 
      withBorder 
      style={{ 
        flex: 1,
        backgroundColor: "#f8f9fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "500px",
        transition: "all 0.3s ease"
      }}
      className="layout-transition"
    >
      <Box
        style={{
          width: "320px",
          maxWidth: "100%",
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          border: "8px solid #000000",
          padding: "20px",
          minHeight: "500px",
          maxHeight: "80vh",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: "scale(1)",
        }}
        className="mobile-frame"
      >
        {/* Mobile notch/dynamic island */}
        <Box
          style={{
            position: "absolute",
            top: "8px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "60px",
            height: "4px",
            backgroundColor: "#000000",
            borderRadius: "2px",
            transition: "all 0.3s ease"
          }}
        />
        
        {/* Scrollable content area */}
        <Box
          style={{
            height: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            paddingTop: "16px",
            scrollbarWidth: "thin",
            scrollbarColor: "#c1c1c1 transparent",
            // Smooth scrolling
            scrollBehavior: "smooth"
          }}
          className="mobile-content"
        >
          {children}
        </Box>
      </Box>
    </Card>
  );
}