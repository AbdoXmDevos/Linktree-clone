'use client';

import { Box, Progress, Text, ActionIcon, Notification } from '@mantine/core';
import { IconX, IconCheck } from '@tabler/icons-react';
import { useNonBlockingLoading } from '@/hooks/useNonBlockingLoading';
import { useEffect, useState } from 'react';

interface NonBlockingLoaderProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxVisible?: number;
}

export function NonBlockingLoader({ 
  position = 'top-right', 
  maxVisible = 3 
}: NonBlockingLoaderProps) {
  const { getAllLoadingStates, cancelLoading } = useNonBlockingLoading();
  const [loadingStates, setLoadingStates] = useState(getAllLoadingStates());

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStates(getAllLoadingStates());
    }, 100);

    return () => clearInterval(interval);
  }, [getAllLoadingStates]);

  const activeStates = Object.entries(loadingStates).slice(0, maxVisible);

  if (activeStates.length === 0) {
    return null;
  }

  const positionStyles = {
    'top-right': { top: 16, right: 16 },
    'top-left': { top: 16, left: 16 },
    'bottom-right': { bottom: 16, right: 16 },
    'bottom-left': { bottom: 16, left: 16 },
  };

  return (
    <Box
      style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 320,
      }}
    >
      {activeStates.map(([key, state]) => (
        <Notification
          key={key}
          icon={state.progress === 100 ? <IconCheck size={16} /> : undefined}
          color={state.progress === 100 ? 'green' : 'blue'}
          title={state.message}
          onClose={state.canCancel ? () => cancelLoading(key) : undefined}
          closeButtonProps={{
            icon: <IconX size={16} />,
            'aria-label': 'Cancel operation',
          }}
          styles={{
            root: {
              backgroundColor: 'var(--mantine-color-body)',
              border: '1px solid var(--mantine-color-gray-3)',
              boxShadow: 'var(--mantine-shadow-lg)',
            },
          }}
        >
          {state.progress !== undefined && (
            <Box mt={8}>
              <Progress 
                value={state.progress} 
                size="sm" 
                animated={state.progress < 100}
                color={state.progress === 100 ? 'green' : 'blue'}
              />
              <Text size="xs" c="dimmed" mt={4}>
                {Math.round(state.progress)}% complete
              </Text>
            </Box>
          )}
        </Notification>
      ))}
    </Box>
  );
}

// Compact version for inline use
export function InlineLoader({ 
  loadingKey, 
  showProgress = true 
}: { 
  loadingKey: string; 
  showProgress?: boolean; 
}) {
  const { getLoadingState } = useNonBlockingLoading();
  const state = getLoadingState(loadingKey);

  if (!state?.isLoading) {
    return null;
  }

  return (
    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <Text size="sm" c="dimmed">
        {state.message}
      </Text>
      {showProgress && state.progress !== undefined && (
        <Box style={{ minWidth: 60 }}>
          <Progress 
            value={state.progress} 
            size="xs" 
            animated={state.progress < 100}
          />
        </Box>
      )}
    </Box>
  );
}