"use client";

import { useState } from "react";
import { 
  ActionIcon, 
  Tooltip, 
  Group, 
  Menu, 
  Badge, 
  Stack, 
  Text,
  Button,
  Modal,
  Select,
  ColorInput
} from "@mantine/core";
import { 
  IconBolt, 
  IconTrash, 
  IconStar, 
  IconCategory, 
  IconPalette,
  IconArrowsSort,
  IconDownload,
  IconUpload
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, shadows } from "../../styles/design-tokens";
import { notifications } from "@mantine/notifications";
import type { Link } from "../../../types/dashboard";

interface QuickActionsProps {
  selectedLinks: string[];
  links: Link[];
  onBulkDelete: (linkIds: string[]) => void;
  onBulkToggleFeatured: (linkIds: string[]) => void;
  onBulkCategorize: (linkIds: string[], category: string) => void;
  onBulkStyle: (linkIds: string[], style: any) => void;
  onBulkReorder: (linkIds: string[], direction: 'up' | 'down') => void;
  onExportLinks: (linkIds: string[]) => void;
  onClearSelection: () => void;
}

export function QuickActions({
  selectedLinks,
  links,
  onBulkDelete,
  onBulkToggleFeatured,
  onBulkCategorize,
  onBulkStyle,
  onBulkReorder,
  onExportLinks,
  onClearSelection,
}: QuickActionsProps) {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [bulkStyle, setBulkStyle] = useState({
    backgroundColor: colors.neutral[50],
    textColor: colors.neutral[900],
  });

  if (selectedLinks.length === 0) {
    return null;
  }

  const selectedLinksData = links.filter(link => selectedLinks.includes(link.id));
  const featuredCount = selectedLinksData.filter(link => link.is_featured).length;

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedLinks.length} selected links?`)) {
      onBulkDelete(selectedLinks);
      onClearSelection();
      notifications.show({
        title: "Success",
        message: `${selectedLinks.length} links deleted`,
        color: "green",
      });
    }
  };

  const handleBulkToggleFeatured = () => {
    onBulkToggleFeatured(selectedLinks);
    onClearSelection();
    notifications.show({
      title: "Success",
      message: `${selectedLinks.length} links updated`,
      color: "green",
    });
  };

  const handleBulkCategorize = () => {
    if (!newCategory.trim()) return;
    onBulkCategorize(selectedLinks, newCategory);
    onClearSelection();
    setShowCategoryModal(false);
    setNewCategory("");
    notifications.show({
      title: "Success",
      message: `${selectedLinks.length} links categorized`,
      color: "green",
    });
  };

  const handleBulkStyle = () => {
    onBulkStyle(selectedLinks, bulkStyle);
    onClearSelection();
    setShowStyleModal(false);
    notifications.show({
      title: "Success",
      message: `${selectedLinks.length} links styled`,
      color: "green",
    });
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            position: "fixed",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            background: colors.gradients.glass,
            backdropFilter: "blur(20px)",
            border: `1px solid ${colors.neutral[200]}`,
            borderRadius: "16px",
            padding: "12px 16px",
            boxShadow: shadows.xl,
          }}
        >
          <Group gap="sm" align="center">
            <Badge variant="light" color="primary" size="lg">
              {selectedLinks.length} selected
            </Badge>

            <Group gap="xs">
              {/* Toggle Featured */}
              <Tooltip 
                label={featuredCount > 0 ? "Remove from Featured" : "Add to Featured"}
                position="top"
              >
                <ActionIcon
                  variant="light"
                  color={featuredCount > 0 ? "yellow" : "gray"}
                  size="lg"
                  radius="md"
                  onClick={handleBulkToggleFeatured}
                >
                  <IconStar size={18} />
                </ActionIcon>
              </Tooltip>

              {/* Categorize */}
              <Tooltip label="Categorize" position="top">
                <ActionIcon
                  variant="light"
                  color="blue"
                  size="lg"
                  radius="md"
                  onClick={() => setShowCategoryModal(true)}
                >
                  <IconCategory size={18} />
                </ActionIcon>
              </Tooltip>

              {/* Style */}
              <Tooltip label="Apply Style" position="top">
                <ActionIcon
                  variant="light"
                  color="purple"
                  size="lg"
                  radius="md"
                  onClick={() => setShowStyleModal(true)}
                >
                  <IconPalette size={18} />
                </ActionIcon>
              </Tooltip>

              {/* Reorder */}
              <Menu shadow="md" width={150}>
                <Menu.Target>
                  <Tooltip label="Reorder" position="top">
                    <ActionIcon
                      variant="light"
                      color="gray"
                      size="lg"
                      radius="md"
                    >
                      <IconArrowsSort size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconArrowsSort size={16} />}
                    onClick={() => {
                      onBulkReorder(selectedLinks, 'up');
                      onClearSelection();
                    }}
                  >
                    Move Up
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconArrowsSort size={16} />}
                    onClick={() => {
                      onBulkReorder(selectedLinks, 'down');
                      onClearSelection();
                    }}
                  >
                    Move Down
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>

              {/* Export */}
              <Tooltip label="Export" position="top">
                <ActionIcon
                  variant="light"
                  color="green"
                  size="lg"
                  radius="md"
                  onClick={() => {
                    onExportLinks(selectedLinks);
                    onClearSelection();
                  }}
                >
                  <IconDownload size={18} />
                </ActionIcon>
              </Tooltip>

              {/* Delete */}
              <Tooltip label="Delete" position="top">
                <ActionIcon
                  variant="light"
                  color="red"
                  size="lg"
                  radius="md"
                  onClick={handleBulkDelete}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>

            <Button
              variant="subtle"
              size="xs"
              onClick={onClearSelection}
            >
              Clear
            </Button>
          </Group>
        </motion.div>
      </AnimatePresence>

      {/* Category Modal */}
      <Modal
        opened={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Categorize Links"
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Apply a category to {selectedLinks.length} selected links
          </Text>
          <Select
            label="Category"
            placeholder="Enter or select category"
            data={[
              "Social Media",
              "Work",
              "Personal",
              "Projects",
              "Resources",
            ]}
            value={newCategory}
            onChange={(value) => setNewCategory(value || "")}
            searchable
            creatable
            getCreateLabel={(query) => `+ Create "${query}"`}
            onCreate={(query) => {
              setNewCategory(query);
              return query;
            }}
          />
          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={() => setShowCategoryModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkCategorize}
              disabled={!newCategory.trim()}
            >
              Apply Category
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Style Modal */}
      <Modal
        opened={showStyleModal}
        onClose={() => setShowStyleModal(false)}
        title="Apply Style"
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Apply styling to {selectedLinks.length} selected links
          </Text>
          <ColorInput
            label="Background Color"
            value={bulkStyle.backgroundColor}
            onChange={(value) => setBulkStyle(prev => ({ ...prev, backgroundColor: value }))}
          />
          <ColorInput
            label="Text Color"
            value={bulkStyle.textColor}
            onChange={(value) => setBulkStyle(prev => ({ ...prev, textColor: value }))}
          />
          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={() => setShowStyleModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkStyle}>
              Apply Style
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}