"use client";

import React, { useState } from 'react';
import {
  Box,
  Group,
  Avatar,
  Menu,
  ActionIcon,
  Text,
  Badge,
  Indicator,
  Breadcrumbs,
  Anchor,
  UnstyledButton,
  Stack,
  Divider,
  Switch,
  Tooltip,
  rem,
} from '@mantine/core';
import {
  IconBell,
  IconSettings,
  IconUser,
  IconLogout,
  IconSun,
  IconMoon,
  IconDeviceDesktop,
  IconChevronRight,
  IconHome,
  IconDashboard,
  IconCheck,
  IconX,
  IconInfoCircle,
} from '@tabler/icons-react';
import { signOut } from 'next-auth/react';
import { useTheme, useThemeValues } from '../../contexts/ThemeContext';
import type { Profile } from '../../../db/schema';

interface DashboardHeaderProps {
  profile: Profile;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Mock notifications for demonstration
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Link Added',
    message: 'Your new link has been successfully added to your profile.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false,
  },
  {
    id: '2',
    type: 'info',
    title: 'Profile Views',
    message: 'Your profile has been viewed 12 times today.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
  },
  {
    id: '3',
    type: 'success',
    title: 'Theme Updated',
    message: 'Your profile theme has been successfully updated.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
  },
];

export function DashboardHeader({ profile, onProfileClick, onSettingsClick }: DashboardHeaderProps) {
  const { mode, setMode } = useTheme();
  const { isDark } = useThemeValues();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const handleThemeChange = (newMode: 'light' | 'dark' | 'auto') => {
    setMode(newMode);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <IconCheck size={16} />;
      case 'error':
        return <IconX size={16} />;
      case 'warning':
        return <IconInfoCircle size={16} />;
      case 'info':
      default:
        return <IconInfoCircle size={16} />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'green';
      case 'error':
        return 'red';
      case 'warning':
        return 'yellow';
      case 'info':
      default:
        return 'blue';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const breadcrumbItems = [
    { title: 'Home', href: '/', icon: IconHome },
    { title: 'Dashboard', href: '/dashboard', icon: IconDashboard },
  ].map((item, index) => (
    <Anchor
      key={index}
      href={item.href}
      size="sm"
      c={isDark ? 'white' : 'white'}
      style={{
        textDecoration: 'none',
        opacity: 0.9,
        transition: 'opacity 150ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '0.9';
      }}
    >
      <Group gap={4}>
        <item.icon size={14} />
        {item.title}
      </Group>
    </Anchor>
  ));

  return (
    <Box
      style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'all 300ms ease',
      }}
    >
      <Box px="md" py="sm">
        <Group justify="space-between" align="center">
          {/* Left Section - Breadcrumbs */}
          <Box>
            <Breadcrumbs
              separator={<IconChevronRight size={14} color="rgba(255, 255, 255, 0.7)" />}
              separatorMargin="xs"
            >
              {breadcrumbItems}
            </Breadcrumbs>
          </Box>

          {/* Right Section - Actions */}
          <Group gap="sm">
            {/* Theme Toggle */}
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <Tooltip label="Change theme" position="bottom">
                  <ActionIcon
                    variant="subtle"
                    color="white"
                    size="lg"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      transition: 'all 150ms ease',
                    }}
                  >
                    {mode === 'dark' ? (
                      <IconMoon size={18} />
                    ) : mode === 'light' ? (
                      <IconSun size={18} />
                    ) : (
                      <IconDeviceDesktop size={18} />
                    )}
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Theme Mode</Menu.Label>
                <Menu.Item
                  leftSection={<IconSun size={16} />}
                  onClick={() => handleThemeChange('light')}
                  rightSection={mode === 'light' ? <IconCheck size={16} /> : null}
                >
                  Light
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconMoon size={16} />}
                  onClick={() => handleThemeChange('dark')}
                  rightSection={mode === 'dark' ? <IconCheck size={16} /> : null}
                >
                  Dark
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconDeviceDesktop size={16} />}
                  onClick={() => handleThemeChange('auto')}
                  rightSection={mode === 'auto' ? <IconCheck size={16} /> : null}
                >
                  System
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            {/* Notifications */}
            <Menu shadow="md" width={320} position="bottom-end">
              <Menu.Target>
                <Tooltip label="Notifications" position="bottom">
                  <Indicator
                    inline
                    label={unreadCount > 0 ? unreadCount : null}
                    size={16}
                    color="red"
                    disabled={unreadCount === 0}
                  >
                    <ActionIcon
                      variant="subtle"
                      color="white"
                      size="lg"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 150ms ease',
                      }}
                    >
                      <IconBell size={18} />
                    </ActionIcon>
                  </Indicator>
                </Tooltip>
              </Menu.Target>
              <Menu.Dropdown>
                <Group justify="space-between" p="xs">
                  <Text fw={600} size="sm">
                    Notifications
                  </Text>
                  {unreadCount > 0 && (
                    <UnstyledButton onClick={markAllAsRead}>
                      <Text size="xs" c="blue" td="underline">
                        Mark all as read
                      </Text>
                    </UnstyledButton>
                  )}
                </Group>
                <Divider />
                <Box style={{ maxHeight: rem(300), overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <Box p="md" ta="center">
                      <Text size="sm" c="dimmed">
                        No notifications
                      </Text>
                    </Box>
                  ) : (
                    notifications.map((notification) => (
                      <UnstyledButton
                        key={notification.id}
                        w="100%"
                        p="xs"
                        onClick={() => markNotificationAsRead(notification.id)}
                        style={{
                          backgroundColor: notification.read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                          borderLeft: notification.read ? 'none' : '3px solid #3b82f6',
                          transition: 'background-color 150ms ease',
                        }}
                      >
                        <Group gap="sm" align="flex-start">
                          <Badge
                            color={getNotificationColor(notification.type)}
                            variant="light"
                            size="sm"
                            leftSection={getNotificationIcon(notification.type)}
                          >
                            {notification.type}
                          </Badge>
                          <Stack gap={2} style={{ flex: 1 }}>
                            <Text size="sm" fw={notification.read ? 400 : 600}>
                              {notification.title}
                            </Text>
                            <Text size="xs" c="dimmed" lineClamp={2}>
                              {notification.message}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {formatTimestamp(notification.timestamp)}
                            </Text>
                          </Stack>
                        </Group>
                      </UnstyledButton>
                    ))
                  )}
                </Box>
              </Menu.Dropdown>
            </Menu>

            {/* User Menu */}
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton
                  style={{
                    padding: rem(4),
                    borderRadius: rem(8),
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 150ms ease',
                  }}
                >
                  <Group gap="sm">
                    <Avatar
                      src={profile.avatar_url}
                      alt={profile.display_name || profile.username}
                      size={32}
                      radius="md"
                    />
                    <Stack gap={0} style={{ display: 'none' }}>
                      <Text size="sm" fw={500} c="white" lineClamp={1}>
                        {profile.display_name || profile.username}
                      </Text>
                      <Text size="xs" c="rgba(255, 255, 255, 0.7)" lineClamp={1}>
                        @{profile.username}
                      </Text>
                    </Stack>
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>
                  <Stack gap={2}>
                    <Text size="sm" fw={500}>
                      {profile.display_name || profile.username}
                    </Text>
                    <Text size="xs" c="dimmed">
                      @{profile.username}
                    </Text>
                  </Stack>
                </Menu.Label>
                <Divider />
                <Menu.Item
                  leftSection={<IconUser size={16} />}
                  onClick={onProfileClick}
                >
                  Profile Settings
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconSettings size={16} />}
                  onClick={onSettingsClick}
                >
                  Dashboard Settings
                </Menu.Item>
                <Divider />
                <Menu.Item
                  leftSection={<IconLogout size={16} />}
                  color="red"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Box>
    </Box>
  );
}