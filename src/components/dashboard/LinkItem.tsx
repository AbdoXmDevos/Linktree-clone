"use client";

import { Card, Group, Stack, Text, ActionIcon, Tooltip } from "@mantine/core";
import { IconEdit, IconTrash, IconExternalLink } from "@tabler/icons-react";
import { Link } from "./DashboardLayout";

interface LinkItemProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete?: (linkId: string) => void;
  isSelected?: boolean;
}

export function LinkItem({ 
  link, 
  onEdit, 
  onDelete, 
  isSelected = false 
}: LinkItemProps) {
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
      padding="md"
      radius="sm"
      withBorder
      style={{ 
        backgroundColor: isSelected ? "#f1f3f4" : "#f8f9fa",
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: isSelected ? "#495057" : undefined,
      }}
      onClick={handleClick}
    >
      <Group justify="space-between" align="flex-start">
        {/* Link Content */}
        <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
          {/* Icon */}
          {link.icon && (
            <Text size="lg" style={{ flexShrink: 0 }}>
              {link.icon}
            </Text>
          )}
          
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
        <Group gap="xs" style={{ flexShrink: 0 }}>
          <Tooltip label="Visit link">
            <ActionIcon
              variant="subtle"
              color="dark"
              size="sm"
              onClick={handleExternalLink}
            >
              <IconExternalLink size={14} />
            </ActionIcon>
          </Tooltip>
          
          <Tooltip label="Edit link">
            <ActionIcon
              variant="subtle"
              color="dark"
              size="sm"
              onClick={handleClick}
            >
              <IconEdit size={14} />
            </ActionIcon>
          </Tooltip>
          
          {onDelete && (
            <Tooltip label="Delete link">
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={handleDelete}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>
    </Card>
  );
}