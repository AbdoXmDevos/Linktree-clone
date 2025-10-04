"use client";

import { useState } from "react";
import {
  ColorInput,
  Group,
  Text,
  ActionIcon,
  Tooltip,
  Box,
  Stack,
  Button,
  Popover,
  SimpleGrid,
  ColorSwatch,
  Alert
} from "@mantine/core";
import {
  IconPalette,
  IconRefresh,
  IconEye,
  IconCopy,
  IconCheck,
  IconInfoCircle
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

interface EnhancedColorPickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  swatches?: string[];
  showPreview?: boolean;
  previewText?: string;
  error?: string;
}

const DEFAULT_SWATCHES = [
  // Brand colors
  '#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A',
  // Accent colors
  '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6',
  // Success/Nature
  '#10B981', '#059669', '#047857', '#065F46',
  // Warning/Energy
  '#F59E0B', '#D97706', '#B45309', '#92400E',
  // Error/Attention
  '#EF4444', '#DC2626', '#B91C1C', '#991B1B',
  // Neutral
  '#6B7280', '#4B5563', '#374151', '#1F2937',
  // Light colors
  '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF',
  // Popular web colors
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

const POPULAR_COMBINATIONS = [
  { name: 'Ocean Blue', colors: ['#3B82F6', '#1E40AF'] },
  { name: 'Forest Green', colors: ['#10B981', '#047857'] },
  { name: 'Sunset Orange', colors: ['#F59E0B', '#B45309'] },
  { name: 'Royal Purple', colors: ['#8B5CF6', '#5B21B6'] },
  { name: 'Cherry Red', colors: ['#EF4444', '#991B1B'] },
  { name: 'Slate Gray', colors: ['#6B7280', '#1F2937'] }
];

export function EnhancedColorPicker({
  label,
  value = '',
  onChange,
  placeholder = 'Select a color',
  description,
  required = false,
  disabled = false,
  swatches = DEFAULT_SWATCHES,
  showPreview = true,
  previewText = 'Preview Text',
  error
}: EnhancedColorPickerProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleColorChange = (color: string) => {
    onChange(color);
  };

  const handleSwatchClick = (color: string) => {
    onChange(color);
    setIsPopoverOpen(false);
  };

  const handleCopyColor = async () => {
    if (value) {
      try {
        await navigator.clipboard.writeText(value);
        notifications.show({
          title: 'Color Copied',
          message: `${value} copied to clipboard`,
          color: 'green',
          icon: <IconCheck size={16} />
        });
      } catch (error) {
        notifications.show({
          title: 'Copy Failed',
          message: 'Failed to copy color to clipboard',
          color: 'red'
        });
      }
    }
  };

  const handleRandomColor = () => {
    const randomColor = swatches[Math.floor(Math.random() * swatches.length)];
    onChange(randomColor);
  };

  const isValidColor = (color: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="flex-end">
        <div style={{ flex: 1 }}>
          <ColorInput
            label={label}
            placeholder={placeholder}
            description={description}
            value={value}
            onChange={handleColorChange}
            required={required}
            disabled={disabled}
            error={error}
            swatches={swatches.slice(0, 14)} // Show first 14 swatches inline
            rightSection={
              <Group gap={4}>
                {value && isValidColor(value) && (
                  <Tooltip label="Copy color">
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={handleCopyColor}
                    >
                      <IconCopy size={14} />
                    </ActionIcon>
                  </Tooltip>
                )}
                
                <Tooltip label="Random color">
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    onClick={handleRandomColor}
                    disabled={disabled}
                  >
                    <IconRefresh size={14} />
                  </ActionIcon>
                </Tooltip>

                <Popover
                  opened={isPopoverOpen}
                  onChange={setIsPopoverOpen}
                  position="bottom-end"
                  withArrow
                  shadow="md"
                >
                  <Popover.Target>
                    <Tooltip label="More colors">
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                        disabled={disabled}
                      >
                        <IconPalette size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Popover.Target>

                  <Popover.Dropdown>
                    <Stack gap="md" style={{ width: 280 }}>
                      <div>
                        <Text size="sm" fw={500} mb="xs">
                          All Colors
                        </Text>
                        <SimpleGrid cols={8} spacing={4}>
                          {swatches.map((color, index) => (
                            <Tooltip key={index} label={color}>
                              <ColorSwatch
                                color={color}
                                size={24}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSwatchClick(color)}
                              />
                            </Tooltip>
                          ))}
                        </SimpleGrid>
                      </div>

                      <div>
                        <Text size="sm" fw={500} mb="xs">
                          Popular Combinations
                        </Text>
                        <Stack gap="xs">
                          {POPULAR_COMBINATIONS.map((combo, index) => (
                            <Group key={index} justify="space-between">
                              <Group gap="xs">
                                <Group gap={2}>
                                  {combo.colors.map((color, colorIndex) => (
                                    <ColorSwatch
                                      key={colorIndex}
                                      color={color}
                                      size={16}
                                    />
                                  ))}
                                </Group>
                                <Text size="xs">{combo.name}</Text>
                              </Group>
                              <Button
                                size="xs"
                                variant="subtle"
                                onClick={() => handleSwatchClick(combo.colors[0])}
                              >
                                Use
                              </Button>
                            </Group>
                          ))}
                        </Stack>
                      </div>
                    </Stack>
                  </Popover.Dropdown>
                </Popover>
              </Group>
            }
          />
        </div>
      </Group>

      {/* Color Preview */}
      {showPreview && value && isValidColor(value) && (
        <Box
          p="md"
          style={{
            backgroundColor: value,
            color: getContrastColor(value),
            borderRadius: 'var(--mantine-radius-sm)',
            border: '1px solid var(--mantine-color-gray-3)',
            textAlign: 'center'
          }}
        >
          <Text size="sm" fw={500}>
            {previewText}
          </Text>
          <Text size="xs" opacity={0.8}>
            {value.toUpperCase()}
          </Text>
        </Box>
      )}

      {/* Color Information */}
      {value && isValidColor(value) && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="blue"
          variant="light"
        >
          <Group justify="space-between">
            <div>
              <Text size="xs" fw={500}>
                Color: {value.toUpperCase()}
              </Text>
              <Text size="xs" c="dimmed">
                RGB: {hexToRgb(value)}
              </Text>
            </div>
            <Group gap="xs">
              <Tooltip label="Preview with white text">
                <Box
                  w={20}
                  h={20}
                  style={{
                    backgroundColor: value,
                    border: '1px solid var(--mantine-color-gray-4)',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Text size="xs" c="white" fw={700}>
                    A
                  </Text>
                </Box>
              </Tooltip>
              <Tooltip label="Preview with black text">
                <Box
                  w={20}
                  h={20}
                  style={{
                    backgroundColor: value,
                    border: '1px solid var(--mantine-color-gray-4)',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Text size="xs" c="black" fw={700}>
                    A
                  </Text>
                </Box>
              </Tooltip>
            </Group>
          </Group>
        </Alert>
      )}
    </Stack>
  );
}

// Utility functions
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `${r}, ${g}, ${b}`;
  }
  return 'Invalid';
}

function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff';
}