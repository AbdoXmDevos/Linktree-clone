"use client";

import { useState } from "react";
import { Stack, Text, Card, Group, Center, Skeleton, Image, ThemeIcon } from "@mantine/core";
import { IconLink, IconAlertCircle } from "@tabler/icons-react";

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
}

interface SingleLinkCardProps {
  link: Link;
}

// Icon component with fallback handling
function LinkIcon({ icon, title }: { icon?: string; title: string }) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!icon) {
    return (
      <div
        style={{
          width: 24,
          height: 24,
          minWidth: 24,
          minHeight: 24,
          flexShrink: 0
        }}
      >
        <ThemeIcon
          size="md"
          radius="sm"
          variant="light"
          color="gray"
        >
          <IconLink size={16} />
        </ThemeIcon>
      </div>
    );
  }

  // Check if icon is likely an emoji (simple heuristic)
  const isEmoji = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/u.test(icon);
  
  if (isEmoji) {
    return (
      <div
        style={{
          width: 24,
          height: 24,
          minWidth: 24,
          minHeight: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <Text 
          size="xl"
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
    return (
      <div 
        style={{ 
          position: 'relative', 
          width: 24, 
          height: 24,
          minWidth: 24,
          minHeight: 24,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderRadius: '4px'
        }}
      >
        {isLoading && (
          <Skeleton 
            width={24} 
            height={24} 
            radius="sm"
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
        )}
        <Image
          src={icon}
          alt={`Icon for ${title}`}
          width={24}
          height={24}
          radius="sm"
          style={{
            objectFit: 'cover',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.2s ease',
            width: '100%',
            height: '100%'
          }}
          onLoad={() => setIsLoading(false)}
          onLoadStart={() => setIsLoading(true)}
          onError={() => {
            setImageError(true);
            setIsLoading(false);
          }}
        />
      </div>
    );
  }

  // Fallback for failed images or invalid URLs
  if (imageError || (icon.startsWith('http') && !isImageUrl)) {
    return (
      <div
        style={{
          width: 24,
          height: 24,
          minWidth: 24,
          minHeight: 24,
          flexShrink: 0
        }}
      >
        <ThemeIcon
          size="md"
          radius="sm"
          variant="light"
          color="red"
          title="Failed to load image"
        >
          <IconAlertCircle size={16} />
        </ThemeIcon>
      </div>
    );
  }

  // Fallback for any other case
  return (
    <div
      style={{
        width: 24,
        height: 24,
        minWidth: 24,
        minHeight: 24,
        flexShrink: 0
      }}
    >
      <ThemeIcon
        size="md"
        radius="sm"
        variant="light"
        color="gray"
      >
        <IconLink size={16} />
      </ThemeIcon>
    </div>
  );
}

function SingleLinkCard({ link }: SingleLinkCardProps) {
  return (
    <Card
      key={link.id}
      padding="md"
      radius="lg"
      withBorder
      style={{
        backgroundColor: "#ffffff",
        border: "2px solid #000000",
        cursor: "pointer",
        transition: "all 0.2s ease",
        transform: "translateY(0)",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
      }}
      className="link-card-preview"
    >
      <Group gap="md" align="center">
        <LinkIcon icon={link.icon} title={link.title} />
        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Text 
            fw={600} 
            c="black" 
            size="sm"
            style={{
              lineHeight: 1.3,
              wordBreak: "break-word"
            }}
          >
            {link.title}
          </Text>
          {link.description && (
            <Text 
              size="xs" 
              c="dark.6" 
              lineClamp={1}
              style={{
                lineHeight: 1.2
              }}
            >
              {link.description}
            </Text>
          )}
        </Stack>
      </Group>
    </Card>
  );
}

function LinkCardSkeleton() {
  return (
    <Card
      padding="md"
      radius="lg"
      withBorder
      style={{
        backgroundColor: "#ffffff",
        border: "2px solid #e9ecef"
      }}
    >
      <Group gap="md" align="center">
        <Skeleton height={24} width={24} radius="sm" />
        <Stack gap={4} style={{ flex: 1 }}>
          <Skeleton height={16} width="70%" radius="sm" />
          <Skeleton height={12} width="50%" radius="sm" />
        </Stack>
      </Group>
    </Card>
  );
}

function EmptyState() {
  return (
    <Center py="xl">
      <Stack align="center" gap="xs">
        <Text 
          c="dark.4" 
          size="sm" 
          ta="center"
          style={{
            fontWeight: 500
          }}
        >
          No links to display
        </Text>
        <Text 
          c="dark.3" 
          size="xs" 
          ta="center"
          style={{
            lineHeight: 1.3
          }}
        >
          Add links to see them here
        </Text>
      </Stack>
    </Center>
  );
}

export function LinkCardPreview({ links, isLoading = false }: LinkCardPreviewProps) {
  if (isLoading) {
    return (
      <Stack gap="sm" style={{ width: "100%" }}>
        {Array.from({ length: 3 }).map((_, index) => (
          <LinkCardSkeleton key={index} />
        ))}
      </Stack>
    );
  }

  if (links.length === 0) {
    return <EmptyState />;
  }

  return (
    <Stack gap="sm" style={{ width: "100%" }}>
      {links.map((link) => (
        <SingleLinkCard key={link.id} link={link} />
      ))}
    </Stack>
  );
}