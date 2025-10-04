"use client";

import { useState, useRef, useEffect } from "react";
import { Box, ActionIcon, Group, Text } from "@mantine/core";
import { 
  IconTrash, 
  IconEdit, 
  IconStar, 
  IconStarFilled,
  IconCopy,
  IconExternalLink 
} from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";

interface SwipeAction {
  id: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  backgroundColor: string;
  label: string;
  onAction: () => void;
}

interface SwipeableListItemProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFeatured?: () => void;
  onCopy?: () => void;
  onOpen?: () => void;
  isFeatured?: boolean;
  disabled?: boolean;
}

export function SwipeableListItem({
  children,
  onEdit,
  onDelete,
  onToggleFeatured,
  onCopy,
  onOpen,
  isFeatured = false,
  disabled = false,
}: SwipeableListItemProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Don't render swipe functionality on desktop
  if (!isMobile) {
    return <>{children}</>;
  }

  const leftActions: SwipeAction[] = [
    ...(onToggleFeatured ? [{
      id: "featured",
      icon: isFeatured ? IconStarFilled : IconStar,
      color: "#F59E0B",
      backgroundColor: "#FEF3C7",
      label: isFeatured ? "Unstar" : "Star",
      onAction: onToggleFeatured,
    }] : []),
    ...(onCopy ? [{
      id: "copy",
      icon: IconCopy,
      color: "#10B981",
      backgroundColor: "#D1FAE5",
      label: "Copy",
      onAction: onCopy,
    }] : []),
  ];

  const rightActions: SwipeAction[] = [
    ...(onEdit ? [{
      id: "edit",
      icon: IconEdit,
      color: "#3B82F6",
      backgroundColor: "#DBEAFE",
      label: "Edit",
      onAction: onEdit,
    }] : []),
    ...(onDelete ? [{
      id: "delete",
      icon: IconTrash,
      color: "#EF4444",
      backgroundColor: "#FEE2E2",
      label: "Delete",
      onAction: onDelete,
    }] : []),
  ];

  const maxSwipeDistance = 120;
  const actionThreshold = 60;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return;
    
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;
    
    // Limit swipe distance
    const clampedDelta = Math.max(-maxSwipeDistance, Math.min(maxSwipeDistance, deltaX));
    setSwipeOffset(clampedDelta);
  };

  const handleTouchEnd = () => {
    if (!isDragging || disabled) return;
    setIsDragging(false);

    // Check if swipe was far enough to trigger an action
    if (Math.abs(swipeOffset) > actionThreshold) {
      if (swipeOffset > 0 && leftActions.length > 0) {
        // Swiped right - trigger first left action
        leftActions[0].onAction();
      } else if (swipeOffset < 0 && rightActions.length > 0) {
        // Swiped left - trigger first right action
        rightActions[0].onAction();
      }
    }

    // Animate back to center
    animateToPosition(0);
  };

  const animateToPosition = (targetPosition: number) => {
    const animate = () => {
      const current = swipeOffset;
      const distance = targetPosition - current;
      
      if (Math.abs(distance) < 1) {
        setSwipeOffset(targetPosition);
        return;
      }
      
      setSwipeOffset(current + distance * 0.2);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const renderActions = (actions: SwipeAction[], side: 'left' | 'right') => {
    if (actions.length === 0) return null;

    const isVisible = side === 'left' ? swipeOffset > 0 : swipeOffset < 0;
    const opacity = Math.min(1, Math.abs(swipeOffset) / actionThreshold);

    return (
      <Box
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          [side]: 0,
          width: Math.abs(swipeOffset),
          display: "flex",
          alignItems: "center",
          justifyContent: side === 'left' ? "flex-start" : "flex-end",
          opacity: isVisible ? opacity : 0,
          transition: isDragging ? "none" : "opacity 0.2s ease",
          overflow: "hidden",
        }}
      >
        <Group gap="xs" px="md">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <ActionIcon
                key={action.id}
                size="lg"
                radius="xl"
                style={{
                  backgroundColor: action.backgroundColor,
                  color: action.color,
                  border: `1px solid ${action.color}20`,
                  transform: `scale(${Math.min(1, opacity * 1.2)})`,
                  transition: isDragging ? "none" : "transform 0.2s ease",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onAction();
                  animateToPosition(0);
                }}
              >
                <Icon size={18} />
              </ActionIcon>
            );
          })}
        </Group>
      </Box>
    );
  };

  return (
    <Box
      ref={containerRef}
      style={{
        position: "relative",
        overflow: "hidden",
        touchAction: "pan-y", // Allow vertical scrolling but handle horizontal
      }}
    >
      {/* Left actions */}
      {renderActions(leftActions, 'left')}
      
      {/* Right actions */}
      {renderActions(rightActions, 'right')}
      
      {/* Main content */}
      <Box
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundColor: "white",
          position: "relative",
          zIndex: 1,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </Box>
      
      {/* Swipe hint overlay */}
      {Math.abs(swipeOffset) > 10 && Math.abs(swipeOffset) < actionThreshold && (
        <Box
          style={{
            position: "absolute",
            top: "50%",
            [swipeOffset > 0 ? "left" : "right"]: "16px",
            transform: "translateY(-50%)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <Text
            size="xs"
            c="dimmed"
            style={{
              opacity: Math.min(0.8, Math.abs(swipeOffset) / actionThreshold),
              transition: "opacity 0.1s ease",
            }}
          >
            {swipeOffset > 0 
              ? leftActions[0]?.label || "Swipe right"
              : rightActions[0]?.label || "Swipe left"
            }
          </Text>
        </Box>
      )}
    </Box>
  );
}