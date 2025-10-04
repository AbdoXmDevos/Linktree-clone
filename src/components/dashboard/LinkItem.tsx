"use client";

import { Card, Group, Stack, Text, ActionIcon, Tooltip, Image, ThemeIcon } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";
import { IconEdit, IconTrash, IconExternalLink, IconLink, IconAlertCircle } from "@tabler/icons-react";
import type { Link } from "../../../types/dashboard";

interface LinkItemProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete?: (linkId: string) => void;
  isSelected?: boolean;
}

// Icon component with fallback handling
function LinkIcon({ icon, title, size = "md" }: { icon?: string; title: string; size?: "sm" | "md" | "lg" }) {
  const [imageError, setImageError] = useState(false);

  if (!icon) {
    const iconSize = size === "sm" ? 20 : size === "md" ? 24 : 28;
    return (
      <div
        style={{
          width: iconSize,
          height: iconSize,
          minWidth: iconSize,
          minHeight: iconSize,
          flexShrink: 0
        }}
      >
        <ThemeIcon
          size={size}
          radius="sm"
          variant="light"
          color="gray"
        >
          <IconLink size={size === "sm" ? 14 : size === "md" ? 16 : 18} />
        </ThemeIcon>
      </div>
    );
  }

  // Check if icon is likely an emoji (simple heuristic)
  const isEmoji = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/u.test(icon);
  
  if (isEmoji) {
    const iconSize = size === "sm" ? 20 : size === "md" ? 24 : 28;
    return (
      <div
        style={{
          width: iconSize,
          height: iconSize,
          minWidth: iconSize,
          minHeight: iconSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <Text 
          size={size === "sm" ? "md" : size === "md" ? "lg" : "xl"}
          style={{
            lineHeight: 1,
            textAlign: "center"
          }}
        >
          {icon}
        </Text>
      </div>
    );
  }

  // Handle image URLs
  const isImageUrl = /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i.test(icon);
  
  if (isImageUrl && !imageError) {
    const iconSize = size === "sm" ? 20 : size === "md" ? 24 : 28;
    return (
      <div
        style={{
          width: iconSize,
          height: iconSize,
          minWidth: iconSize,
          minHeight: iconSize,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderRadius: '4px'
        }}
      >
        <Image
          src={icon}
          alt={`Icon for ${title}`}
          width={iconSize}
          height={iconSize}
          radius="sm"
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%'
          }}
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Fallback for failed images or invalid URLs
  if (imageError || (icon.startsWith('http') && !isImageUrl)) {
    const iconSize = size === "sm" ? 20 : size === "md" ? 24 : 28;
    return (
      <div
        style={{
          width: iconSize,
          height: iconSize,
          minWidth: iconSize,
          minHeight: iconSize,
          flexShrink: 0
        }}
      >
        <ThemeIcon
          size={size}
          radius="sm"
          variant="light"
          color="red"
          title="Failed to load image"
        >
          <IconAlertCircle size={size === "sm" ? 14 : size === "md" ? 16 : 18} />
        </ThemeIcon>
      </div>
    );
  }

  // Fallback for any other case
  const iconSize = size === "sm" ? 20 : size === "md" ? 24 : 28;
  return (
    <div
      style={{
        width: iconSize,
        height: iconSize,
        minWidth: iconSize,
        minHeight: iconSize,
        flexShrink: 0
      }}
    >
      <ThemeIcon
        size={size}
        radius="sm"
        variant="light"
        color="gray"
      >
        <IconLink size={size === "sm" ? 14 : size === "md" ? 16 : 18} />
      </ThemeIcon>
    </div>
  );
}

export function LinkItem({ 
  link, 
  onEdit, 
  onDelete, 
  isSelected = false 
}: LinkItemProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const handleClick = () => {
    onEdit(link);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(link.id);
    }
  };

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      padding={isMobile ? "lg" : "md"}
      radius="sm"
      withBorder
      style={{ 
        backgroundColor: isSelected ? "#f1f3f4" : "#f8f9fa",
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: isSelected ? "#495057" : undefined,
        minHeight: isMobile ? "72px" : undefined,
      }}
      className={isMobile ? "touch-target" : undefined}
      onClick={handleClick}
    >
      <Group justify="space-between" align="flex-start">
        {/* Link Content */}
        <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
          {/* Icon */}
          <LinkIcon 
            icon={link.icon} 
            title={link.title} 
            size={isMobile ? "lg" : "md"} 
          />
          
          {/* Link Details */}
          <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
            <Text fw={500} c="dark.8" size="sm" truncate>
              {link.title}
            </Text>
            <Text size="xs" c="dark.5" truncate>
              {link.url}
            </Text>
            {link.description && (
              <Text size="xs" c="dark.4" truncate>
                {link.description}
              </Text>
            )}
          </Stack>
        </Group>

        {/* Action Buttons */}
        <Group gap={isMobile ? "sm" : "xs"} style={{ flexShrink: 0 }}>
          <Tooltip label="Visit link" disabled={isMobile}>
            <ActionIcon
              variant="subtle"
              color="dark"
              size={isMobile ? "md" : "sm"}
              className={isMobile ? "touch-target" : undefined}
              onClick={handleExternalLink}
            >
              <IconExternalLink size={isMobile ? 18 : 14} />
            </ActionIcon>
          </Tooltip>
          
          <Tooltip label="Edit link" disabled={isMobile}>
            <ActionIcon
              variant="subtle"
              color="dark"
              size={isMobile ? "md" : "sm"}
              className={isMobile ? "touch-target" : undefined}
              onClick={handleClick}
            >
              <IconEdit size={isMobile ? 18 : 14} />
            </ActionIcon>
          </Tooltip>
          
          {onDelete && (
            <Tooltip label="Delete link" disabled={isMobile}>
              <ActionIcon
                variant="subtle"
                color="red"
                size={isMobile ? "md" : "sm"}
                className={isMobile ? "touch-target" : undefined}
                onClick={handleDelete}
              >
                <IconTrash size={isMobile ? 18 : 14} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>
    </Card>
  );
}