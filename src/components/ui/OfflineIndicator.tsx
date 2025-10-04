'use client';

import { Badge, Button, Group, Indicator, Text, Tooltip, ActionIcon } from '@mantine/core';
import { IconWifiOff, IconWifi, IconClock, IconRefresh } from '@tabler/icons-react';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';

interface OfflineIndicatorProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showQueueCount?: boolean;
  compact?: boolean;
}

export function OfflineIndicator({ 
  position = 'top-right',
  showQueueCount = true,
  compact = false,
}: OfflineIndicatorProps) {
  const {
    isOnline,
    queuedOperations,
    isProcessing,
    lastSyncTime,
    syncNow,
  } = useOfflineQueue();

  if (isOnline && queuedOperations.length === 0) {
    return null; // Don't show anything when online and no queued operations
  }

  const positionStyles = {
    'top-right': { top: 16, right: 16 },
    'top-left': { top: 16, left: 16 },
    'bottom-right': { bottom: 16, right: 16 },
    'bottom-left': { bottom: 16, left: 16 },
  };

  const getStatusColor = () => {
    if (!isOnline) return 'orange';
    if (queuedOperations.length > 0) return 'blue';
    return 'green';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isProcessing) return 'Syncing...';
    if (queuedOperations.length > 0) return `${queuedOperations.length} pending`;
    return 'Online';
  };

  const getTooltipText = () => {
    if (!isOnline) {
      return queuedOperations.length > 0
        ? `Offline - ${queuedOperations.length} changes will sync when back online`
        : 'Offline - Changes will be saved locally';
    }
    if (isProcessing) {
      return 'Syncing pending changes...';
    }
    if (queuedOperations.length > 0) {
      return `${queuedOperations.length} changes waiting to sync`;
    }
    return lastSyncTime 
      ? `Online - Last synced ${lastSyncTime.toLocaleTimeString()}`
      : 'Online';
  };

  if (compact) {
    return (
      <div
        style={{
          position: 'fixed',
          ...positionStyles[position],
          zIndex: 1000,
        }}
      >
        <Tooltip label={getTooltipText()}>
          <Indicator
            color={getStatusColor()}
            size={12}
            processing={isProcessing}
            disabled={isOnline && queuedOperations.length === 0}
          >
            <ActionIcon
              variant="subtle"
              size="sm"
              color={getStatusColor()}
              onClick={queuedOperations.length > 0 ? syncNow : undefined}
              style={{ cursor: queuedOperations.length > 0 ? 'pointer' : 'default' }}
            >
              {isOnline ? <IconWifi size={16} /> : <IconWifiOff size={16} />}
            </ActionIcon>
          </Indicator>
        </Tooltip>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: 1000,
      }}
    >
      <Badge
        color={getStatusColor()}
        variant="filled"
        size="lg"
        leftSection={
          isProcessing ? (
            <IconRefresh size={14} style={{ animation: 'spin 1s linear infinite' }} />
          ) : isOnline ? (
            <IconWifi size={14} />
          ) : (
            <IconWifiOff size={14} />
          )
        }
        rightSection={
          showQueueCount && queuedOperations.length > 0 ? (
            <Group gap={4}>
              <IconClock size={12} />
              <Text size="xs">{queuedOperations.length}</Text>
            </Group>
          ) : undefined
        }
        style={{
          cursor: queuedOperations.length > 0 ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
        }}
        onClick={queuedOperations.length > 0 ? syncNow : undefined}
      >
        <Tooltip label={getTooltipText()}>
          <Text size="sm" fw={500}>
            {getStatusText()}
          </Text>
        </Tooltip>
      </Badge>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Queue status component for detailed view
export function QueueStatus() {
  const {
    isOnline,
    queuedOperations,
    isProcessing,
    lastSyncTime,
    syncNow,
    clearQueue,
  } = useOfflineQueue();

  if (queuedOperations.length === 0) {
    return null;
  }

  return (
    <div style={{ padding: 16, borderTop: '1px solid var(--mantine-color-gray-3)' }}>
      <Group justify="space-between" mb="sm">
        <Text size="sm" fw={500}>
          Pending Changes ({queuedOperations.length})
        </Text>
        <Group gap="xs">
          {isOnline && (
            <Button
              size="xs"
              variant="light"
              leftSection={<IconRefresh size={12} />}
              onClick={syncNow}
              loading={isProcessing}
            >
              Sync Now
            </Button>
          )}
          <Button
            size="xs"
            variant="subtle"
            color="red"
            onClick={clearQueue}
          >
            Clear
          </Button>
        </Group>
      </Group>

      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
        {queuedOperations.map((operation) => (
          <Group key={operation.id} justify="space-between" py={4}>
            <Text size="xs" c="dimmed">
              {operation.description}
            </Text>
            <Badge size="xs" color="blue" variant="light">
              {operation.retryCount > 0 ? `Retry ${operation.retryCount}` : 'Pending'}
            </Badge>
          </Group>
        ))}
      </div>

      {lastSyncTime && (
        <Text size="xs" c="dimmed" mt="sm">
          Last synced: {lastSyncTime.toLocaleString()}
        </Text>
      )}
    </div>
  );
}