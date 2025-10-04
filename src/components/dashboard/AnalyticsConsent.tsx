"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Text,
  Group,
  Button,
  Stack,
  Switch,
  Divider,
  Alert,
  Loader,
} from "@mantine/core";
import {
  IconShield,
  IconInfoCircle,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { useAnalyticsConsent } from "../../hooks/useAnalytics";
import { privacyAnalytics } from "../../lib/utils/analytics-client";

interface AnalyticsConsentProps {
  profileId: string;
  onConsentChange?: (consent: boolean) => void;
}

export function AnalyticsConsent({ profileId, onConsentChange }: AnalyticsConsentProps) {
  const { consent, updateConsent, isLoading } = useAnalyticsConsent(profileId);
  const [localConsent, setLocalConsent] = useState<boolean | null>(null);

  useEffect(() => {
    if (consent !== null) {
      setLocalConsent(consent);
    }
  }, [consent]);

  const handleConsentChange = async (newConsent: boolean) => {
    try {
      await updateConsent(newConsent);
      setLocalConsent(newConsent);
      privacyAnalytics.setConsent(newConsent);
      onConsentChange?.(newConsent);
    } catch (error) {
      console.error("Failed to update consent:", error);
    }
  };

  if (consent === null && !isLoading) {
    return null; // Don't show if we can't determine consent status
  }

  return (
    <Card withBorder>
      <Stack gap="md">
        <Group gap="sm">
          <IconShield size={20} color="var(--mantine-color-blue-6)" />
          <Text fw={500}>Analytics & Privacy</Text>
        </Group>

        <Text size="sm" c="dimmed">
          Help us improve your experience by allowing us to collect anonymous usage statistics.
        </Text>

        <Group justify="space-between" align="center">
          <Text size="sm">Enable Analytics</Text>
          {isLoading ? (
            <Loader size="sm" />
          ) : (
            <Switch
              checked={localConsent || false}
              onChange={(event) => handleConsentChange(event.currentTarget.checked)}
              color="blue"
            />
          )}
        </Group>

        <Divider />

        <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
          <Text size="xs">
            We collect anonymous data about link clicks and profile views to help you understand your audience. 
            No personal information is stored, and you can disable this at any time.
          </Text>
        </Alert>

        {localConsent === false && (
          <Alert icon={<IconX size={16} />} color="orange" variant="light">
            <Text size="xs">
              Analytics are disabled. You won't see detailed statistics about your links and profile performance.
            </Text>
          </Alert>
        )}

        {localConsent === true && (
          <Alert icon={<IconCheck size={16} />} color="green" variant="light">
            <Text size="xs">
              Analytics are enabled. You'll see detailed insights about your link performance and audience.
            </Text>
          </Alert>
        )}

        <Group gap="xs" justify="flex-end">
          <Button
            variant="subtle"
            size="xs"
            onClick={() => window.open("/privacy", "_blank")}
          >
            Privacy Policy
          </Button>
          <Button
            variant="subtle"
            size="xs"
            onClick={() => window.open("/terms", "_blank")}
          >
            Terms of Service
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}