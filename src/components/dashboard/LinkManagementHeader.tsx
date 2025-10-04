"use client";

import { Group, Title, Text, Button, Stack, Badge } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";

interface LinkManagementHeaderProps {
  username: string;
  linkCount: number;
  filteredCount?: number;
  searchQuery?: string;
  onAddLink: () => void;
}

export function LinkManagementHeader({
  username,
  linkCount,
  filteredCount,
  searchQuery,
  onAddLink
}: LinkManagementHeaderProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Stack gap="md">
      {/* Main Header */}
      <Group justify="space-between" align="flex-start">
        <Stack gap="xs">
          <Title order={1} size="h2" c="black">
            Dashboard
          </Title>
          <Text c="dark.6" size="sm">
            Manage your links and see how they'll appear to visitors
          </Text>
          <Group gap="xs" mt="xs">
            <Text size="sm" c="dark.7" fw={500}>
              @{username}
            </Text>
            <Badge color="dark" variant="light" size="sm">
              {typeof filteredCount !== 'undefined' && filteredCount !== linkCount 
                ? `${filteredCount} of ${linkCount}` 
                : `${linkCount}`} {linkCount === 1 ? 'link' : 'links'}
            </Badge>
            {searchQuery && (
              <Badge color="blue" variant="light" size="sm">
                Searching: "{searchQuery}"
              </Badge>
            )}
          </Group>
        </Stack>
      </Group>

      {/* Primary Add Button */}
      <Button
        leftSection={<IconPlus size={isMobile ? 20 : 18} />}
        size={isMobile ? "xl" : "lg"}
        color="dark"
        onClick={onAddLink}
        fullWidth
        className={isMobile ? "touch-button" : undefined}
        styles={isMobile ? {
          root: {
            minHeight: "56px",
            fontSize: "16px",
            fontWeight: 600
          }
        } : undefined}
      >
        Add New Link
      </Button>


    </Stack>
  );
}