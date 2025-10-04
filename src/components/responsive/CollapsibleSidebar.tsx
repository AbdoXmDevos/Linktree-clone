"use client";

import { useState, useEffect } from "react";
import { 
  Box, 
  Drawer, 
  ActionIcon, 
  Group, 
  Text, 
  UnstyledButton,
  Stack,
  Divider 
} from "@mantine/core";
import { 
  IconMenu2, 
  IconX, 
  IconChevronLeft,
  IconChevronRight 
} from "@tabler/icons-react";
import { useMediaQuery, useLocalStorage } from "@mantine/hooks";

interface CollapsibleSidebarProps {
  children: React.ReactNode;
  title?: string;
  width?: number;
  collapsedWidth?: number;
  defaultCollapsed?: boolean;
  position?: "left" | "right";
  showToggle?: boolean;
  overlay?: boolean;
}

export function CollapsibleSidebar({
  children,
  title,
  width = 300,
  collapsedWidth = 60,
  defaultCollapsed = false,
  position = "left",
  showToggle = true,
  overlay = false,
}: CollapsibleSidebarProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  const isDesktop = useMediaQuery("(min-width: 1025px)");
  
  const [isCollapsed, setIsCollapsed] = useLocalStorage({
    key: "sidebar-collapsed",
    defaultValue: defaultCollapsed || isTablet,
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Auto-collapse on tablet, auto-expand on desktop
  useEffect(() => {
    if (isTablet && !isCollapsed) {
      setIsCollapsed(true);
    } else if (isDesktop && isCollapsed && !defaultCollapsed) {
      setIsCollapsed(false);
    }
  }, [isTablet, isDesktop, isCollapsed, defaultCollapsed, setIsCollapsed]);

  // Mobile drawer
  if (isMobile) {
    return (
      <>
        {/* Mobile trigger button */}
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={() => setIsMobileOpen(true)}
          style={{
            position: "fixed",
            top: "16px",
            [position]: "16px",
            zIndex: 1001,
            backgroundColor: "white",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <IconMenu2 size={20} />
        </ActionIcon>

        {/* Mobile drawer */}
        <Drawer
          opened={isMobileOpen}
          onClose={() => setIsMobileOpen(false)}
          position={position}
          size="80%"
          padding="md"
          title={title}
          overlayProps={{ opacity: 0.5, blur: 4 }}
          styles={{
            content: {
              borderRadius: position === "left" ? "0 16px 16px 0" : "16px 0 0 16px",
            },
          }}
        >
          {children}
        </Drawer>
      </>
    );
  }

  // Desktop/tablet sidebar
  const sidebarWidth = isCollapsed ? collapsedWidth : width;

  return (
    <Box
      style={{
        position: overlay ? "fixed" : "relative",
        top: overlay ? 0 : "auto",
        [position]: overlay ? 0 : "auto",
        width: sidebarWidth,
        height: overlay ? "100vh" : "auto",
        backgroundColor: "white",
        borderRight: position === "left" ? "1px solid #E5E7EB" : "none",
        borderLeft: position === "right" ? "1px solid #E5E7EB" : "none",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: overlay ? 100 : "auto",
        boxShadow: overlay ? "2px 0 8px rgba(0, 0, 0, 0.1)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Sidebar header with toggle */}
      {(title || showToggle) && (
        <Box
          style={{
            padding: isCollapsed ? "12px 8px" : "16px",
            borderBottom: "1px solid #E5E7EB",
            flexShrink: 0,
          }}
        >
          <Group justify="space-between" align="center">
            {!isCollapsed && title && (
              <Text fw={600} size="sm" lineClamp={1}>
                {title}
              </Text>
            )}
            
            {showToggle && (
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{
                  marginLeft: isCollapsed ? "auto" : "0",
                  marginRight: isCollapsed ? "auto" : "0",
                }}
              >
                {position === "left" ? (
                  isCollapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />
                ) : (
                  isCollapsed ? <IconChevronLeft size={16} /> : <IconChevronRight size={16} />
                )}
              </ActionIcon>
            )}
          </Group>
        </Box>
      )}

      {/* Sidebar content */}
      <Box
        style={{
          flex: 1,
          overflow: isCollapsed ? "visible" : "auto",
          padding: isCollapsed ? "8px 4px" : "16px",
        }}
      >
        {isCollapsed ? (
          // Collapsed content - show minimal version
          <CollapsedContent>{children}</CollapsedContent>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
}

// Component to handle collapsed sidebar content
function CollapsedContent({ children }: { children: React.ReactNode }) {
  // Extract navigation items or show minimal version
  // This is a simplified version - in a real app, you'd want to 
  // pass specific collapsed content or extract nav items
  
  return (
    <Stack gap="xs" align="center">
      {/* You could extract navigation items from children here */}
      <ActionIcon variant="subtle" size="lg">
        <IconMenu2 size={20} />
      </ActionIcon>
    </Stack>
  );
}

// Hook for sidebar state management
export function useSidebar() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  const isDesktop = useMediaQuery("(min-width: 1025px)");
  
  const [isCollapsed, setIsCollapsed] = useLocalStorage({
    key: "sidebar-collapsed",
    defaultValue: isTablet,
  });

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  
  const sidebarWidth = isCollapsed ? 60 : 300;
  const contentMargin = isMobile ? 0 : sidebarWidth;

  return {
    isCollapsed,
    setIsCollapsed,
    toggleSidebar,
    sidebarWidth,
    contentMargin,
    isMobile,
    isTablet,
    isDesktop,
  };
}