"use client";

import { Alert, Text, Group, ActionIcon, Tooltip } from "@mantine/core";
import { 
  IconCheck, 
  IconAlertCircle, 
  IconAlertTriangle, 
  IconInfoCircle,
  IconBulb
} from "@tabler/icons-react";
import type { ValidationResult } from "../../lib/utils/enhanced-validation";
import { getValidationColor } from "../../lib/utils/enhanced-validation";

interface ValidationFeedbackProps {
  result: ValidationResult;
  suggestion?: string;
  onApplySuggestion?: () => void;
  showIcon?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function ValidationFeedback({ 
  result, 
  suggestion, 
  onApplySuggestion,
  showIcon = true,
  size = 'sm'
}: ValidationFeedbackProps) {
  if (!result.message) return null;

  const getIcon = () => {
    switch (result.severity) {
      case 'error':
        return <IconAlertCircle size={16} />;
      case 'warning':
        return <IconAlertTriangle size={16} />;
      case 'info':
        return <IconInfoCircle size={16} />;
      case 'success':
        return <IconCheck size={16} />;
      default:
        return <IconInfoCircle size={16} />;
    }
  };

  const color = getValidationColor(result.severity);

  return (
    <Alert
      icon={showIcon ? getIcon() : undefined}
      color={color}
      variant="light"

      mt="xs"
    >
      <Group justify="space-between" align="center">
        <Text size={size} style={{ flex: 1 }}>
          {result.message}
        </Text>
        
        {(suggestion || result.suggestion) && onApplySuggestion && (
          <Tooltip label={`Apply suggestion: ${suggestion || result.suggestion}`}>
            <ActionIcon
              variant="subtle"
              size="sm"
              color={color}
              onClick={onApplySuggestion}
            >
              <IconBulb size={14} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
      
      {(suggestion || result.suggestion) && (
        <Text size="xs" c="dimmed" mt={4}>
          Suggestion: {suggestion || result.suggestion}
        </Text>
      )}
    </Alert>
  );
}

interface ValidationSummaryProps {
  errors: Record<string, ValidationResult>;
  warnings?: Record<string, ValidationResult>;
  infos?: Record<string, ValidationResult>;
}

export function ValidationSummary({ errors, warnings = {}, infos = {} }: ValidationSummaryProps) {
  const errorCount = Object.keys(errors).length;
  const warningCount = Object.keys(warnings).length;
  const infoCount = Object.keys(infos).length;

  if (errorCount === 0 && warningCount === 0 && infoCount === 0) {
    return null;
  }

  return (
    <Alert
      icon={<IconAlertCircle size={16} />}
      color={errorCount > 0 ? "red" : warningCount > 0 ? "orange" : "blue"}
      variant="light"
    >
      <Text size="sm" fw={500} mb={errorCount > 0 ? 8 : 0}>
        {errorCount > 0 && `${errorCount} error${errorCount === 1 ? '' : 's'} found`}
        {errorCount > 0 && warningCount > 0 && ', '}
        {warningCount > 0 && `${warningCount} warning${warningCount === 1 ? '' : 's'}`}
        {(errorCount > 0 || warningCount > 0) && infoCount > 0 && ', '}
        {infoCount > 0 && `${infoCount} suggestion${infoCount === 1 ? '' : 's'}`}
      </Text>
      
      {errorCount > 0 && (
        <div>
          {Object.entries(errors).map(([field, error]) => (
            <Text key={field} size="xs" c="red" mb={2}>
              • {field.charAt(0).toUpperCase() + field.slice(1)}: {error.message}
            </Text>
          ))}
        </div>
      )}
      
      {warningCount > 0 && (
        <div>
          {Object.entries(warnings).map(([field, warning]) => (
            <Text key={field} size="xs" c="orange" mb={2}>
              • {field.charAt(0).toUpperCase() + field.slice(1)}: {warning.message}
            </Text>
          ))}
        </div>
      )}
    </Alert>
  );
}