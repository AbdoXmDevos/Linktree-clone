"use client";

import { useState } from "react";
import { 
  Card, 
  Group, 
  Text, 
  ActionIcon, 
  Avatar, 
  Box, 
  Badge,
  Stack,
  UnstyledButton 
} from "@mantine/core";
import { 
  IconExternalLink, 
  IconGripVertical,
  IconStar,
  IconStarFilled,
  IconDots
} from "@tabler/icons-react";
import { SwipeableListItem } from "./SwipeableListItem";
import { useMediaQuery } from "@mantine/hooks";
import type { Link } from "../../../types/dashboard";

interface MobileLinkItemProps {
  link: Link;
  isSelected?: boolean;
  onEdit?: (link: Link) => void;
  onDelete?: (linkId: string) => void;
  onToggleFeatured?: (linkId: string) => void;
  onSelect?: (linkId: string, isSelected: boolean) => void;
  onOpen?: (url: string) => void;
  showDragHandle?: boolean;
  dragHandleProps?: any;
}

export function MobileLinkItem({
  link,
  isSelected = false,
  onEdit,
  onDelete,
  onToggleFeatured,
  onSelect,
  onOpen,
  showDragHandle = false,
  dragHandleProps,
}: MobileLinkItemProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [showActions, setShowActions] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(link.url);
    // Could show a toast notification here
  };

  const handleOpenLink = () => {
    if (onOpen) {
      onOpen(link.url);
    } else {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  const linkContent = (
    <Card
      padding="md"
      radius="lg"
      withBorder
      style={{
        cursor: "pointer",
        transition: "all 0.2s ease",
        backgroundColor: isSelected ? "#F0F9FF" : "white",
        borderColor: isSelected ? "#3B82F6" : "#E5E7EB",
        borderWidth: isSelected ? "2px" : "1px",
        minHeight: "80px", // Touch-friendly height
        transform: isSelected ? "scale(0.98)" : "scale(1)",
      }}
      onClick={() => {
        if (isMobile && onSelect) {
          onSelect(link.id, !isSelected);
        }
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        {/* Drag handle for reordering */}
        {showDragHandle && (
          <Box {...dragHandleProps} style={{ cursor: "grab", padding: "4px" }}>
            <IconGripVertical size={16} color="#9CA3AF" />
          </Box>
        )}

        {/* Link icon/favicon */}
        <Avatar
          src={link.icon}
          size="md"
          radius="md"
          style={{ 
            flexShrink: 0,
            backgroundColor: "#F3F4F6",
            border: "1px solid #E5E7EB"
          }}
        >
          <IconExternalLink size={16} color="#6B7280" />
        </Avatar>

        {/* Link content */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" align="flex-start" mb="xs">
            <Text
              fw={600}
              size="sm"
              lineClamp={1}
              style={{ 
                color: "#1F2937",
                fontSize: "15px", // Slightly larger for mobile
              }}
            >
              {link.title}
            </Text>
            
            {/* Featured indicator */}
            {link.is_featured && (
              <IconStarFilled size={14} color="#F59E0B" />
            )}
          </Group>

          {link.description && (
            <Text
              size="xs"
              c="dimmed"
              lineClamp={2}
              mb="xs"
              style={{ 
                fontSize: "13px",
                lineHeight: 1.4,
              }}
            >
              {link.description}
            </Text>
          )}

          {/* URL display */}
          <Text
            size="xs"
            c="blue"
            lineClamp={1}
            style={{ 
              fontSize: "12px",
              fontFamily: "monospace",
            }}
          >
            {link.url}
          </Text>

          {/* Tags */}
          {link.tags && link.tags.length > 0 && (
            <Group gap="xs" mt="xs">
              {link.tags.slice(0, 2).map((tag, index) => (
                <Badge
                  key={index}
                  size="xs"
                  variant="light"
                  color="blue"
                  style={{ fontSize: "10px" }}
                >
                  {tag}
                </Badge>
              ))}
              {link.tags.length > 2 && (
                <Badge
                  size="xs"
                  variant="outline"
                  color="gray"
                  style={{ fontSize: "10px" }}
                >
                  +{link.tags.length - 2}
                </Badge>
              )}
            </Group>
          )}
        </Box>

        {/* Mobile actions button */}
        {isMobile && (
          <UnstyledButton
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            style={{
              padding: "8px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "32px",
              minHeight: "32px",
            }}
          >
            <IconDots size={16} color="#6B7280" />
          </UnstyledButton>
        )}

        {/* Desktop actions */}
        {!isMobile && (
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="blue"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenLink();
              }}
            >
              <IconExternalLink size={14} />
            </ActionIcon>
            
            {onToggleFeatured && (
              <ActionIcon
                variant="subtle"
                color={link.is_featured ? "yellow" : "gray"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFeatured(link.id);
                }}
              >
                {link.is_featured ? (
                  <IconStarFilled size={14} />
                ) : (
                  <IconStar size={14} />
                )}
              </ActionIcon>
            )}
          </Group>
        )}
      </Group>

      {/* Mobile actions panel */}
      {isMobile && showActions && (
        <Box
          mt="md"
          pt="md"
          style={{
            borderTop: "1px solid #E5E7EB",
            animation: "slideDown 0.2s ease",
          }}
        >
          <Group justify="space-around">
            <UnstyledButton
              onClick={(e) => {
                e.stopPropagation();
                handleOpenLink();
                setShowActions(false);
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "8px",
                borderRadius: "8px",
                minWidth: "60px",
              }}
            >
              <IconExternalLink size={18} color="#3B82F6" />
              <Text size="xs" c="blue" mt="xs">Open</Text>
            </UnstyledButton>

            {onEdit && (
              <UnstyledButton
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(link);
                  setShowActions(false);
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "8px",
                  borderRadius: "8px",
                  minWidth: "60px",
                }}
              >
                <IconDots size={18} color="#6B7280" />
                <Text size="xs" c="dimmed" mt="xs">Edit</Text>
              </UnstyledButton>
            )}

            {onToggleFeatured && (
              <UnstyledButton
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFeatured(link.id);
                  setShowActions(false);
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "8px",
                  borderRadius: "8px",
                  minWidth: "60px",
                }}
              >
                {link.is_featured ? (
                  <IconStarFilled size={18} color="#F59E0B" />
                ) : (
                  <IconStar size={18} color="#6B7280" />
                )}
                <Text size="xs" c={link.is_featured ? "yellow" : "dimmed"} mt="xs">
                  {link.is_featured ? "Unstar" : "Star"}
                </Text>
              </UnstyledButton>
            )}
          </Group>
        </Box>
      )}
    </Card>
  );

  // Wrap with swipe functionality on mobile
  if (isMobile) {
    return (
      <SwipeableListItem
        onEdit={onEdit ? () => onEdit(link) : undefined}
        onDelete={onDelete ? () => onDelete(link.id) : undefined}
        onToggleFeatured={onToggleFeatured ? () => onToggleFeatured(link.id) : undefined}
        onCopy={handleCopyUrl}
        onOpen={handleOpenLink}
        isFeatured={link.is_featured || false}
      >
        {linkContent}
      </SwipeableListItem>
    );
  }

  return linkContent;
}