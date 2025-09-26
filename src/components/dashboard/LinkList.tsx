"use client";

import { Stack, Text, Button, Card, Title, Group, ScrollArea } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { Link } from "./DashboardLayout";
import { LinkItem } from "./LinkItem";

interface LinkListProps {
  links: Link[];
  selectedLink: Link | null;
  onEditLink: (link: Link) => void;
  onDeleteLink?: (linkId: string) => void;
  onAddLink: () => void;
}

export function LinkList({ 
  links, 
  selectedLink, 
  onEditLink, 
  onDeleteLink, 
  onAddLink 
}: LinkListProps) {
  // Empty state when no links exist
  if (links.length === 0) {
    return (
      <Card padding="lg" radius="md" withBorder style={{ flex: 1 }}>
        <Group justify="space-between" mb="md">
          <Title order={3} size="h4" c="black">
            Your Links
          </Title>
          <Text size="sm" c="dark.6">
            0 total
          </Text>
        </Group>

        <Stack align="center" gap="md" py="xl">
          <Text c="dark.5" size="lg" ta="center">
            No links yet
          </Text>
          <Text c="dark.4" size="sm" ta="center" style={{ maxWidth: 300 }}>
            Add your first link to get started. You can add social media profiles, websites, or any other links you want to share.
          </Text>
          <Button
            leftSection={<IconPlus size={16} />}
            color="dark"
            variant="light"
            onClick={onAddLink}
          >
            Add Your First Link
          </Button>
        </Stack>
      </Card>
    );
  }

  // Links list when links exist
  return (
    <Card padding="lg" radius="md" withBorder style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Group justify="space-between" mb="md">
        <Title order={3} size="h4" c="black">
          Your Links
        </Title>
        <Text size="sm" c="dark.6">
          {links.length} total
        </Text>
      </Group>

      <ScrollArea style={{ flex: 1 }} scrollbarSize={6}>
        <Stack gap="sm">
          {links.map((link) => (
            <LinkItem
              key={link.id}
              link={link}
              onEdit={onEditLink}
              onDelete={onDeleteLink}
              isSelected={selectedLink?.id === link.id}
            />
          ))}
        </Stack>
      </ScrollArea>
    </Card>
  );
}