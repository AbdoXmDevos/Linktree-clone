"use client";

import { Stack, Title, Text, Avatar, Group } from "@mantine/core";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface PreviewHeaderProps {
  profile: Profile;
}

export function PreviewHeader({ profile }: PreviewHeaderProps) {
  return (
    <Stack align="center" gap="md" pt="md">
      <Avatar
        src={profile.avatar_url}
        alt={profile.display_name || profile.username}
        size={80}
        style={{
          border: "3px solid #e9ecef",
          transition: "transform 0.2s ease"
        }}
      />
      <Stack align="center" gap={4}>
        <Title 
          order={3} 
          size="h4" 
          c="black" 
          ta="center"
          style={{
            fontWeight: 600,
            lineHeight: 1.2
          }}
        >
          {profile.display_name || `@${profile.username}`}
        </Title>
        {profile.bio && (
          <Text 
            size="sm" 
            c="dark.6" 
            ta="center" 
            style={{ 
              maxWidth: 240,
              lineHeight: 1.4
            }}
          >
            {profile.bio}
          </Text>
        )}
      </Stack>
    </Stack>
  );
}