"use client";

import { Stack, Title, Text, Avatar, Group, Box, Badge } from "@mantine/core";
import { colors, shadows, borderRadius, animation, typography } from "../../styles/design-tokens";

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
  variant?: 'default' | 'compact' | 'elevated';
  showBadge?: boolean;
  isLoading?: boolean;
}

export function PreviewHeader({ 
  profile, 
  variant = 'default', 
  showBadge = false,
  isLoading = false 
}: PreviewHeaderProps) {
  const avatarSizes = {
    default: 80,
    compact: 60,
    elevated: 100,
  };

  const avatarSize = avatarSizes[variant];

  if (isLoading) {
    return (
      <Stack align="center" gap="md" pt="md">
        <Box
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: borderRadius.full,
            background: colors.gradients.glass,
            backdropFilter: 'blur(10px)',
            border: `3px solid ${colors.neutral[200]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            style={{
              width: avatarSize - 20,
              height: avatarSize - 20,
              borderRadius: borderRadius.full,
              backgroundColor: colors.neutral[200],
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        </Box>
        <Stack align="center" gap={4}>
          <Box
            style={{
              width: 120,
              height: 20,
              borderRadius: borderRadius.md,
              backgroundColor: colors.neutral[200],
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          <Box
            style={{
              width: 80,
              height: 16,
              borderRadius: borderRadius.md,
              backgroundColor: colors.neutral[200],
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack align="center" gap="md" pt="md">
      <Box style={{ position: 'relative' }}>
        <Avatar
          src={profile.avatar_url}
          alt={profile.display_name || profile.username}
          size={avatarSize}
          style={{
            border: `3px solid ${colors.neutral[200]}`,
            boxShadow: variant === 'elevated' ? shadows.lg : shadows.md,
            transition: `all ${animation.duration.normal} ${animation.easing.inOut}`,
            background: colors.gradients.glass,
            backdropFilter: 'blur(10px)',
          }}
        />
        {showBadge && (
          <Badge
            size="sm"
            radius="xl"
            style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              background: colors.gradients.primary,
              border: `2px solid ${colors.neutral[50]}`,
              boxShadow: shadows.md,
            }}
          >
            Pro
          </Badge>
        )}
      </Box>
      
      <Stack align="center" gap={variant === 'compact' ? 2 : 4}>
        <Title 
          order={variant === 'elevated' ? 2 : 3} 
          size={variant === 'compact' ? "h5" : variant === 'elevated' ? "h3" : "h4"}
          c="black" 
          ta="center"
          style={{
            fontWeight: 700,
            lineHeight: 1.2,
            fontFamily: typography.fontFamily.sans,
            letterSpacing: typography.letterSpacing.tight,
            background: variant === 'elevated' ? colors.gradients.primary : 'transparent',
            backgroundClip: variant === 'elevated' ? 'text' : 'initial',
            WebkitBackgroundClip: variant === 'elevated' ? 'text' : 'initial',
            WebkitTextFillColor: variant === 'elevated' ? 'transparent' : 'initial',
          }}
        >
          {profile.display_name || `@${profile.username}`}
        </Title>
        
        {!profile.display_name && (
          <Text 
            size={variant === 'compact' ? "xs" : "sm"}
            c="dimmed" 
            ta="center"
            style={{
              fontFamily: typography.fontFamily.sans,
              fontWeight: 500,
            }}
          >
            @{profile.username}
          </Text>
        )}
        
        {profile.bio && (
          <Text 
            size={variant === 'compact' ? "xs" : "sm"}
            c="dark.6" 
            ta="center" 
            style={{ 
              maxWidth: variant === 'compact' ? 200 : variant === 'elevated' ? 320 : 240,
              lineHeight: 1.4,
              fontFamily: typography.fontFamily.sans,
            }}
          >
            {profile.bio}
          </Text>
        )}
      </Stack>
    </Stack>
  );
}