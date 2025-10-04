"use client";

import { useState } from "react";
import { Box, UnstyledButton, Text, Group, Stack, rem } from "@mantine/core";
import { 
  IconLink, 
  IconEye, 
  IconChartBar, 
  IconSettings,
  IconPlus 
} from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";

interface MobileBottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddLink?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; stroke?: number }>;
  color?: string;
}

const navItems: NavItem[] = [
  { id: "manage", label: "Manage", icon: IconLink, color: "#3B82F6" },
  { id: "preview", label: "Preview", icon: IconEye, color: "#10B981" },
  { id: "analytics", label: "Analytics", icon: IconChartBar, color: "#8B5CF6" },
  { id: "settings", label: "Settings", icon: IconSettings, color: "#6B7280" },
];

export function MobileBottomNavigation({ 
  activeTab, 
  onTabChange, 
  onAddLink 
}: MobileBottomNavigationProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  if (!isMobile) return null;

  return (
    <Box
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "white",
        borderTop: "1px solid #e9ecef",
        padding: "8px 16px",
        paddingBottom: "calc(8px + env(safe-area-inset-bottom))", // Safe area for iOS
        zIndex: 1000,
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(10px)",
        background: "rgba(255, 255, 255, 0.95)",
      }}
    >
      <Group justify="space-around" align="center" gap={0}>
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <UnstyledButton
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "8px 4px",
                borderRadius: "12px",
                transition: "all 0.2s ease",
                minHeight: "56px", // Touch-friendly target
                position: "relative",
                transform: isActive ? "translateY(-2px)" : "translateY(0)",
              }}
            >
              <Box
                style={{
                  padding: "8px",
                  borderRadius: "12px",
                  backgroundColor: isActive ? `${item.color}15` : "transparent",
                  transition: "all 0.2s ease",
                  marginBottom: "4px",
                }}
              >
                <Icon
                  size={20}
                  stroke={1.5}
                  style={{ color: isActive ? item.color : "#6B7280" }}
                />
              </Box>
              <Text
                size="xs"
                fw={isActive ? 600 : 400}
                c={isActive ? item.color : "dimmed"}
                style={{
                  transition: "all 0.2s ease",
                  fontSize: "11px",
                  lineHeight: 1.2,
                }}
              >
                {item.label}
              </Text>
              
              {/* Active indicator */}
              {isActive && (
                <Box
                  style={{
                    position: "absolute",
                    top: "4px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor: item.color,
                    animation: "pulse 2s infinite",
                  }}
                />
              )}
            </UnstyledButton>
          );
        })}
        
        {/* Floating Add Button */}
        {onAddLink && (
          <Box
            style={{
              position: "absolute",
              top: "-28px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <UnstyledButton
              onClick={onAddLink}
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#3B82F6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
                transition: "all 0.2s ease",
                border: "4px solid white",
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.95)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <IconPlus size={24} color="white" stroke={2} />
            </UnstyledButton>
          </Box>
        )}
      </Group>
    </Box>
  );
}