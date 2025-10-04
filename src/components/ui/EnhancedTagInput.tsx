"use client";

import { useState, useRef, KeyboardEvent } from "react";
import {
  MultiSelect,
  Group,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
  Alert,
  Stack,
  Pill,
  Box,
  Kbd
} from "@mantine/core";
import {
  IconTag,
  IconX,
  IconPlus,
  IconInfoCircle,
  IconBulb,
  IconHash
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

interface EnhancedTagInputProps {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  description?: string;
  maxTags?: number;
  maxTagLength?: number;
  suggestions?: string[];
  popularTags?: string[];
  required?: boolean;
  disabled?: boolean;
  error?: string;
  allowCustomTags?: boolean;
}

const DEFAULT_POPULAR_TAGS = [
  'important', 'favorite', 'work', 'personal', 'urgent', 'daily',
  'weekly', 'monthly', 'project', 'client', 'team', 'reference',
  'social', 'business', 'entertainment', 'education', 'health',
  'travel', 'food', 'tech', 'news', 'shopping'
];

const TAG_COLORS = [
  'blue', 'green', 'red', 'orange', 'purple', 'pink', 'teal', 'cyan'
];

export function EnhancedTagInput({
  label = "Tags",
  value = [],
  onChange,
  placeholder = "Add tags to organize your links",
  description,
  maxTags = 10,
  maxTagLength = 30,
  suggestions = [],
  popularTags = DEFAULT_POPULAR_TAGS,
  required = false,
  disabled = false,
  error,
  allowCustomTags = true
}: EnhancedTagInputProps) {
  const [searchValue, setSearchValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Combine suggestions with popular tags
  const allSuggestions = [...new Set([...suggestions, ...popularTags])];

  const validateTag = (tag: string): string | null => {
    if (!tag || tag.trim().length === 0) {
      return 'Tag cannot be empty';
    }

    const trimmedTag = tag.trim();

    if (trimmedTag.length > maxTagLength) {
      return `Tag must be ${maxTagLength} characters or less`;
    }

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmedTag)) {
      return 'Tags can only contain letters, numbers, spaces, and hyphens';
    }

    if (value.some(existingTag => existingTag.toLowerCase() === trimmedTag.toLowerCase())) {
      return 'This tag already exists';
    }

    return null;
  };

  const handleTagAdd = (newTags: string[]) => {
    const lastTag = newTags[newTags.length - 1];
    
    if (lastTag && !value.includes(lastTag)) {
      const validationError = validateTag(lastTag);
      
      if (validationError) {
        notifications.show({
          title: 'Invalid Tag',
          message: validationError,
          color: 'red',
          icon: <IconX size={16} />
        });
        return;
      }

      if (value.length >= maxTags) {
        notifications.show({
          title: 'Too Many Tags',
          message: `Maximum ${maxTags} tags allowed`,
          color: 'orange',
          icon: <IconInfoCircle size={16} />
        });
        return;
      }

      onChange([...value, lastTag.trim()]);
      setSearchValue('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleQuickAdd = (tag: string) => {
    if (!value.includes(tag) && value.length < maxTags) {
      onChange([...value, tag]);
    }
  };

  const getTagColor = (tag: string): string => {
    // Generate consistent color based on tag name
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return TAG_COLORS[hash % TAG_COLORS.length];
  };

  const getTagSuggestions = (): string[] => {
    if (!searchValue) return allSuggestions.filter(tag => !value.includes(tag)).slice(0, 8);
    
    return allSuggestions
      .filter(tag => 
        tag.toLowerCase().includes(searchValue.toLowerCase()) && 
        !value.includes(tag)
      )
      .slice(0, 8);
  };

  return (
    <Stack gap="xs">
      <MultiSelect
        label={label}
        placeholder={placeholder}
        description={description}
        data={getTagSuggestions()}
        value={value}
        onChange={handleTagAdd}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchable
        searchable
        maxValues={maxTags}
        required={required}
        disabled={disabled}
        error={error}
        leftSection={<IconTag size={16} />}
        rightSection={
          <Group gap={4}>
            <Text size="xs" c="dimmed">
              {value.length}/{maxTags}
            </Text>
          </Group>
        }
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />

      {/* Current Tags Display */}
      {value.length > 0 && (
        <Box>
          <Text size="xs" c="dimmed" mb={4}>
            Current tags ({value.length}/{maxTags}):
          </Text>
          <Group gap="xs">
            {value.map((tag, index) => (
              <Pill
                key={index}
                withRemoveButton
                onRemove={() => handleTagRemove(tag)}
                size="sm"
                style={{
                  backgroundColor: `var(--mantine-color-${getTagColor(tag)}-1)`,
                  color: `var(--mantine-color-${getTagColor(tag)}-7)`,
                  border: `1px solid var(--mantine-color-${getTagColor(tag)}-3)`
                }}
              >
                <Group gap={4}>
                  <IconHash size={10} />
                  {tag}
                </Group>
              </Pill>
            ))}
          </Group>
        </Box>
      )}

      {/* Popular Tags Quick Add */}
      {value.length < maxTags && (
        <Box>
          <Group justify="space-between" align="center" mb="xs">
            <Text size="xs" fw={500} c="dimmed">
              Popular tags:
            </Text>
            <Tooltip label="Click to add popular tags quickly">
              <IconBulb size={12} color="var(--mantine-color-dimmed)" />
            </Tooltip>
          </Group>
          
          <Group gap="xs">
            {popularTags
              .filter(tag => !value.includes(tag))
              .slice(0, 6)
              .map((tag, index) => (
                <Badge
                  key={index}
                  variant="light"
                  size="sm"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleQuickAdd(tag)}
                  leftSection={<IconPlus size={10} />}
                >
                  {tag}
                </Badge>
              ))}
          </Group>
        </Box>
      )}

      {/* Help Text */}
      {value.length === 0 && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="blue"
          variant="light"
        >
          <Text size="xs">
            Tags help organize and filter your links. You can create custom tags or use popular ones.
            Press <Kbd size="xs">Enter</Kbd> or <Kbd size="xs">Tab</Kbd> to add tags quickly.
          </Text>
        </Alert>
      )}

      {/* Validation Feedback */}
      {value.length >= maxTags && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="orange"
          variant="light"
        >
          <Text size="xs">
            You've reached the maximum number of tags ({maxTags}). Remove some tags to add new ones.
          </Text>
        </Alert>
      )}

      {/* Tag Statistics */}
      {value.length > 0 && (
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            {value.length} tag{value.length === 1 ? '' : 's'} added
          </Text>
          {value.length > 5 && (
            <Text size="xs" c="orange">
              Many tags may make filtering less effective
            </Text>
          )}
        </Group>
      )}
    </Stack>
  );
}