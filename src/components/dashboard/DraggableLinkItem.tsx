"use client";

import { Card, Group, Stack, Text, ActionIcon, Tooltip, Image, ThemeIcon } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";
import { IconEdit, IconTrash, IconExternalLink, IconLink, IconAlertCircle, IconGripVertical } from "@tabler/icons-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Link } from "../../../types/dashboard";

interface DraggableLinkItemProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete?: (linkId: string) => void;
  isSelected?: boolean;
  onSelect?: (linkId: string, isSelected: boolean, event?: React.MouseEvent) => void;
  isDragDisabled?: boolean;
}

// Icon component with fallback handling (reused from LinkItem)
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

export function DraggableLinkItem({ 
  link, 
  onEdit, 
  onDelete, 
  isSelected = false,
  onSelect,
  isDragDisabled = false
}: DraggableLinkItemProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: link.id,
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger edit if clicking on action buttons or drag handle
    if ((e.target as HTMLElement).closest('[data-action-button]') || 
        (e.target as HTMLElement).closest('[data-drag-handle]')) {
      return;
    }
    onEdit(link);
  };

  const handleSelect = (e: React.MouseEvent) => {
    if (onSelect && (e.ctrlKey || e.metaKey || e.shiftKey)) {
      e.preventDefault();
      e.stopPropagation();
      onSelect(link.id, !isSelected, e);
    }
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
      ref={setNodeRef}
      style={style}
      padding={isMobile ? "lg" : "md"}
      radius="sm"
      withBorder
      className={isMobile ? "touch-target" : undefined}
      onClick={handleClick}
      onMouseDown={handleSelect}
      sx={(theme) => ({
        backgroundColor: isSelected ? theme.colors.blue[0] : theme.colors.gray[0],
        cursor: isDragging ? "grabbing" : "pointer",
        transition: "all 0.2s ease",
        borderColor: isSelected ? theme.colors.blue[3] : undefined,
        minHeight: isMobile ? "72px" : undefined,
        '&:hover': {
          backgroundColor: isSelected ? theme.colors.blue[1] : theme.colors.gray[1],
          transform: isDragging ? undefined : 'translateY(-1px)',
          boxShadow: isDragging ? undefined : theme.shadows.sm,
        }
      })}
    >
      <Group justify="space-between" align="flex-start">
        {/* Drag Handle */}
        {!isMobile && (
          <div
            {...attributes}
            {...listeners}
            data-drag-handle
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              padding: "4px",
              marginLeft: "-4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <IconGripVertical size={16} color="#868e96" />
          </div>
        )}

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
              data-action-button
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
              data-action-button
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
                data-action-button
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