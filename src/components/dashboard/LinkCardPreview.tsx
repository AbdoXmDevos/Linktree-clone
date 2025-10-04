"use client";

import { useState } from "react";
import { Stack, Text, Card, Group, Center, Skeleton, Image, ThemeIcon, Box } from "@mantine/core";
import { IconLink, IconAlertCircle } from "@tabler/icons-react";
import { colors, shadows, borderRadius, animation, typography } from "../../styles/design-tokens";
import { AnimatedCard, StaggerContainer, StaggerItem, FadeIn } from "../animations/AnimatedComponents";
import { LoadingCardSkeleton } from "../animations/LoadingAnimations";

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

interface LinkCardPreviewProps {
  links: Link[];
  isLoading?: boolean;
  variant?: 'default' | 'compact' | 'elevated';
  showSkeleton?: boolean;
}

interface SingleLinkCardProps {
  link: Link;
}

// Enhanced icon component with professional styling and fallback handling
function EnhancedLinkIcon({ icon, title, size = 32 }: { icon?: string; title: string; size?: number }) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const iconContainerStyle = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: borderRadius.md,
    transition: animation.duration.normal,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  };

  if (!icon) {
    return (
      <Box
        style={{
          ...iconContainerStyle,
          background: colors.gradients.glass,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${colors.neutral[200]}`,
        }}
      >
        <IconLink size={size * 0.5} color={colors.neutral[500]} />
      </Box>
    );
  }

  // Check if icon is likely an emoji
  const isEmoji = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/u.test(icon);
  
  if (isEmoji) {
    return (
      <Box
        style={{
          ...iconContainerStyle,
          background: colors.gradients.glass,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${colors.neutral[200]}`,
          fontSize: `${size * 0.6}px`,
          fontFamily: typography.fontFamily.sans,
        }}
      >
        {icon}
      </Box>
    );
  }

  // Handle image URLs
  const isImageUrl = /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i.test(icon);
  
  if (isImageUrl && !imageError) {
    return (
      <Box style={iconContainerStyle}>
        {isLoading && (
          <Skeleton 
            width={size} 
            height={size} 
            radius="md"
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
          />
        )}
        <Image
          src={icon}
          alt={`Icon for ${title}`}
          width={size}
          height={size}
          radius="md"
          style={{
            objectFit: 'cover',
            opacity: isLoading ? 0 : 1,
            transition: `opacity ${animation.duration.normal}`,
            width: '100%',
            height: '100%',
            border: `1px solid ${colors.neutral[200]}`,
          }}
          onLoad={() => setIsLoading(false)}
          onLoadStart={() => setIsLoading(true)}
          onError={() => {
            setImageError(true);
            setIsLoading(false);
          }}
        />
      </Box>
    );
  }

  // Fallback for failed images or invalid URLs
  return (
    <Box
      style={{
        ...iconContainerStyle,
        backgroundColor: colors.error[50],
        border: `1px solid ${colors.error[200]}`,
      }}
    >
      <IconAlertCircle size={size * 0.5} color={colors.error[500]} />
    </Box>
  );
}

function EnhancedSingleLinkCard({ link, variant = 'default' }: SingleLinkCardProps & { variant?: 'default' | 'compact' | 'elevated' }) {
  const cardStyles = {
    default: {
      padding: "md",
      background: colors.neutral[50],
      border: `2px solid ${colors.neutral[200]}`,
      shadow: shadows.sm,
    },
    compact: {
      padding: "sm",
      background: colors.gradients.glass,
      border: `1px solid ${colors.neutral[200]}`,
      shadow: shadows.xs,
    },
    elevated: {
      padding: "lg",
      background: colors.gradients.glass,
      border: `2px solid ${colors.primary[200]}`,
      shadow: shadows.md,
    }
  };

  const style = cardStyles[variant];

  return (
    <AnimatedCard
      enableHover={true}
      style={{
        background: style.background,
        backdropFilter: variant !== 'default' ? 'blur(10px)' : 'none',
        border: style.border,
        cursor: "pointer",
        boxShadow: style.shadow,
        borderRadius: borderRadius.xl,
        padding: style.padding === "sm" ? "12px" : style.padding === "lg" ? "20px" : "16px",
      }}
      className="enhanced-link-card-preview"
    >
      <Group gap="md" align="center">
        <EnhancedLinkIcon 
          icon={link.icon} 
          title={link.title} 
          size={variant === 'compact' ? 28 : variant === 'elevated' ? 36 : 32}
        />
        <Stack gap={variant === 'compact' ? 1 : 2} style={{ flex: 1, minWidth: 0 }}>
          <Text 
            fw={600} 
            c="black" 
            size={variant === 'compact' ? "xs" : variant === 'elevated' ? "md" : "sm"}
            style={{
              lineHeight: 1.3,
              wordBreak: "break-word",
              fontFamily: typography.fontFamily.sans,
              letterSpacing: typography.letterSpacing.tight,
            }}
          >
            {link.title}
          </Text>
          {link.description && (
            <Text 
              size={variant === 'compact' ? "10px" : "xs"}
              c="dark.6" 
              lineClamp={1}
              style={{
                lineHeight: 1.2,
                fontFamily: typography.fontFamily.sans,
              }}
            >
              {link.description}
            </Text>
          )}
        </Stack>
      </Group>
    </AnimatedCard>
  );
}

function EnhancedLinkCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' | 'elevated' }) {
  return (
    <FadeIn>
      <LoadingCardSkeleton />
    </FadeIn>
  );
}

function EnhancedEmptyState({ variant = 'default' }: { variant?: 'default' | 'compact' | 'elevated' }) {
  return (
    <Center py={variant === 'compact' ? "md" : "xl"}>
      <Stack align="center" gap="xs">
        <Box
          style={{
            width: 48,
            height: 48,
            borderRadius: borderRadius.full,
            background: colors.gradients.glass,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${colors.neutral[200]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px',
          }}
        >
          <IconLink size={24} color={colors.neutral[400]} />
        </Box>
        <Text 
          c="dark.4" 
          size={variant === 'compact' ? "xs" : "sm"}
          ta="center"
          style={{
            fontWeight: 500,
            fontFamily: typography.fontFamily.sans,
          }}
        >
          No links to display
        </Text>
        <Text 
          c="dark.3" 
          size={variant === 'compact' ? "10px" : "xs"}
          ta="center"
          style={{
            lineHeight: 1.3,
            fontFamily: typography.fontFamily.sans,
          }}
        >
          Add links to see them here
        </Text>
      </Stack>
    </Center>
  );
}

export function LinkCardPreview({ 
  links, 
  isLoading = false, 
  variant = 'default',
  showSkeleton = true 
}: LinkCardPreviewProps) {
  const gapSize = variant === 'compact' ? "xs" : variant === 'elevated' ? "md" : "sm";

  if (isLoading && showSkeleton) {
    return (
      <StaggerContainer staggerDelay={0.1}>
        <Stack gap={gapSize} style={{ width: "100%" }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <StaggerItem key={index}>
              <EnhancedLinkCardSkeleton variant={variant} />
            </StaggerItem>
          ))}
        </Stack>
      </StaggerContainer>
    );
  }

  if (links.length === 0) {
    return (
      <FadeIn delay={0.2}>
        <EnhancedEmptyState variant={variant} />
      </FadeIn>
    );
  }

  return (
    <StaggerContainer staggerDelay={0.05}>
      <Stack gap={gapSize} style={{ width: "100%" }}>
        {links.map((link) => (
          <StaggerItem key={link.id}>
            <EnhancedSingleLinkCard link={link} variant={variant} />
          </StaggerItem>
        ))}
      </Stack>
    </StaggerContainer>
  );
}