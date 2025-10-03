"use client";

import { Group, ActionIcon, Tooltip, Text, Card, Select, Button, Loader } from "@mantine/core";
import { IconTrash, IconTag, IconX, IconCheck } from "@tabler/icons-react";
import { useState } from "react";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkCategorize: (category: string) => void;
  isLoading?: boolean;
  categories?: string[];
}

export function BulkActionsToolbar({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkCategorize,
  isLoading = false,
  categories = []
}: BulkActionsToolbarProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleCategorize = () => {
    if (selectedCategory) {
      onBulkCategorize(selectedCategory);
      setSelectedCategory("");
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <Card
      padding="md"
      radius="sm"
      withBorder
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        backgroundColor: "#f8f9fa",
        borderColor: "#495057",
      }}
    >
      <Group justify="space-between" align="center">
        <Group gap="sm">
          <Text size="sm" fw={500} c="dark.7">
            {selectedCount} link{selectedCount !== 1 ? 's' : ''} selected
          </Text>
          
          {isLoading && <Loader size="xs" />}
        </Group>

        <Group gap="xs">
          {/* Category Selection */}
          <Group gap="xs">
            <Select
              placeholder="Set category"
              data={[
                { value: "social", label: "Social" },
                { value: "work", label: "Work" },
                { value: "personal", label: "Personal" },
                { value: "portfolio", label: "Portfolio" },
                { value: "other", label: "Other" },
                ...categories.map(cat => ({ value: cat, label: cat }))
              ]}
              value={selectedCategory}
              onChange={(value) => setSelectedCategory(value || "")}
              size="xs"
              style={{ width: 120 }}
              disabled={isLoading}
            />
            <Tooltip label="Apply category to selected links">
              <ActionIcon
                variant="light"
                color="blue"
                size="sm"
                onClick={handleCategorize}
                disabled={!selectedCategory || isLoading}
              >
                <IconTag size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>

          {/* Bulk Delete */}
          <Tooltip label="Delete selected links">
            <ActionIcon
              variant="light"
              color="red"
              size="sm"
              onClick={onBulkDelete}
              disabled={isLoading}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Tooltip>

          {/* Clear Selection */}
          <Tooltip label="Clear selection">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={onClearSelection}
              disabled={isLoading}
            >
              <IconX size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Card>
  );
}