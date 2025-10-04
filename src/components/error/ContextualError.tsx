'use client';

import { Alert, Button, Group, Stack, Text, Anchor, Code } from '@mantine/core';
import { 
  IconAlertCircle, 
  IconWifi, 
  IconRefresh, 
  IconExternalLink,
  IconBug,
  IconShield,
  IconDatabase,
  IconClock,
} from '@tabler/icons-react';

export interface ErrorSolution {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  link?: {
    label: string;
    href: string;
  };
}

export interface ContextualErrorProps {
  error: Error | string;
  context?: string;
  solutions?: ErrorSolution[];
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
}

// Error type detection and solution mapping
function getErrorTypeAndSolutions(error: Error | string): {
  type: string;
  icon: React.ReactNode;
  color: string;
  solutions: ErrorSolution[];
} {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorLower = errorMessage.toLowerCase();

  // Network errors
  if (errorLower.includes('fetch') || errorLower.includes('network') || 
      errorLower.includes('connection') || errorLower.includes('timeout')) {
    return {
      type: 'Network Error',
      icon: <IconWifi size={16} />,
      color: 'orange',
      solutions: [
        {
          title: 'Check your internet connection',
          description: 'Make sure you\'re connected to the internet and try again.',
          action: {
            label: 'Retry',
            onClick: () => window.location.reload(),
          },
        },
        {
          title: 'Try refreshing the page',
          description: 'Sometimes a simple refresh can resolve connection issues.',
        },
        {
          title: 'Check if the service is down',
          description: 'The service might be temporarily unavailable.',
          link: {
            label: 'Check status',
            href: '/status',
          },
        },
      ],
    };
  }

  // Authentication errors
  if (errorLower.includes('unauthorized') || errorLower.includes('authentication') ||
      errorLower.includes('login') || errorLower.includes('session')) {
    return {
      type: 'Authentication Error',
      icon: <IconShield size={16} />,
      color: 'red',
      solutions: [
        {
          title: 'Sign in again',
          description: 'Your session may have expired. Please sign in again.',
          action: {
            label: 'Sign In',
            onClick: () => window.location.href = '/auth/signin',
          },
        },
        {
          title: 'Clear browser data',
          description: 'Try clearing your browser cookies and cache.',
        },
      ],
    };
  }

  // Database errors
  if (errorLower.includes('database') || errorLower.includes('sql') ||
      errorLower.includes('connection pool') || errorLower.includes('query')) {
    return {
      type: 'Database Error',
      icon: <IconDatabase size={16} />,
      color: 'red',
      solutions: [
        {
          title: 'Try again in a moment',
          description: 'The database might be temporarily busy. Please wait a moment and try again.',
          action: {
            label: 'Retry',
            onClick: () => window.location.reload(),
          },
        },
        {
          title: 'Contact support',
          description: 'If the problem persists, please contact our support team.',
          link: {
            label: 'Contact Support',
            href: '/support',
          },
        },
      ],
    };
  }

  // Validation errors
  if (errorLower.includes('validation') || errorLower.includes('invalid') ||
      errorLower.includes('required') || errorLower.includes('format')) {
    return {
      type: 'Validation Error',
      icon: <IconAlertCircle size={16} />,
      color: 'yellow',
      solutions: [
        {
          title: 'Check your input',
          description: 'Please review the form fields and make sure all required information is provided correctly.',
        },
        {
          title: 'Follow the format requirements',
          description: 'Make sure your input follows the specified format (e.g., valid email, URL, etc.).',
        },
      ],
    };
  }

  // Rate limiting errors
  if (errorLower.includes('rate limit') || errorLower.includes('too many requests') ||
      errorLower.includes('429')) {
    return {
      type: 'Rate Limit Error',
      icon: <IconClock size={16} />,
      color: 'orange',
      solutions: [
        {
          title: 'Wait a moment',
          description: 'You\'ve made too many requests. Please wait a moment before trying again.',
        },
        {
          title: 'Slow down your actions',
          description: 'Try performing actions more slowly to avoid hitting rate limits.',
        },
      ],
    };
  }

  // Generic error
  return {
    type: 'Error',
    icon: <IconBug size={16} />,
    color: 'red',
    solutions: [
      {
        title: 'Try refreshing the page',
        description: 'A simple refresh might resolve the issue.',
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload(),
        },
      },
      {
        title: 'Contact support',
        description: 'If the problem continues, please let us know.',
        link: {
          label: 'Report Issue',
          href: '/support',
        },
      },
    ],
  };
}

export function ContextualError({
  error,
  context,
  solutions: customSolutions,
  onRetry,
  onDismiss,
  showDetails = false,
}: ContextualErrorProps) {
  const { type, icon, color, solutions: defaultSolutions } = getErrorTypeAndSolutions(error);
  const solutions = customSolutions || defaultSolutions;
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <Alert
      icon={icon}
      title={type}
      color={color}
      variant="light"
      withCloseButton={!!onDismiss}
      onClose={onDismiss}
    >
      <Stack gap="sm">
        {context && (
          <Text size="sm" c="dimmed">
            {context}
          </Text>
        )}

        <Text size="sm">
          {errorMessage}
        </Text>

        {showDetails && typeof error === 'object' && error.stack && (
          <details>
            <summary style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
              Technical Details
            </summary>
            <Code block mt="xs" style={{ fontSize: '0.75rem' }}>
              {error.stack}
            </Code>
          </details>
        )}

        {solutions.length > 0 && (
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              What you can do:
            </Text>
            {solutions.map((solution, index) => (
              <div key={index}>
                <Group gap="xs" align="flex-start">
                  <Text size="sm" fw={500} style={{ minWidth: 'fit-content' }}>
                    {index + 1}.
                  </Text>
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>
                      {solution.title}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {solution.description}
                    </Text>
                    {(solution.action || solution.link) && (
                      <Group gap="xs">
                        {solution.action && (
                          <Button
                            size="xs"
                            variant="light"
                            onClick={solution.action.onClick}
                          >
                            {solution.action.label}
                          </Button>
                        )}
                        {solution.link && (
                          <Anchor
                            href={solution.link.href}
                            size="sm"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Group gap={4}>
                              {solution.link.label}
                              <IconExternalLink size={12} />
                            </Group>
                          </Anchor>
                        )}
                      </Group>
                    )}
                  </Stack>
                </Group>
              </div>
            ))}
          </Stack>
        )}

        {onRetry && (
          <Group justify="flex-end" mt="sm">
            <Button
              size="sm"
              variant="light"
              leftSection={<IconRefresh size={14} />}
              onClick={onRetry}
            >
              Try Again
            </Button>
          </Group>
        )}
      </Stack>
    </Alert>
  );
}

// Hook for showing contextual errors
export function useContextualError() {
  const showError = (
    error: Error | string,
    context?: string,
    solutions?: ErrorSolution[]
  ) => {
    // This could integrate with a notification system or modal
    console.error('Contextual error:', { error, context, solutions });
  };

  return { showError };
}