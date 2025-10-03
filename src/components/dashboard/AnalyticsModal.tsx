"use client";

import React, { useState } from "react";
import {
  Modal,
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
  Tabs,
  Table,
  CopyButton,
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
  IconX,
  IconDownload,
  IconShare,
  IconCalendar,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconEye,
  IconClick,
  IconUsers,
  IconLink,
  IconWorld,
  IconExternalLink,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react";
import { useAnalytics, useAnalyticsPerformance } from "../../hooks/useAnalytics";
import type { AnalyticsData } from "../../../types/dashboard";

interface AnalyticsModalProps {
  opened: boolean;
  onClose: () => void;
  profileId: string;
}

export function AnalyticsModal({ opened, onClose, profileId }: AnalyticsModalProps) {
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate time range dates
  const timeRangeOptions = React.useMemo(() => {
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

  const exportData = () => {
    if (!data) return;
    
    const exportObj = {
      summary: {
        totalClicks: data.totalClicks,
        profileViews: data.profileViews,
        uniqueVisitors: data.uniqueVisitors,
        totalLinks: data.totalLinks,
      },
      topLinks: data.topLinks,
      clicksOverTime: data.clicksOverTime,
      topCountries: data.topCountries,
      recentActivity: data.recentActivity,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${profileId}-${timeRange}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <Group justify="space-between" style={{ width: '100%' }}>
          <Title order={3}>Detailed Analytics</Title>
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
            <Button
              variant="light"
              size="sm"
              leftSection={<IconDownload size={16} />}
              onClick={exportData}
              disabled={!data}
            >
              Export
            </Button>
          </Group>
        </Group>
      }
      styles={{
        header: { paddingBottom: 0 },
        body: { paddingTop: 'var(--mantine-spacing-md)' },
      }}
    >
      {isLoading ? (
        <Center h={400}>
          <Stack align="center" gap="sm">
            <Loader size="lg" />
            <Text c="dimmed">Loading detailed analytics...</Text>
          </Stack>
        </Center>
      ) : error || !data ? (
        <Center h={400}>
          <Stack align="center" gap="sm">
            <Text c="red">Failed to load analytics data</Text>
            <Button variant="light" onClick={refresh}>
              Retry
            </Button>
          </Stack>
        </Center>
      ) : (
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="links">Link Performance</Tabs.Tab>
            <Tabs.Tab value="geography">Geography</Tabs.Tab>
            <Tabs.Tab value="activity">Activity Log</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <Stack gap="md">
              {/* Key Metrics */}
              <Grid>
                <Grid.Col span={3}>
                  <Card>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="dimmed">Total Clicks</Text>
                      <ThemeIcon size="sm" variant="light" color="blue">
                        <IconClick size={16} />
                      </ThemeIcon>
                    </Group>
                    <Text fw={700} size="xl">{data.totalClicks.toLocaleString()}</Text>
                    {performance && (
                      <Group gap="xs" mt="xs">
                        <TrendIndicator value={performance.growthRate} size="xs" />
                      </Group>
                    )}
                  </Card>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Card>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="dimmed">Profile Views</Text>
                      <ThemeIcon size="sm" variant="light" color="green">
                        <IconEye size={16} />
                      </ThemeIcon>
                    </Group>
                    <Text fw={700} size="xl">{data.profileViews.toLocaleString()}</Text>
                  </Card>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Card>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="dimmed">Unique Visitors</Text>
                      <ThemeIcon size="sm" variant="light" color="orange">
                        <IconUsers size={16} />
                      </ThemeIcon>
                    </Group>
                    <Text fw={700} size="xl">{data.uniqueVisitors.toLocaleString()}</Text>
                  </Card>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Card>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="dimmed">Total Links</Text>
                      <ThemeIcon size="sm" variant="light" color="violet">
                        <IconLink size={16} />
                      </ThemeIcon>
                    </Group>
                    <Text fw={700} size="xl">{data.totalLinks}</Text>
                  </Card>
                </Grid.Col>
              </Grid>

              {/* Performance Metrics */}
              {performance && (
                <Card>
                  <Title order={4} mb="md">Performance Metrics</Title>
                  <Grid>
                    <Grid.Col span={6}>
                      <Stack gap="xs">
                        <Text size="sm" c="dimmed">Click-through Rate</Text>
                        <Group gap="xs">
                          <Text fw={600} size="lg">{performance.clickThroughRate.toFixed(1)}%</Text>
                          <Progress value={performance.clickThroughRate} size="sm" style={{ flex: 1 }} />
                        </Group>
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Stack gap="xs">
                        <Text size="sm" c="dimmed">Engagement Score</Text>
                        <Group gap="xs">
                          <Text fw={600} size="lg">{performance.engagementScore.toFixed(0)}/100</Text>
                          <Progress value={performance.engagementScore} size="sm" style={{ flex: 1 }} />
                        </Group>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Card>
              )}

              {/* Chart */}
              <Card>
                <Title order={4} mb="md">Clicks Over Time</Title>
                <ResponsiveContainer width="100%" height={300}>
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
                </ResponsiveContainer>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="links" pt="md">
            <Card>
              <Title order={4} mb="md">Link Performance</Title>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Rank</Table.Th>
                    <Table.Th>Link</Table.Th>
                    <Table.Th>Clicks</Table.Th>
                    <Table.Th>Click Rate</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {data.topLinks.map((link, index) => (
                    <Table.Tr key={link.linkId}>
                      <Table.Td>
                        <Badge size="sm" variant="light" color={
                          index === 0 ? "gold" : index === 1 ? "gray" : index === 2 ? "orange" : "blue"
                        }>
                          #{index + 1}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={2}>
                          <Text fw={500} size="sm" lineClamp={1}>{link.title}</Text>
                          <Text size="xs" c="dimmed" lineClamp={1}>{link.url}</Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={600}>{link.clicks.toLocaleString()}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text>{link.clickRate.toFixed(1)}%</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <CopyButton value={link.url}>
                            {({ copied, copy }) => (
                              <ActionIcon size="sm" variant="subtle" onClick={copy}>
                                {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                              </ActionIcon>
                            )}
                          </CopyButton>
                          <ActionIcon size="sm" variant="subtle" component="a" href={link.url} target="_blank">
                            <IconExternalLink size={12} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="geography" pt="md">
            <Grid>
              <Grid.Col span={8}>
                <Card>
                  <Title order={4} mb="md">Geographic Distribution</Title>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.topCountries.slice(0, 8)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ countryName, percentage }) => `${countryName} (${percentage.toFixed(1)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="clicks"
                      >
                        {data.topCountries.slice(0, 8).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Grid.Col>
              <Grid.Col span={4}>
                <Card>
                  <Title order={4} mb="md">Top Countries</Title>
                  <ScrollArea h={300}>
                    <Stack gap="sm">
                      {data.topCountries.map((country, index) => (
                        <Group key={country.countryCode} justify="space-between">
                          <Group gap="xs">
                            <Badge size="sm" variant="light">#{index + 1}</Badge>
                            <Stack gap={2}>
                              <Text size="sm" fw={500}>{country.countryName}</Text>
                              <Text size="xs" c="dimmed">{country.countryCode}</Text>
                            </Stack>
                          </Group>
                          <Stack gap={2} align="end">
                            <Text fw={600}>{country.clicks}</Text>
                            <Text size="xs" c="dimmed">{country.percentage.toFixed(1)}%</Text>
                          </Stack>
                        </Group>
                      ))}
                    </Stack>
                  </ScrollArea>
                </Card>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="activity" pt="md">
            <Card>
              <Title order={4} mb="md">Recent Activity</Title>
              <ScrollArea h={400}>
                <Stack gap="sm">
                  {data.recentActivity.map((activity) => (
                    <Group key={activity.id} gap="sm" p="sm" style={{
                      borderRadius: 8,
                      backgroundColor: 'var(--mantine-color-gray-0)',
                    }}>
                      <ThemeIcon size="sm" variant="light" color={
                        activity.type === "click" ? "blue" : 
                        activity.type === "view" ? "green" : "gray"
                      }>
                        {activity.type === "click" ? <IconClick size={12} /> : <IconEye size={12} />}
                      </ThemeIcon>
                      <Stack gap={2} style={{ flex: 1 }}>
                        <Text size="sm">{activity.details}</Text>
                        <Group gap="md">
                          <Text size="xs" c="dimmed">
                            {new Date(activity.timestamp).toLocaleString()}
                          </Text>
                          {activity.linkTitle && (
                            <Text size="xs" c="blue">{activity.linkTitle}</Text>
                          )}
                        </Group>
                      </Stack>
                    </Group>
                  ))}
                </Stack>
              </ScrollArea>
            </Card>
          </Tabs.Panel>
        </Tabs>
      )}
    </Modal>
  );
}

// Trend Indicator Component (reused from AnalyticsPanel)
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
          <IconTrendingUp size={iconSize} color="var(--mantine-color-green-6)" />
          <Text size={size} c="green" fw={500}>+{value.toFixed(1)}%</Text>
        </Group>
      </Tooltip>
    );
  }

  if (isNegative) {
    return (
      <Tooltip label={`${value.toFixed(1)}% decrease`}>
        <Group gap={2}>
          <IconTrendingDown size={iconSize} color="var(--mantine-color-red-6)" />
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