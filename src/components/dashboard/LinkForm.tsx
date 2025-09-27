"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Stack,
  Group,
  Text,
  Alert,
  Progress,
  Tooltip,
  ActionIcon,
  Drawer,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { 
  IconAlertCircle, 
  IconCheck, 
  IconX, 
  IconInfoCircle,
  IconExternalLink,
  IconPhoto,
} from "@tabler/icons-react";
import type { Link, LinkFormData } from "../../../types/dashboard";

interface LinkFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: LinkFormData) => Promise<void>;
  editingLink?: Link | null;
  isLoading?: boolean;
  error?: string | null;
}

// Enhanced URL validation regex patterns
const URL_REGEX = /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/;
const SIMPLE_URL_REGEX = /^https?:\/\/.+/;
const IMAGE_URL_REGEX = /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i;
const DOMAIN_REGEX = /^https?:\/\/([^\/]+)/;

// Validation utility functions
const validateUrl = (url: string): { isValid: boolean; message?: string; suggestion?: string } => {
  if (!url || url.trim().length === 0) {
    return { isValid: false, message: "URL is required" };
  }

  const trimmedUrl = url.trim();
  
  if (!SIMPLE_URL_REGEX.test(trimmedUrl)) {
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return { 
        isValid: false, 
        message: "URL must start with http:// or https://",
        suggestion: `https://${trimmedUrl}`
      };
    }
    return { isValid: false, message: "Please enter a valid URL" };
  }

  if (!URL_REGEX.test(trimmedUrl)) {
    return { isValid: false, message: "URL format appears to be invalid" };
  }

  if (trimmedUrl.length > 2000) {
    return { isValid: false, message: "URL must be 2000 characters or less" };
  }

  return { isValid: true };
};

const validateTitle = (title: string): { isValid: boolean; message?: string } => {
  if (!title || title.trim().length === 0) {
    return { isValid: false, message: "Title is required" };
  }

  const trimmedTitle = title.trim();
  
  if (trimmedTitle.length < 2) {
    return { isValid: false, message: "Title must be at least 2 characters long" };
  }

  if (trimmedTitle.length > 100) {
    return { isValid: false, message: "Title must be 100 characters or less" };
  }

  return { isValid: true };
};

const validateDescription = (description: string): { isValid: boolean; message?: string } => {
  if (description && description.length > 200) {
    return { isValid: false, message: "Description must be 200 characters or less" };
  }
  return { isValid: true };
};

const validateIcon = (icon: string): { isValid: boolean; message?: string; type?: 'emoji' | 'url' | 'empty' } => {
  if (!icon || icon.trim().length === 0) {
    return { isValid: true, type: 'empty' };
  }

  const trimmedIcon = icon.trim();
  
  // Check if it's an emoji (basic check for common emoji ranges)
  const emojiRegex = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/u;
  
  if (emojiRegex.test(trimmedIcon) && trimmedIcon.length <= 4) {
    return { isValid: true, type: 'emoji' };
  }

  // Check if it's a valid image URL
  if (IMAGE_URL_REGEX.test(trimmedIcon)) {
    return { isValid: true, type: 'url' };
  }

  // If it looks like a URL but doesn't match image pattern
  if (SIMPLE_URL_REGEX.test(trimmedIcon)) {
    return { 
      isValid: false, 
      message: "Icon URL must point to an image file (jpg, jpeg, png, gif, svg, webp)",
      type: 'url'
    };
  }

  // If it's not an emoji or URL
  if (trimmedIcon.length > 4) {
    return { 
      isValid: false, 
      message: "Icon should be an emoji (like 🔗) or a valid image URL"
    };
  }

  return { isValid: true, type: 'emoji' };
};

export function LinkForm({ 
  opened, 
  onClose, 
  onSubmit, 
  editingLink, 
  isLoading = false,
  error = null
}: LinkFormProps) {
  const [urlSuggestion, setUrlSuggestion] = useState<string>("");
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [iconPreview, setIconPreview] = useState<string>("");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const form = useForm<LinkFormData>({
    initialValues: {
      title: "",
      url: "",
      description: "",
      icon: "",
    },
    validate: {
      title: (value: string) => {
        const validation = validateTitle(value);
        return validation.isValid ? null : validation.message;
      },
      url: (value: string) => {
        const validation = validateUrl(value);
        if (!validation.isValid) {
          if (validation.suggestion) {
            setUrlSuggestion(validation.suggestion);
          }
          return validation.message;
        }
        setUrlSuggestion("");
        return null;
      },
      description: (value: string) => {
        const validation = validateDescription(value);
        return validation.isValid ? null : validation.message;
      },
      icon: (value: string) => {
        const validation = validateIcon(value);
        if (validation.isValid && validation.type === 'url') {
          setIconPreview(value);
        } else if (validation.type === 'emoji') {
          setIconPreview(value);
        } else {
          setIconPreview("");
        }
        return validation.isValid ? null : validation.message;
      },
    },
    validateInputOnChange: true,
    validateInputOnBlur: true,
  });

  // Debounced values for real-time validation feedback
  const [debouncedUrl] = useDebouncedValue(form.values.url, 500);
  const [debouncedTitle] = useDebouncedValue(form.values.title, 300);

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
        // Set initial icon preview
        const iconValidation = validateIcon(editingLink.icon || "");
        if (iconValidation.isValid && (iconValidation.type === 'url' || iconValidation.type === 'emoji')) {
          setIconPreview(editingLink.icon || "");
        }
      } else {
        form.reset();
        setUrlSuggestion("");
        setIconPreview("");
      }
    }
  }, [opened, editingLink]);

  // Real-time URL validation with debouncing
  useEffect(() => {
    if (debouncedUrl && debouncedUrl.trim().length > 0) {
      setIsValidatingUrl(true);
      
      // Simulate async URL validation (could be extended to check if URL is reachable)
      const timer = setTimeout(() => {
        const validation = validateUrl(debouncedUrl);
        if (validation.suggestion) {
          setUrlSuggestion(validation.suggestion);
        } else {
          setUrlSuggestion("");
        }
        setIsValidatingUrl(false);
      }, 200);

      return () => clearTimeout(timer);
    } else {
      setIsValidatingUrl(false);
      setUrlSuggestion("");
    }
  }, [debouncedUrl]);

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
        autoClose: 4000,
      });
      
      form.reset();
      onClose();
    } catch (error: any) {
      console.error("Error submitting form:", error);
      
      // Enhanced error handling with specific error types
      let errorTitle = "Error";
      let errorMessage = editingLink 
        ? "Failed to update link. Please try again." 
        : "Failed to add link. Please try again.";
      let showRetry = false;
      
      if (error?.type) {
        switch (error.type) {
          case 'validation':
            errorTitle = "Validation Error";
            errorMessage = error.message;
            break;
          case 'network':
            errorTitle = "Connection Error";
            errorMessage = error.message;
            showRetry = error.retryable;
            break;
          case 'database':
            errorTitle = "Database Error";
            errorMessage = error.message;
            break;
          case 'not_found':
            errorTitle = "Not Found";
            errorMessage = error.message;
            break;
          case 'permission':
            errorTitle = "Permission Error";
            errorMessage = error.message;
            break;
          default:
            errorTitle = "Unexpected Error";
            errorMessage = error.message || errorMessage;
            showRetry = error.retryable;
        }
      }
      
      notifications.show({
        title: errorTitle,
        message: errorMessage,
        color: "red",
        icon: <IconX size={16} />,
        autoClose: showRetry ? 8000 : 5000,
        withCloseButton: true,
      });

      // Show retry option for retryable errors
      if (showRetry) {
        setTimeout(() => {
          notifications.show({
            title: "Retry Available",
            message: "You can try submitting the form again when your connection is restored.",
            color: "blue",
            icon: <IconInfoCircle size={16} />,
            autoClose: 6000,
          });
        }, 1000);
      }
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const FormContainer = isMobile ? Drawer : Modal;
  const formProps = isMobile 
    ? {
        opened,
        onClose: handleClose,
        title: (
          <Text fw={600} size="lg">
            {editingLink ? "Edit Link" : "Add New Link"}
          </Text>
        ),
        position: "bottom" as const,
        size: "100%",
        padding: "lg",
        styles: {
          content: {
            borderRadius: "16px 16px 0 0",
            minHeight: "60vh",
          },
          header: {
            padding: "16px 20px 8px 20px",
            borderBottom: "1px solid #e9ecef",
          },
          body: {
            padding: "20px",
            paddingBottom: "calc(20px + env(safe-area-inset-bottom))",
          }
        }
      }
    : {
        opened,
        onClose: handleClose,
        title: (
          <Text fw={600} size="lg">
            {editingLink ? "Edit Link" : "Add New Link"}
          </Text>
        ),
        size: "md",
        centered: true
      };

  return (
    <FormContainer {...formProps}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap={isMobile ? "lg" : "md"}>
          {/* Error Alert */}
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}

          {/* Title Field */}
          <div>
            <TextInput
              label="Title"
              placeholder="Enter a descriptive title for your link"
              required
              {...form.getInputProps("title")}
              data-autofocus
              size={isMobile ? "md" : "sm"}
              styles={isMobile ? {
                input: {
                  fontSize: "16px", // Prevents zoom on iOS
                  minHeight: "48px",
                  padding: "12px 16px"
                },
                label: {
                  fontSize: "14px",
                  fontWeight: 500,
                  marginBottom: "8px"
                }
              } : undefined}
              className={isMobile ? "touch-input" : undefined}
              rightSection={
                form.values.title && !form.errors.title ? (
                  <IconCheck size={16} color="green" />
                ) : null
              }
            />
            {/* Character count for title */}
            {form.values.title && (
              <Text size="xs" c="dimmed" mt={4}>
                {form.values.title.length}/100 characters
              </Text>
            )}
          </div>

          {/* URL Field */}
          <div>
            <TextInput
              label="URL"
              placeholder="https://example.com"
              required
              {...form.getInputProps("url")}
              size={isMobile ? "md" : "sm"}
              styles={isMobile ? {
                input: {
                  fontSize: "16px", // Prevents zoom on iOS
                  minHeight: "48px",
                  padding: "12px 16px"
                },
                label: {
                  fontSize: "14px",
                  fontWeight: 500,
                  marginBottom: "8px"
                }
              } : undefined}
              className={isMobile ? "touch-input" : undefined}
              rightSection={
                isValidatingUrl ? (
                  <Progress size="xs" value={50} />
                ) : form.values.url && !form.errors.url ? (
                  <Tooltip label="Test URL">
                    <ActionIcon
                      variant="subtle"
                      size={isMobile ? "md" : "sm"}
                      className={isMobile ? "touch-target" : undefined}
                      onClick={() => window.open(form.values.url, '_blank')}
                    >
                      <IconExternalLink size={isMobile ? 18 : 14} />
                    </ActionIcon>
                  </Tooltip>
                ) : null
              }
            />
            
            {/* URL Suggestion */}
            {urlSuggestion && form.errors.url && (
              <Alert
                icon={<IconInfoCircle size={16} />}
                color="blue"
                variant="light"
                mt="xs"
              >
                <Group justify="space-between" align="center">
                  <Text size="sm">Did you mean: {urlSuggestion}?</Text>
                  <Button
                    size={isMobile ? "sm" : "xs"}
                    variant="light"
                    className={isMobile ? "touch-button" : undefined}
                    onClick={() => form.setFieldValue('url', urlSuggestion)}
                  >
                    Use this
                  </Button>
                </Group>
              </Alert>
            )}

            {/* URL Validation Success */}
            {form.values.url && !form.errors.url && !isValidatingUrl && (
              <Alert
                icon={<IconCheck size={16} />}
                color="green"
                variant="light"
                mt="xs"
              >
                <Group justify="space-between" align="center">
                  <Text size="sm">URL format is valid</Text>
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    onClick={() => window.open(form.values.url, '_blank')}
                  >
                    <IconExternalLink size={14} />
                  </ActionIcon>
                </Group>
              </Alert>
            )}
          </div>

          {/* Description Field */}
          <div>
            <Textarea
              label="Description"
              placeholder="Optional description to help users understand what this link is about"
              rows={isMobile ? 4 : 3}
              {...form.getInputProps("description")}
              size={isMobile ? "md" : "sm"}
              styles={isMobile ? {
                input: {
                  fontSize: "16px", // Prevents zoom on iOS
                  minHeight: "96px",
                  padding: "12px 16px",
                  lineHeight: "1.4"
                },
                label: {
                  fontSize: "14px",
                  fontWeight: 500,
                  marginBottom: "8px"
                }
              } : undefined}
              className={isMobile ? "touch-input" : undefined}
            />
            {/* Character count for description */}
            {form.values.description && (
              <Text size="xs" c="dimmed" mt={4}>
                {form.values.description.length}/200 characters
              </Text>
            )}
          </div>

          {/* Icon Field */}
          <div>
            <TextInput
              label="Icon"
              placeholder="🔗 or https://example.com/icon.png"
              {...form.getInputProps("icon")}
              size={isMobile ? "md" : "sm"}
              styles={isMobile ? {
                input: {
                  fontSize: "16px", // Prevents zoom on iOS
                  minHeight: "48px",
                  padding: "12px 16px"
                },
                label: {
                  fontSize: "14px",
                  fontWeight: 500,
                  marginBottom: "8px"
                }
              } : undefined}
              className={isMobile ? "touch-input" : undefined}
              rightSection={
                iconPreview ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {validateIcon(iconPreview).type === 'emoji' ? (
                      <Text size={isMobile ? "md" : "sm"}>{iconPreview}</Text>
                    ) : (
                      <IconPhoto size={isMobile ? 18 : 16} color="green" />
                    )}
                  </div>
                ) : null
              }
            />
            
            {/* Icon Preview */}
            {iconPreview && !form.errors.icon && (
              <Alert
                icon={validateIcon(iconPreview).type === 'emoji' ? 
                  <Text size="sm">{iconPreview}</Text> : 
                  <IconPhoto size={16} />
                }
                color="green"
                variant="light"
                mt="xs"
              >
                <Text size="sm">
                  {validateIcon(iconPreview).type === 'emoji' 
                    ? 'Emoji icon ready' 
                    : 'Image icon will be loaded'
                  }
                </Text>
              </Alert>
            )}

            {/* Icon Help Text */}
            <Text size="xs" c="dimmed" mt={4}>
              Use an emoji (like 🔗, 📱, 💼) or paste an image URL
            </Text>
          </div>

          {/* Form Validation Summary */}
          {Object.keys(form.errors).length > 0 && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
            >
              <Text size="sm" fw={500} mb={4}>Please fix the following errors:</Text>
              <Stack gap={2}>
                {Object.entries(form.errors).map(([field, error]) => (
                  <Text key={field} size="xs">
                    • {field.charAt(0).toUpperCase() + field.slice(1)}: {error}
                  </Text>
                ))}
              </Stack>
            </Alert>
          )}

          {/* Form Actions */}
          <Group 
            justify={isMobile ? "stretch" : "flex-end"} 
            mt={isMobile ? "xl" : "md"}
            gap={isMobile ? "md" : "sm"}
          >
            <Button
              variant="subtle"
              onClick={handleClose}
              disabled={isLoading}
              size={isMobile ? "md" : "sm"}
              className={isMobile ? "touch-button" : undefined}
              style={isMobile ? { flex: 1 } : undefined}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              color="dark"
              disabled={Object.keys(form.errors).length > 0}
              size={isMobile ? "md" : "sm"}
              className={isMobile ? "touch-button" : undefined}
              style={isMobile ? { flex: 1 } : undefined}
            >
              {editingLink ? "Update Link" : "Add Link"}
            </Button>
          </Group>
        </Stack>
      </form>
    </FormContainer>
  );
}