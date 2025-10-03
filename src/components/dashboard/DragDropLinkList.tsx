"use client";

import { Stack, Text, Button, Card, Title, Group, ScrollArea, Loader, Alert, Checkbox } from "@mantine/core";
import { IconPlus, IconAlertCircle, IconCheck, IconX } from "@tabler/icons-react";
import { useState, useCallback, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import type { Link } from "../../../types/dashboard";
import { DraggableLinkItem } from "./DraggableLinkItem";
import { BulkActionsToolbar } from "./BulkActionsToolbar";
import { reorderLinks, bulkDeleteLinks, bulkUpdateLinkCategories } from "../../lib/actions/links";

interface DragDropLinkListProps {
  links: Link[];
  selectedLink: Link | null;
  selectedLinks?: string[];
  onEditLink: (link: Link) => void;
  onDeleteLink?: (linkId: string) => void;
  onAddLink: () => void;
  onSelectLink?: (linkId: string, isSelected: boolean) => void;
  profileId: string;
  onLinksReorder?: (reorderedLinks: Link[]) => void;
  onLinksUpdate?: (updatedLinks: Link[]) => void;
}

export function DragDropLinkList({ 
  links, 
  selectedLink, 
  selectedLinks = [],
  onEditLink, 
  onDeleteLink, 
  onAddLink,
  onSelectLink,
  profileId,
  onLinksReorder,
  onLinksUpdate
}: DragDropLinkListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [localLinks, setLocalLinks] = useState(links);
  const [localSelectedLinks, setLocalSelectedLinks] = useState<string[]>(selectedLinks);
  const [isBulkOperating, setIsBulkOperating] = useState(false);
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

  // Update local state when props change
  useEffect(() => {
    setLocalLinks(links);
  }, [links]);

  useEffect(() => {
    setLocalSelectedLinks(selectedLinks);
  }, [selectedLinks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setReorderError(null);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = localLinks.findIndex((link) => link.id === active.id);
    const newIndex = localLinks.findIndex((link) => link.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Optimistically update the UI
    const reorderedLinks = arrayMove(localLinks, oldIndex, newIndex);
    setLocalLinks(reorderedLinks);
    
    // Notify parent component for immediate UI update
    if (onLinksReorder) {
      onLinksReorder(reorderedLinks);
    }

    // Update the database
    setIsReordering(true);
    try {
      const linkIds = reorderedLinks.map(link => link.id);
      const result = await reorderLinks(profileId, linkIds);
      
      if (!result.success) {
        // Rollback on error
        setLocalLinks(links);
        if (onLinksReorder) {
          onLinksReorder(links);
        }
        setReorderError(result.error?.message || 'Failed to reorder links');
      }
    } catch (error) {
      // Rollback on error
      setLocalLinks(links);
      if (onLinksReorder) {
        onLinksReorder(links);
      }
      setReorderError('An unexpected error occurred while reordering links');
      console.error('Reorder error:', error);
    } finally {
      setIsReordering(false);
    }
  }, [localLinks, profileId, onLinksReorder, links]);

  const activeLink = activeId ? localLinks.find(link => link.id === activeId) : null;

  // Multi-select handlers
  const handleLinkSelect = useCallback((linkId: string, event?: React.MouseEvent) => {
    const currentIndex = localLinks.findIndex(link => link.id === linkId);
    
    if (event?.shiftKey && lastClickedIndex !== null) {
      // Shift+click: select range
      const start = Math.min(lastClickedIndex, currentIndex);
      const end = Math.max(lastClickedIndex, currentIndex);
      const rangeIds = localLinks.slice(start, end + 1).map(link => link.id);
      
      const newSelection = [...new Set([...localSelectedLinks, ...rangeIds])];
      setLocalSelectedLinks(newSelection);
      
      // Notify parent
      rangeIds.forEach(id => {
        if (onSelectLink && !localSelectedLinks.includes(id)) {
          onSelectLink(id, true);
        }
      });
    } else if (event?.ctrlKey || event?.metaKey) {
      // Ctrl+click: toggle individual selection
      const isSelected = localSelectedLinks.includes(linkId);
      const newSelection = isSelected
        ? localSelectedLinks.filter(id => id !== linkId)
        : [...localSelectedLinks, linkId];
      
      setLocalSelectedLinks(newSelection);
      if (onSelectLink) {
        onSelectLink(linkId, !isSelected);
      }
    } else {
      // Regular click: single selection
      const isSelected = localSelectedLinks.includes(linkId);
      const newSelection = isSelected ? [] : [linkId];
      
      setLocalSelectedLinks(newSelection);
      if (onSelectLink) {
        onSelectLink(linkId, !isSelected);
      }
    }
    
    setLastClickedIndex(currentIndex);
  }, [localLinks, localSelectedLinks, lastClickedIndex, onSelectLink]);

  const handleSelectAll = useCallback(() => {
    const allIds = localLinks.map(link => link.id);
    const allSelected = allIds.every(id => localSelectedLinks.includes(id));
    
    if (allSelected) {
      // Deselect all
      setLocalSelectedLinks([]);
      allIds.forEach(id => {
        if (onSelectLink) {
          onSelectLink(id, false);
        }
      });
    } else {
      // Select all
      setLocalSelectedLinks(allIds);
      allIds.forEach(id => {
        if (onSelectLink && !localSelectedLinks.includes(id)) {
          onSelectLink(id, true);
        }
      });
    }
  }, [localLinks, localSelectedLinks, onSelectLink]);

  const handleClearSelection = useCallback(() => {
    localSelectedLinks.forEach(id => {
      if (onSelectLink) {
        onSelectLink(id, false);
      }
    });
    setLocalSelectedLinks([]);
  }, [localSelectedLinks, onSelectLink]);  // Bulk operations

  const handleBulkDelete = useCallback(async () => {
    if (localSelectedLinks.length === 0) return;

    setIsBulkOperating(true);
    try {
      const result = await bulkDeleteLinks(localSelectedLinks);
      
      if (result.success) {
        // Remove deleted links from local state
        const remainingLinks = localLinks.filter(link => !localSelectedLinks.includes(link.id));
        setLocalLinks(remainingLinks);
        setLocalSelectedLinks([]);
        
        // Notify parent
        if (onLinksUpdate) {
          onLinksUpdate(remainingLinks);
        }
        
        notifications.show({
          title: "Success",
          message: `${localSelectedLinks.length} link${localSelectedLinks.length !== 1 ? 's' : ''} deleted successfully`,
          color: "green",
          icon: <IconCheck size={16} />,
        });
      } else {
        throw result.error || new Error("Failed to delete links");
      }
    } catch (error: any) {
      console.error("Bulk delete error:", error);
      notifications.show({
        title: "Error",
        message: error.message || "Failed to delete links",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setIsBulkOperating(false);
    }
  }, [localSelectedLinks, localLinks, onLinksUpdate]);

  const handleBulkCategorize = useCallback(async (category: string) => {
    if (localSelectedLinks.length === 0) return;

    setIsBulkOperating(true);
    try {
      const result = await bulkUpdateLinkCategories(localSelectedLinks, category);
      
      if (result.success && result.data) {
        // Update local state with categorized links
        const updatedLinks = localLinks.map(link => {
          const updatedLink = result.data?.find(updated => updated.id === link.id);
          return updatedLink || link;
        });
        
        setLocalLinks(updatedLinks);
        setLocalSelectedLinks([]);
        
        // Notify parent
        if (onLinksUpdate) {
          onLinksUpdate(updatedLinks);
        }
        
        notifications.show({
          title: "Success",
          message: `${localSelectedLinks.length} link${localSelectedLinks.length !== 1 ? 's' : ''} categorized successfully`,
          color: "green",
          icon: <IconCheck size={16} />,
        });
      } else {
        throw result.error || new Error("Failed to categorize links");
      }
    } catch (error: any) {
      console.error("Bulk categorize error:", error);
      notifications.show({
        title: "Error",
        message: error.message || "Failed to categorize links",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setIsBulkOperating(false);
    }
  }, [localSelectedLinks, localLinks, onLinksUpdate]); 
 // Empty state when no links exist
  if (localLinks.length === 0) {
    return (
      <Card padding="lg" radius="md" withBorder style={{ flex: 1 }}>
        <Group justify="space-between" mb="md">
          <Title order={3} size="h4" c="black">
            Your Links
          </Title>
          <Text size="sm" c="dark.6">
            0 total
          </Text>
        </Group>

        <Stack align="center" gap="md" py="xl">
          <Text c="dark.5" size="lg" ta="center">
            No links yet
          </Text>
          <Text c="dark.4" size="sm" ta="center" style={{ maxWidth: 300 }}>
            Add your first link to get started. You can add social media profiles, websites, or any other links you want to share.
          </Text>
          <Button
            leftSection={<IconPlus size={16} />}
            color="dark"
            variant="light"
            onClick={onAddLink}
          >
            Add Your First Link
          </Button>
        </Stack>
      </Card>
    );
  }

  // Links list with drag-and-drop functionality
  return (
    <Card padding="lg" radius="md" withBorder style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <Title order={3} size="h4" c="black">
            Your Links
            {(isReordering || isBulkOperating) && <Loader size="xs" ml="sm" />}
          </Title>
          {localLinks.length > 1 && (
            <Checkbox
              size="sm"
              checked={localLinks.length > 0 && localSelectedLinks.length === localLinks.length}
              indeterminate={localSelectedLinks.length > 0 && localSelectedLinks.length < localLinks.length}
              onChange={handleSelectAll}
              label="Select all"
              disabled={isReordering || isBulkOperating}
            />
          )}
        </Group>
        <Text size="sm" c="dark.6">
          {localLinks.length} total
        </Text>
      </Group>

      <BulkActionsToolbar
        selectedCount={localSelectedLinks.length}
        onClearSelection={handleClearSelection}
        onBulkDelete={handleBulkDelete}
        onBulkCategorize={handleBulkCategorize}
        isLoading={isBulkOperating}
      />

      {reorderError && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          variant="light"
          mb="md"
          onClose={() => setReorderError(null)}
          withCloseButton
        >
          {reorderError}
        </Alert>
      )}

      <ScrollArea style={{ flex: 1 }} scrollbarSize={6}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext items={localLinks.map(link => link.id)} strategy={verticalListSortingStrategy}>
            <Stack gap="sm">
              {localLinks.map((link) => (
                <DraggableLinkItem
                  key={link.id}
                  link={link}
                  onEdit={onEditLink}
                  onDelete={onDeleteLink}
                  isSelected={selectedLink?.id === link.id || localSelectedLinks.includes(link.id)}
                  onSelect={(linkId, isSelected, event) => handleLinkSelect(linkId, event)}
                  isDragDisabled={isReordering || isBulkOperating}
                />
              ))}
            </Stack>
          </SortableContext>
          
          <DragOverlay>
            {activeLink ? (
              <DraggableLinkItem
                link={activeLink}
                onEdit={() => {}}
                isDragDisabled={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </ScrollArea>
    </Card>
  );
}