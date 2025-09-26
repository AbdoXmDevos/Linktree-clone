"use client";

import { useEffect } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Stack,
  Group,
  Text,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck, IconX } from "@tabler/icons-react";
import { Link } from "./DashboardLayout";
import { LinkFormData } from "../../../types/dashboard";

interface LinkFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: LinkFormData) => Promise<void>;
  editingLink?: Link | null;
  isLoading?: boolean;
}

// URL validation regex pattern
const URL_REGEX = /^https?:\/\/.+/;

export function LinkForm({ 
  opened, 
  onClose, 
  onSubmit, 
  editingLink, 
  isLoading = false 
}: LinkFormProps) {
  const form = useForm<LinkFormData>({
    initialValues: {
      title: "",
      url: "",
      description: "",
      icon: "",
    },
    validate: {
      title: (value: string) => {
        if (!value || value.trim().length === 0) {
          return "Title is required";
        }
        if (value.length > 100) {
          return "Title must be 100 characters or less";
        }
        return null;
      },
      url: (value: string) => {
        if (!value || value.trim().length === 0) {
          return "URL is required";
        }
        if (!URL_REGEX.test(value)) {
          return "URL must start with http:// or https://";
        }
        if (value.length > 2000) {
          return "URL must be 2000 characters or less";
        }
        return null;
      },
      description: (value: string) => {
        if (value && value.length > 200) {
          return "Description must be 200 characters or less";
        }
        return null;
      },
      icon: (value: string) => {
        if (value && value.trim().length > 0) {
          // Simple validation for icon - can be emoji or URL
          const isUrl = /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg)$/i.test(value);
          const isEmoji = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(value);
          
          if (!isUrl && !isEmoji && value.length > 2) {
            return "Icon should be an emoji or a valid image URL";
          }
        }
        return null;
      },
    },
  });

  // Reset form when modal opens/closes or editing link changes
  useEffect(() => {
    if (opened) {
      if (editingLink) {
        form.setValues({
          title: editingLink.title,
          url: editingLink.url,
          description: editingLink.description || "",
          icon: editingLink.icon || "",
        });
      } else {
        form.reset();
      }
    }
  }, [opened, editingLink]);

  const handleSubmit = async (values: LinkFormData) => {
    try {
      await onSubmit(values);
      
      notifications.show({
        title: editingLink ? "Link updated" : "Link added",
        message: editingLink 
          ? "Your link has been successfully updated" 
          : "Your new link has been added successfully",
        color: "green",
        icon: <IconCheck size={16} />,
      });
      
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      
      notifications.show({
        title: "Error",
        message: editingLink 
          ? "Failed to update link. Please try again." 
          : "Failed to add link. Please try again.",
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={600} size="lg">
          {editingLink ? "Edit Link" : "Add New Link"}
        </Text>
      }
      size="md"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Title Field */}
          <TextInput
            label="Title"
            placeholder="Enter link title"
            required
            {...form.getInputProps("title")}
            data-autofocus
          />

          {/* URL Field */}
          <TextInput
            label="URL"
            placeholder="https://example.com"
            required
            {...form.getInputProps("url")}
          />

          {/* Description Field */}
          <Textarea
            label="Description"
            placeholder="Optional description for your link"
            rows={3}
            {...form.getInputProps("description")}
          />

          {/* Icon Field */}
          <TextInput
            label="Icon"
            placeholder="🔗 or https://example.com/icon.png"
            {...form.getInputProps("icon")}
          />

          {/* URL Validation Info */}
          {form.values.url && !form.errors.url && (
            <Alert
              icon={<IconCheck size={16} />}
              color="green"
              variant="light"
            >
              URL format is valid
            </Alert>
          )}

          {/* Form Actions */}
          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              color="dark"
            >
              {editingLink ? "Update Link" : "Add Link"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}