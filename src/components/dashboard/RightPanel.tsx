"use client";

import { Stack, Title, Text, Card, Group } from "@mantine/core";
import { MobileFrame } from "./MobileFrame";
import { PreviewHeader } from "./PreviewHeader";
import { LinkCardPreview } from "./LinkCardPreview";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface Link {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  order_index: number;
  created_at: Date;
}

interface RightPanelProps {
  profile: Profile;
  links: Link[];
  isLoading?: boolean;
}

export function RightPanel({ profile, links, isLoading = false }: RightPanelProps) {
  return (
    <Stack gap="lg" style={{ height: "100%" }}>
      {/* Preview Header */}
      <Card padding="lg" radius="md" withBorder>
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title order={2} size="h3" c="black">
              Mobile Preview
            </Title>
            <Text c="dark.6" size="sm">
              How your profile looks to visitors
            </Text>
          </Stack>
        </Group>
      </Card>

      {/* Mobile Frame Container */}
      <MobileFrame>
        <Stack gap="lg" align="center">
          {/* Profile Header */}
          <PreviewHeader profile={profile} />

          {/* Links Preview */}
          <LinkCardPreview links={links} isLoading={isLoading} />
        </Stack>
      </MobileFrame>
    </Stack>
  );
}