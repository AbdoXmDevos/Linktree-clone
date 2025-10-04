"use client";

import React, { useState, useMemo } from "react";
import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Grid,
  Card,
  Badge,
  ActionIcon,
  Select,
  Loader,
  Center,
  ThemeIcon,
  Progress,
  Tooltip,
  Button,
  Divider,
  ScrollArea,
} from "@mantine/core";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconEye,
  IconClick,
  IconUsers,
  IconLink,
  IconRefresh,
  IconCalendar,
  IconWorld,
  IconExternalLink,
  IconChevronUp,
  IconChevronDown,
} from "@tabler/icons-react";
import { useAnalytics, useAnalyticsPerformance } from "../../hooks/useAnalytics";
import type { AnalyticsData } from "../../../types/dashboard";

interface AnalyticsPanelProps {
  profileId: string;
  className?: string;
}

export function AnalyticsPanel({ profileId, className }: AnalyticsPanelProps) {
  const [timeRange, setTimeRange] = useState("30d");
  const [chartType, setChartType] = useState<"line" | "area" | "bar">("area");

  // Calculate time range dates
  const timeRangeOptions = useMemo(() => {
    const now = new Date();
    const ranges = {
      "7d": new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      "30d": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      "90d": new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      "1y": new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
    };
    return ranges[timeRange as keyof typeof ranges];
  }, [timeRange]);

  const { data, isLoading, error, refresh } = useAnalytics({
    profileId,
    timeRange: timeRangeOptions ? {
      startDate: timeRangeOptions,
      endDate: new Date(),
    } : undefined,
  });

  const performance = useAnalyticsPerformance(data);

  if (isLoading) {
    return (
      <Paper p="md" className={className}>
        <Center h={200}>
          <Stack align="center" gap="sm">
            <Loader size="lg" />
            <Text c="dimmed">Loading analytics...</Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper p="md" className={className}>
        <Center h={200}>
          <Stack align="center" gap="sm">
            <Text c="red">Failed to load analytics</Text>
            <Button variant="light" onClick={refresh} leftSection={<IconRefresh size={16} />}>
              Retry
            </Button>
          </Stack>
        </Center>
      </Paper>
    );
  }

  if (!data) {
    return (
      <Paper p="md" className={className}>
        <Center h={200}>
          <Text c="dimmed">No analytics data available</Text>
        </Center>
      </Paper>
    );
  }

  return (
    <Stack gap="md" className={className}>
      {/* Header */}
      <Group justify="space-between" align="center">
        <Title order={3}>Analytics Dashboard</Title>
        <Group gap="sm">
          <Select
            value={timeRange}
            onChange={(value) => setTimeRange(value || "30d")}
            data={[
              { value: "7d", label: "Last 7 days" },
              { value: "30d", label: "Last 30 days" },
              { value: "90d", label: "Last 90 days" },
              { value: "1y", label: "Last year" },
            ]}
            size="sm"
            leftSection={<IconCalendar size={16} />}
          />
          <ActionIcon variant="light" onClick={refresh}>
            <IconRefresh size={16} />
          </ActionIcon>
        </Group>
      </Group>

      {/* Key Metrics Cards */}
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Total Clicks"
            value={data.totalClicks}
            icon={IconClick}
            color="blue"
            trend={performance?.growthRate}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Profile Views"
            value={data.profileViews}
            icon={IconEye}
            color="green"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Total Links"
            value={data.totalLinks}
            icon={IconLink}
            color="violet"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Unique Visitors"
            value={data.uniqueVisitors}
            icon={IconUsers}
            color="orange"
          />
        </Grid.Col>
      </Grid>

      {/* Performance Overview */}
      {performance && (
        <Card>
          <Card.Section p="md" pb="xs">
            <Title order={4}>Performance Overview</Title>
          </Card.Section>
          <Card.Section p="md" pt="xs">
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Click-through Rate</Text>
                  <Group gap="xs">
                    <Text fw={600} size="lg">{performance.clickThroughRate.toFixed(1)}%</Text>
                    <Progress value={performance.clickThroughRate} size="sm" style={{ flex: 1 }} />
                  </Group>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Avg. Clicks per Link</Text>
                  <Text fw={600} size="lg">{performance.averageClicksPerLink.toFixed(1)}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Engagement Score</Text>
                  <Group gap="xs">
                    <Text fw={600} size="lg">{performance.engagementScore.toFixed(0)}/100</Text>
                    <Progress value={performance.engagementScore} size="sm" style={{ flex: 1 }} />
                  </Group>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Growth Rate</Text>
                  <Group gap="xs">
                    <TrendIndicator value={performance.growthRate} />
                    <Text fw={600} size="lg">{performance.growthRate.toFixed(1)}%</Text>
                  </Group>
                </Stack>
              </Grid.Col>
            </Grid>
          </Card.Section>
        </Card>
      )}

      {/* Charts Section */}
      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card>
            <Card.Section p="md" pb="xs">
              <Group justify="space-between">
                <Title order={4}>Clicks Over Time</Title>
                <Select
                  value={chartType}
                  onChange={(value) => setChartType(value as "line" | "area" | "bar" || "area")}
                  data={[
                    { value: "area", label: "Area Chart" },
                    { value: "line", label: "Line Chart" },
                    { value: "bar", label: "Bar Chart" },
                  ]}
                  size="sm"
                />
              </Group>
            </Card.Section>
            <Card.Section p="md" pt="xs">
              <ResponsiveContainer width="100%" height={300}>
                {chartType === "area" && (
                  <AreaChart data={data.clicksOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area
                      type="monotone"
                      dataKey="clicks"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                )}
                {chartType === "line" && (
                  <LineChart data={data.clicksOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="#3B82F6"
                      strokeWidth={2}
                    />
                  </LineChart>
                )}
                {chartType === "bar" && (
                  <BarChart data={data.clicksOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="clicks" fill="#3B82F6" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </Card.Section>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="md">
            {/* Top Countries */}
            <Card>
              <Card.Section p="md" pb="xs">
                <Title order={4}>Top Countries</Title>
              </Card.Section>
              <Card.Section p="md" pt="xs">
                <Stack gap="xs">
                  {data.topCountries.slice(0, 5).map((country, index) => (
                    <Group key={country.countryCode} justify="space-between">
                      <Group gap="xs">
                        <ThemeIcon size="sm" variant="light">
                          <IconWorld size={12} />
                        </ThemeIcon>
                        <Text size="sm">{country.countryName}</Text>
                      </Group>
                      <Group gap="xs">
                        <Text size="sm" fw={500}>{country.clicks}</Text>
                        <Text size="xs" c="dimmed">({country.percentage.toFixed(1)}%)</Text>
                      </Group>
                    </Group>
                  ))}
                </Stack>
              </Card.Section>
            </Card>

            {/* Quick Stats */}
            <Card>
              <Card.Section p="md" pb="xs">
                <Title order={4}>Quick Stats</Title>
              </Card.Section>
              <Card.Section p="md" pt="xs">
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Today's Clicks</Text>
                    <Text fw={500}>{data.todayClicks}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">This Week</Text>
                    <Text fw={500}>{data.weeklyClicks}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">This Month</Text>
                    <Text fw={500}>{data.monthlyClicks}</Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Bounce Rate</Text>
                    <Text fw={500}>{data.bounceRate.toFixed(1)}%</Text>
                  </Group>
                </Stack>
              </Card.Section>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Top Links */}
      <Card>
        <Card.Section p="md" pb="xs">
          <Title order={4}>Top Performing Links</Title>
        </Card.Section>
        <Card.Section p="md" pt="xs">
          <ScrollArea h={300}>
            <Stack gap="sm">
              {data.topLinks.map((link, index) => (
                <Group key={link.linkId} justify="space-between" p="sm" style={{
                  borderRadius: 8,
                  backgroundColor: index < 3 ? 'var(--mantine-color-blue-0)' : 'transparent',
                }}>
                  <Group gap="sm">
                    <Badge size="sm" variant="light" color={
                      index === 0 ? "gold" : index === 1 ? "gray" : index === 2 ? "orange" : "blue"
                    }>
                      #{index + 1}
                    </Badge>
                    <Stack gap={2}>
                      <Text fw={500} size="sm" lineClamp={1}>{link.title}</Text>
                      <Text size="xs" c="dimmed" lineClamp={1}>{link.url}</Text>
                    </Stack>
                  </Group>
                  <Group gap="sm">
                    <Stack gap={2} align="end">
                      <Group gap="xs">
                        <Text fw={600}>{link.clicks}</Text>
                        <Text size="xs" c="dimmed">clicks</Text>
                      </Group>
                      <Group gap="xs">
                        <TrendIndicator value={0} size="xs" />
                        <Text size="xs" c="dimmed">{link.clickRate.toFixed(1)}%</Text>
                      </Group>
                    </Stack>
                    <ActionIcon size="sm" variant="subtle">
                      <IconExternalLink size={12} />
                    </ActionIcon>
                  </Group>
                </Group>
              ))}
            </Stack>
          </ScrollArea>
        </Card.Section>
      </Card>

      {/* Recent Activity */}
      <Card>
        <Card.Section p="md" pb="xs">
          <Title order={4}>Recent Activity</Title>
        </Card.Section>
        <Card.Section p="md" pt="xs">
          <ScrollArea h={200}>
            <Stack gap="xs">
              {data.recentActivity.slice(0, 10).map((activity) => (
                <Group key={activity.id} gap="sm">
                  <ThemeIcon size="sm" variant="light" color={
                    activity.type === "click" ? "blue" : 
                    activity.type === "view" ? "green" : "gray"
                  }>
                    {activity.type === "click" ? <IconClick size={12} /> : <IconEye size={12} />}
                  </ThemeIcon>
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Text size="sm">{activity.details}</Text>
                    <Text size="xs" c="dimmed">
                      {new Date(activity.timestamp).toLocaleString()}
                    </Text>
                  </Stack>
                </Group>
              ))}
            </Stack>
          </ScrollArea>
        </Card.Section>
      </Card>
    </Stack>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
  trend?: number;
}

function MetricCard({ title, value, icon: Icon, color, trend }: MetricCardProps) {
  return (
    <Card>
      <Group justify="space-between" mb="xs">
        <Text size="sm" c="dimmed">{title}</Text>
        <ThemeIcon size="sm" variant="light" color={color}>
          <Icon size={16} />
        </ThemeIcon>
      </Group>
      <Group align="end" gap="xs">
        <Text fw={700} size="xl">{value.toLocaleString()}</Text>
        {trend !== undefined && <TrendIndicator value={trend} />}
      </Group>
    </Card>
  );
}

// Trend Indicator Component
interface TrendIndicatorProps {
  value: number;
  size?: "xs" | "sm" | "md";
}

function TrendIndicator({ value, size = "sm" }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const iconSize = size === "xs" ? 12 : size === "sm" ? 14 : 16;

  if (isPositive) {
    return (
      <Tooltip label={`+${value.toFixed(1)}% increase`}>
        <Group gap={2}>
          <IconChevronUp size={iconSize} color="var(--mantine-color-green-6)" />
          <Text size={size} c="green" fw={500}>+{value.toFixed(1)}%</Text>
        </Group>
      </Tooltip>
    );
  }

  if (isNegative) {
    return (
      <Tooltip label={`${value.toFixed(1)}% decrease`}>
        <Group gap={2}>
          <IconChevronDown size={iconSize} color="var(--mantine-color-red-6)" />
          <Text size={size} c="red" fw={500}>{value.toFixed(1)}%</Text>
        </Group>
      </Tooltip>
    );
  }

  return (
    <Tooltip label="No change">
      <Group gap={2}>
        <IconMinus size={iconSize} color="var(--mantine-color-gray-6)" />
        <Text size={size} c="dimmed" fw={500}>0%</Text>
      </Group>
    </Tooltip>
  );
}