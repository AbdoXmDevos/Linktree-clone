"use client";

import { Stack, Text, Card, Group, Center, Skeleton } from "@mantine/core";

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
        {link.icon && (
          <Text 
            size="xl"
            style={{
              minWidth: "24px",
              textAlign: "center"
            }}
          >
            {link.icon}
          </Text>
        )}
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