'use client';

import { notifications } from '@mantine/notifications';
import { Button, Group, Text } from '@mantine/core';
import { IconCheck, IconUndo, IconX } from '@tabler/icons-react';
import { useCallback, useRef } from 'react';

export interface UndoableAction {
  id: string;
  title: string;
  message: string;
  undoAction: () => Promise<void> | void;
  undoLabel?: string;
  autoCloseDelay?: number;
  onUndo?: () => void;
  onExpire?: () => void;
}

class UndoableNotificationManager {
  private activeActions = new Map<string, UndoableAction>();
  private timeouts = new Map<string, NodeJS.Timeout>();

  show(action: UndoableAction) {
    const {
      id,
      title,
      message,
      undoAction,
      undoLabel = 'Undo',
      autoCloseDelay = 5000,
      onUndo,
      onExpire,
    } = action;

    // Store the action
    this.activeActions.set(id, action);

    // Clear any existing timeout for this action
    const existingTimeout = this.timeouts.get(id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const handleUndo = async () => {
      try {
        await undoAction();
        onUndo?.();
        notifications.show({
          title: 'Action Undone',
          message: `${title} has been undone`,
          color: 'blue',
          icon: <IconUndo size={16} />,
          autoClose: 3000,
        });
      } catch (error) {
        console.error('Failed to undo action:', error);
        notifications.show({
          title: 'Undo Failed',
          message: 'Could not undo the action. Please try manually.',
          color: 'red',
          icon: <IconX size={16} />,
          autoClose: 4000,
        });
      } finally {
        this.cleanup(id);
      }
    };

    const handleExpire = () => {
      onExpire?.();
      this.cleanup(id);
    };

    // Show the notification
    notifications.show({
      id,
      title,
      message: (
        <Group justify="space-between" align="center" style={{ width: '100%' }}>
          <Text size="sm">{message}</Text>
          <Button
            size="xs"
            variant="subtle"
            leftSection={<IconUndo size={14} />}
            onClick={handleUndo}
          >
            {undoLabel}
          </Button>
        </Group>
      ),
      color: 'green',
      icon: <IconCheck size={16} />,
      autoClose: false,
      withCloseButton: true,
      onClose: handleExpire,
    });

    // Set auto-expire timeout
    const timeout = setTimeout(() => {
      notifications.hide(id);
      handleExpire();
    }, autoCloseDelay);

    this.timeouts.set(id, timeout);
  }

  hide(id: string) {
    notifications.hide(id);
    this.cleanup(id);
  }

  private cleanup(id: string) {
    this.activeActions.delete(id);
    const timeout = this.timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }
  }

  // Clean up all active notifications
  clear() {
    for (const [id] of this.activeActions) {
      this.hide(id);
    }
  }
}

// Global instance
const undoableNotificationManager = new UndoableNotificationManager();

// Hook for using undoable notifications
export function useUndoableNotifications() {
  const showUndoable = useCallback((action: Omit<UndoableAction, 'id'>) => {
    const id = `undoable-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    undoableNotificationManager.show({ ...action, id });
    return id;
  }, []);

  const hideUndoable = useCallback((id: string) => {
    undoableNotificationManager.hide(id);
  }, []);

  const clearAllUndoable = useCallback(() => {
    undoableNotificationManager.clear();
  }, []);

  return {
    showUndoable,
    hideUndoable,
    clearAllUndoable,
  };
}

// Convenience functions for common operations
export const undoableNotifications = {
  // Link operations
  linkDeleted: (
    linkTitle: string,
    restoreAction: () => Promise<void>,
    onUndo?: () => void
  ) => {
    return undoableNotificationManager.show({
      id: `link-deleted-${Date.now()}`,
      title: 'Link Deleted',
      message: `"${linkTitle}" has been deleted`,
      undoAction: restoreAction,
      undoLabel: 'Restore',
      onUndo,
    });
  },

  linkUpdated: (
    linkTitle: string,
    revertAction: () => Promise<void>,
    onUndo?: () => void
  ) => {
    return undoableNotificationManager.show({
      id: `link-updated-${Date.now()}`,
      title: 'Link Updated',
      message: `"${linkTitle}" has been updated`,
      undoAction: revertAction,
      onUndo,
    });
  },

  linksReordered: (
    count: number,
    revertAction: () => Promise<void>,
    onUndo?: () => void
  ) => {
    return undoableNotificationManager.show({
      id: `links-reordered-${Date.now()}`,
      title: 'Links Reordered',
      message: `${count} links have been reordered`,
      undoAction: revertAction,
      onUndo,
    });
  },

  bulkOperation: (
    operation: string,
    count: number,
    revertAction: () => Promise<void>,
    onUndo?: () => void
  ) => {
    return undoableNotificationManager.show({
      id: `bulk-${operation}-${Date.now()}`,
      title: `Bulk ${operation}`,
      message: `${count} links have been ${operation.toLowerCase()}`,
      undoAction: revertAction,
      onUndo,
    });
  },

  // Profile operations
  profileUpdated: (
    revertAction: () => Promise<void>,
    onUndo?: () => void
  ) => {
    return undoableNotificationManager.show({
      id: `profile-updated-${Date.now()}`,
      title: 'Profile Updated',
      message: 'Your profile has been updated',
      undoAction: revertAction,
      onUndo,
    });
  },

  // Theme operations
  themeChanged: (
    themeName: string,
    revertAction: () => Promise<void>,
    onUndo?: () => void
  ) => {
    return undoableNotificationManager.show({
      id: `theme-changed-${Date.now()}`,
      title: 'Theme Changed',
      message: `Theme changed to ${themeName}`,
      undoAction: revertAction,
      onUndo,
      autoCloseDelay: 3000, // Shorter delay for theme changes
    });
  },
};

export default undoableNotificationManager;