'use client';

import React, { Component, ReactNode } from 'react';
import { Alert, Button, Card, Container, Group, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle, IconRefresh, IconBug, IconHome } from '@tabler/icons-react';

interface ErrorInfo {
  componentStack: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'page' | 'component' | 'critical';
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // This would typically send to an error reporting service like Sentry
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId,
    };

    // Example: Send to error reporting service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport),
    // });

    console.error('Error reported:', errorReport);
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      const { fallback, showDetails = false, level = 'component' } = this.props;
      const { error, errorInfo, errorId } = this.state;

      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Different UI based on error level
      if (level === 'critical') {
        return (
          <Container size="sm" py="xl">
            <Card withBorder p="xl" radius="md">
              <Stack align="center" gap="lg">
                <IconAlertTriangle size={64} color="red" />
                <Title order={2} ta="center">
                  Something went wrong
                </Title>
                <Text ta="center" c="dimmed">
                  We encountered an unexpected error. Our team has been notified.
                </Text>
                
                {showDetails && error && (
                  <Alert
                    icon={<IconBug size={16} />}
                    title="Error Details"
                    color="red"
                    variant="light"
                    style={{ width: '100%' }}
                  >
                    <Text size="sm" ff="monospace">
                      {error.message}
                    </Text>
                    {process.env.NODE_ENV === 'development' && errorInfo && (
                      <details style={{ marginTop: 8 }}>
                        <summary style={{ cursor: 'pointer' }}>
                          Component Stack
                        </summary>
                        <Text size="xs" ff="monospace" mt="xs">
                          {errorInfo.componentStack}
                        </Text>
                      </details>
                    )}
                  </Alert>
                )}

                <Group>
                  <Button
                    leftSection={<IconRefresh size={16} />}
                    onClick={this.handleRetry}
                    variant="light"
                  >
                    Try Again
                  </Button>
                  <Button
                    leftSection={<IconHome size={16} />}
                    onClick={this.handleGoHome}
                  >
                    Go to Dashboard
                  </Button>
                </Group>

                {errorId && (
                  <Text size="xs" c="dimmed">
                    Error ID: {errorId}
                  </Text>
                )}
              </Stack>
            </Card>
          </Container>
        );
      }

      if (level === 'page') {
        return (
          <Alert
            icon={<IconAlertTriangle size={16} />}
            title="Page Error"
            color="red"
            variant="light"
            style={{ margin: 16 }}
          >
            <Stack gap="sm">
              <Text size="sm">
                This page encountered an error and couldn't load properly.
              </Text>
              
              {showDetails && error && (
                <Text size="xs" ff="monospace" c="dimmed">
                  {error.message}
                </Text>
              )}

              <Group gap="xs">
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconRefresh size={14} />}
                  onClick={this.handleRetry}
                >
                  Retry
                </Button>
                <Button
                  size="xs"
                  variant="subtle"
                  onClick={this.handleReload}
                >
                  Reload Page
                </Button>
              </Group>
            </Stack>
          </Alert>
        );
      }

      // Component level error (default)
      return (
        <Alert
          icon={<IconAlertTriangle size={16} />}
          title="Component Error"
          color="orange"
          variant="light"
          style={{ margin: 8 }}
        >
          <Group justify="space-between" align="flex-start">
            <Text size="sm">
              A component failed to render properly.
            </Text>
            <Button
              size="xs"
              variant="subtle"
              leftSection={<IconRefresh size={14} />}
              onClick={this.handleRetry}
            >
              Retry
            </Button>
          </Group>
        </Alert>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for programmatic error handling
export function useErrorHandler() {
  return (error: Error, errorInfo?: string) => {
    // This will trigger the nearest error boundary
    throw error;
  };
}