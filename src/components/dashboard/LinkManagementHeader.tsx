"use client";

import { Group, Title, Text, Button, Stack, Badge } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconPlus, IconSearch } from "@tabler/icons-react";

interface LinkManagementHeaderProps {
  username: string;
  linkCount: number;
  onAddLink: () => void;
}

export function LinkManagementHeader({ 
  username, 
  linkCount, 
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
              {linkCount} {linkCount === 1 ? 'link' : 'links'}
            </Badge>
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

      {/* Search/Filter Placeholder for Future Enhancement */}
      <Group gap="sm" style={{ opacity: 0.6 }}>
        <IconSearch size={16} color="var(--mantine-color-dark-4)" />
        <Text size="sm" c="dark.4">
          Search and filter coming soon...
        </Text>
      </Group>
    </Stack>
  );
}