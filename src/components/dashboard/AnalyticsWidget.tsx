"use client";

import React from "react";
import {
  Card,
  Text,
  Group,
  Stack,
  ThemeIcon,
  Progress,
  Loader,
  Center,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconEye,
  IconClick,
  IconUsers,
  IconRefresh,
  IconChartBar,
} from "@tabler/icons-react";
import { useAnalytics } from "../../hooks/useAnalytics";

interface AnalyticsWidgetProps {
  profileId: string;
  onViewDetails?: () => void;
}

export function AnalyticsWidget({ profileId, onViewDetails }: AnalyticsWidgetProps) {
  const { data, summary, isLoading, error, refresh } = useAnalytics({
    profileId,
    refreshInterval: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <Card>
        <Center h={120}>
          <Stack align="center" gap="xs">
            <Loader size="sm" />
            <Text size="xs" c="dimmed">Loading...</Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <Group justify="space-between" mb="xs">
          <Text fw={500} size="sm">Analytics</Text>
          <ActionIcon size="xs" variant="subtle" onClick={refresh}>
            <IconRefresh size={12} />
          </ActionIcon>
        </Group>
        <Center h={80}>
          <Text size="xs" c="red">Failed to load</Text>
        </Center>
      </Card>
    );
  }

  const clickThroughRate = data.profileViews > 0 
    ? (data.totalClicks / data.profileViews) * 100 
    : 0;

  return (
    <Card>
      <Group justify="space-between" mb="sm">
        <Text fw={500} size="sm">Analytics</Text>
        <Group gap="xs">
          <ActionIcon size="xs" variant="subtle" onClick={refresh}>
            <IconRefresh size={12} />
          </ActionIcon>
          {onViewDetails && (
            <Tooltip label="View detailed analytics">
              <ActionIcon size="xs" variant="subtle" onClick={onViewDetails}>
                <IconChartBar size={12} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>

      <Stack gap="sm">
        {/* Quick Metrics */}
        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon size="xs" variant="light" color="blue">
              <IconClick size={10} />
            </ThemeIcon>
            <Text size="xs" c="dimmed">Clicks</Text>
          </Group>
          <Text size="xs" fw={600}>{data.totalClicks.toLocaleString()}</Text>
        </Group>

        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon size="xs" variant="light" color="green">
              <IconEye size={10} />
            </ThemeIcon>
            <Text size="xs" c="dimmed">Views</Text>
          </Group>
          <Text size="xs" fw={600}>{data.profileViews.toLocaleString()}</Text>
        </Group>

        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon size="xs" variant="light" color="orange">
              <IconUsers size={10} />
            </ThemeIcon>
            <Text size="xs" c="dimmed">Visitors</Text>
          </Group>
          <Text size="xs" fw={600}>{data.uniqueVisitors.toLocaleString()}</Text>
        </Group>

        {/* Click-through Rate */}
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="xs" c="dimmed">Click Rate</Text>
            <Text size="xs" fw={600}>{clickThroughRate.toFixed(1)}%</Text>
          </Group>
          <Progress 
            value={Math.min(clickThroughRate, 100)} 
            size="xs" 
            color={clickThroughRate > 50 ? "green" : clickThroughRate > 25 ? "yellow" : "red"}
          />
        </Stack>

        {/* Today's Performance */}
        <Group justify="space-between" pt="xs" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
          <Text size="xs" c="dimmed">Today</Text>
          <Group gap="xs">
            <Text size="xs" fw={500}>{data.todayClicks}</Text>
            <TrendIcon trend={summary?.clickTrend || 'stable'} />
          </Group>
        </Group>

        {/* Top Link */}
        {data.topLinks.length > 0 && (
          <Stack gap="xs">
            <Text size="xs" c="dimmed">Top Link</Text>
            <Group justify="space-between">
              <Text size="xs" lineClamp={1} style={{ flex: 1 }}>
                {data.topLinks[0].title}
              </Text>
              <Text size="xs" fw={500} c="blue">
                {data.topLinks[0].clicks}
              </Text>
            </Group>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

// Mini trend indicator
function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  switch (trend) {
    case 'up':
      return <IconTrendingUp size={12} color="var(--mantine-color-green-6)" />;
    case 'down':
      return <IconTrendingDown size={12} color="var(--mantine-color-red-6)" />;
    default:
      return <IconMinus size={12} color="var(--mantine-color-gray-6)" />;
  }
}