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
  Card,
  Image,
  Loader,
  Select,
  NumberInput,
  Switch,
  Divider,
  Collapse,
  Box,
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
  IconRefresh,
  IconWand,
  IconDownload,
  IconPalette,
  IconSettings,
  IconChevronDown,
  IconChevronUp,
  IconFolder,
} from "@tabler/icons-react";
import type { Link, LinkFormData } from "../../../types/dashboard";
import { useUrlMetadata } from "../../lib/hooks/useUrlMetadata";
import { 
  validateUrl, 
  validateTitle, 
  validateDescription, 
  validateIcon, 
  validateCategory,
  validateTags,
  validateColor,
  type ValidationResult
} from "../../lib/utils/enhanced-validation";
import { ValidationFeedback, ValidationSummary } from "../ui/ValidationFeedback";
import { EnhancedImageUpload } from "../ui/EnhancedImageUpload";
import { EnhancedColorPicker } from "../ui/EnhancedColorPicker";
import { EnhancedTagInput } from "../ui/EnhancedTagInput";

interface LinkFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: LinkFormData) => Promise<void>;
  editingLink?: Link | null;
  isLoading?: boolean;
  error?: string | null;
}

export function LinkForm({ 
  opened, 
  onClose, 
  onSubmit, 
  editingLink, 
  isLoading = false,
  error = null
}: LinkFormProps) {
  // State for enhanced validation feedback
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [urlSuggestion, setUrlSuggestion] = useState<string>("");
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [iconPreview, setIconPreview] = useState<string>("");
  const [showMetadataPreview, setShowMetadataPreview] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // URL metadata fetching
  const { 
    metadata, 
    isLoading: isLoadingMetadata, 
    error: metadataError, 
    fetchMetadata, 
    clearMetadata 
  } = useUrlMetadata();

  // Sample categories and tags (in a real app, these would come from the database)
  const availableCategories = [
    { value: 'social', label: 'Social Media' },
    { value: 'work', label: 'Work & Business' },
    { value: 'personal', label: 'Personal' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'education', label: 'Education' },
    { value: 'health', label: 'Health & Fitness' },
    { value: 'travel', label: 'Travel' },
    { value: 'food', label: 'Food & Drink' },
    { value: 'tech', label: 'Technology' },
  ];

  const popularTags = [
    'important', 'favorite', 'work', 'personal', 'urgent', 'daily', 
    'weekly', 'monthly', 'project', 'client', 'team', 'reference'
  ];

  const form = useForm<LinkFormData>({
    initialValues: {
      title: "",
      url: "",
      description: "",
      icon: "",
      category: "",
      tags: [],
      customStyling: {
        backgroundColor: "",
        textColor: "",
        borderRadius: 8,
        borderColor: "",
        borderWidth: 0,
        fontSize: 16,
        fontWeight: "normal" as const,
        shadow: false,
      },
      isFeatured: false,
    },
    validate: {
      title: (value: string) => {
        const result = validateTitle(value);
        setValidationResults(prev => ({ ...prev, title: result }));
        return result.isValid ? null : result.message;
      },
      url: (value: string) => {
        const result = validateUrl(value);
        setValidationResults(prev => ({ ...prev, url: result }));
        if (result.suggestion) {
          setUrlSuggestion(result.suggestion);
        } else {
          setUrlSuggestion("");
        }
        return result.isValid ? null : result.message;
      },
      description: (value: string) => {
        const result = validateDescription(value);
        setValidationResults(prev => ({ ...prev, description: result }));
        return result.isValid ? null : result.message;
      },
      icon: (value: string) => {
        const result = validateIcon(value);
        setValidationResults(prev => ({ ...prev, icon: result }));
        if (result.isValid && (result.iconType === 'url' || result.iconType === 'emoji')) {
          setIconPreview(value);
        } else {
          setIconPreview("");
        }
        return result.isValid ? null : result.message;
      },
      category: (value: string | undefined) => {
        const result = validateCategory(value || '');
        setValidationResults(prev => ({ ...prev, category: result }));
        return result.isValid ? null : result.message;
      },
      tags: (value: string[]) => {
        const result = validateTags(value);
        setValidationResults(prev => ({ ...prev, tags: result }));
        return result.isValid ? null : result.message;
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
        const customStyling = editingLink.custom_styling as any || {};
        form.setValues({
          title: editingLink.title,
          url: editingLink.url,
          description: editingLink.description || "",
          icon: editingLink.icon || "",
          category: editingLink.category || "",
          tags: editingLink.tags || [],
          customStyling: {
            backgroundColor: customStyling.backgroundColor || "",
            textColor: customStyling.textColor || "",
            borderRadius: customStyling.borderRadius || 8,
            borderColor: customStyling.borderColor || "",
            borderWidth: customStyling.borderWidth || 0,
            fontSize: customStyling.fontSize || 16,
            fontWeight: customStyling.fontWeight || "normal",
            shadow: customStyling.shadow || false,
          },
          isFeatured: editingLink.is_featured || false,
        });
        // Set initial icon preview
        const iconValidation = validateIcon(editingLink.icon || "");
        if (iconValidation.isValid && (iconValidation.iconType === 'url' || iconValidation.iconType === 'emoji')) {
          setIconPreview(editingLink.icon || "");
        }
      } else {
        form.reset();
        setValidationResults({});
        setUrlSuggestion("");
        setIconPreview("");
        setUploadedImage(null);
        setImagePreview("");
        setShowAdvancedOptions(false);
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
      clearMetadata();
      setShowMetadataPreview(false);
    }
  }, [debouncedUrl, clearMetadata]);

  // Auto-fetch metadata when URL is valid
  const handleFetchMetadata = async () => {
    if (form.values.url && !form.errors.url) {
      const fetchedMetadata = await fetchMetadata(form.values.url);
      if (fetchedMetadata) {
        setShowMetadataPreview(true);
      }
    }
  };

  // Apply metadata to form
  const applyMetadata = () => {
    if (metadata) {
      if (metadata.title && !form.values.title) {
        form.setFieldValue('title', metadata.title);
      }
      if (metadata.description && !form.values.description) {
        form.setFieldValue('description', metadata.description);
      }
      if (metadata.favicon && !form.values.icon) {
        form.setFieldValue('icon', metadata.favicon);
      }
    }
  };



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
      setValidationResults({});
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
    setValidationResults({});
    setUrlSuggestion("");
    setIconPreview("");
    setUploadedImage(null);
    setImagePreview("");
    setShowAdvancedOptions(false);
    setShowMetadataPreview(false);
    clearMetadata();
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
      <form onSubmit={form.onSubmit(handleSubmit as any)}>
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
            
            {/* Enhanced validation feedback */}
            {validationResults.title && (
              <ValidationFeedback 
                result={validationResults.title}
                size={isMobile ? "sm" : "xs"}
              />
            )}
            
            {/* Character count for title */}
            {form.values.title && (
              <Text size="xs" c="dimmed" mt={4}>
                {form.values.title.length}/100 characters
                {form.values.title.length > 60 && (
                  <Text component="span" c="orange" ml={4}>
                    (may be truncated in some views)
                  </Text>
                )}
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
            
            {/* Enhanced validation feedback */}
            {validationResults.url && (
              <ValidationFeedback 
                result={validationResults.url}
                suggestion={urlSuggestion}
                onApplySuggestion={urlSuggestion ? () => form.setFieldValue('url', urlSuggestion) : undefined}
                size={isMobile ? "sm" : "xs"}
              />
            )}

            {/* URL Validation Success with Metadata Fetch */}
            {form.values.url && !form.errors.url && !isValidatingUrl && (
              <Alert
                icon={<IconCheck size={16} />}
                color="green"
                variant="light"
                mt="xs"
              >
                <Group justify="space-between" align="center">
                  <Text size="sm">URL format is valid</Text>
                  <Group gap="xs">
                    <Tooltip label="Fetch page information">
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={handleFetchMetadata}
                        loading={isLoadingMetadata}
                        className={isMobile ? "touch-target" : undefined}
                      >
                        <IconWand size={14} />
                      </ActionIcon>
                    </Tooltip>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => window.open(form.values.url, '_blank')}
                    >
                      <IconExternalLink size={14} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Alert>
            )}

            {/* Metadata Loading */}
            {isLoadingMetadata && (
              <Alert
                icon={<Loader size={16} />}
                color="blue"
                variant="light"
                mt="xs"
              >
                <Text size="sm">Fetching page information...</Text>
              </Alert>
            )}

            {/* Metadata Error */}
            {metadataError && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                color="red"
                variant="light"
                mt="xs"
              >
                <Group justify="space-between" align="center">
                  <Text size="sm">{metadataError}</Text>
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconRefresh size={12} />}
                    onClick={handleFetchMetadata}
                    className={isMobile ? "touch-button" : undefined}
                  >
                    Retry
                  </Button>
                </Group>
              </Alert>
            )}

            {/* Metadata Preview */}
            {metadata && showMetadataPreview && (
              <Card
                withBorder
                mt="xs"
                p="md"
                style={{
                  background: 'var(--mantine-color-gray-0)',
                  borderColor: 'var(--mantine-color-green-3)'
                }}
              >
                <Group justify="space-between" align="flex-start" mb="sm">
                  <Text size="sm" fw={500} c="green">
                    Found page information
                  </Text>
                  <Group gap="xs">
                    <Button
                      size="xs"
                      variant="light"
                      color="green"
                      leftSection={<IconDownload size={12} />}
                      onClick={applyMetadata}
                      className={isMobile ? "touch-button" : undefined}
                    >
                      Use this info
                    </Button>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={() => setShowMetadataPreview(false)}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  </Group>
                </Group>

                <Stack gap="xs">
                  {metadata.title && (
                    <Group gap="xs" align="flex-start">
                      <Text size="xs" c="dimmed" style={{ minWidth: 60 }}>
                        Title:
                      </Text>
                      <Text size="xs" style={{ flex: 1 }}>
                        {metadata.title}
                      </Text>
                    </Group>
                  )}
                  
                  {metadata.description && (
                    <Group gap="xs" align="flex-start">
                      <Text size="xs" c="dimmed" style={{ minWidth: 60 }}>
                        Description:
                      </Text>
                      <Text size="xs" style={{ flex: 1 }} lineClamp={2}>
                        {metadata.description}
                      </Text>
                    </Group>
                  )}

                  {metadata.image && (
                    <Group gap="xs" align="flex-start">
                      <Text size="xs" c="dimmed" style={{ minWidth: 60 }}>
                        Image:
                      </Text>
                      <div style={{ flex: 1 }}>
                        <Image
                          src={metadata.image}
                          alt="Page preview"
                          width={80}
                          height={60}
                          fit="cover"
                          radius="sm"
                          fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60' viewBox='0 0 80 60'%3E%3Crect width='80' height='60' fill='%23f1f3f4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='12'%3ENo image%3C/text%3E%3C/svg%3E"
                        />
                      </div>
                    </Group>
                  )}

                  {metadata.favicon && (
                    <Group gap="xs" align="center">
                      <Text size="xs" c="dimmed" style={{ minWidth: 60 }}>
                        Icon:
                      </Text>
                      <Image
                        src={metadata.favicon}
                        alt="Site icon"
                        width={16}
                        height={16}
                        fit="contain"
                        fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%23ddd'/%3E%3C/svg%3E"
                      />
                      <Text size="xs" c="dimmed">
                        Available as icon
                      </Text>
                    </Group>
                  )}
                </Stack>
              </Card>
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
            
            {/* Enhanced validation feedback */}
            {validationResults.description && (
              <ValidationFeedback 
                result={validationResults.description}
                size={isMobile ? "sm" : "xs"}
              />
            )}
            
            {/* Character count for description */}
            <Text size="xs" c="dimmed" mt={4}>
              {form.values.description?.length || 0}/500 characters
              {form.values.description && form.values.description.length > 150 && (
                <Text component="span" c="orange" ml={4}>
                  (may be truncated in previews)
                </Text>
              )}
            </Text>
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
                    {validateIcon(iconPreview).iconType === 'emoji' ? (
                      <Text size={isMobile ? "md" : "sm"}>{iconPreview}</Text>
                    ) : (
                      <IconPhoto size={isMobile ? 18 : 16} color="green" />
                    )}
                  </div>
                ) : null
              }
            />
            
            {/* Enhanced validation feedback */}
            {validationResults.icon && (
              <ValidationFeedback 
                result={validationResults.icon}
                size={isMobile ? "sm" : "xs"}
              />
            )}

            {/* Icon Help Text */}
            <Text size="xs" c="dimmed" mt={4}>
              Use an emoji (like 🔗, 📱, 💼) or paste an image URL
            </Text>
          </div>

          {/* Enhanced Image Upload Section */}
          <EnhancedImageUpload
            label="Upload Custom Icon"
            value={imagePreview}
            onChange={(value) => {
              setImagePreview(value);
              form.setFieldValue('icon', value);
            }}
            onError={(error) => {
              notifications.show({
                title: 'Upload Error',
                message: error,
                color: 'red',
              });
            }}
            maxSize={5 * 1024 * 1024} // 5MB
            placeholder="Custom icons help your links stand out"
            previewSize={isMobile ? 60 : 50}
          />

          {/* Category Selection */}
          <div>
            <Select
              label="Category"
              placeholder="Choose a category (optional)"
              data={availableCategories}
              searchable
              clearable
              {...form.getInputProps("category")}
              size={isMobile ? "md" : "sm"}
              leftSection={<IconFolder size={isMobile ? 18 : 16} />}
              styles={isMobile ? {
                input: {
                  fontSize: "16px",
                  minHeight: "48px",
                  padding: "12px 16px"
                },
                label: {
                  fontSize: "14px",
                  fontWeight: 500,
                  marginBottom: "8px"
                }
              } : undefined}
            />
            
            {/* Enhanced validation feedback */}
            {validationResults.category && (
              <ValidationFeedback 
                result={validationResults.category}
                size={isMobile ? "sm" : "xs"}
              />
            )}
          </div>

          {/* Enhanced Tags Input */}
          <EnhancedTagInput
            label="Tags"
            value={form.values.tags || []}
            onChange={(tags) => form.setFieldValue('tags', tags)}
            placeholder="Add tags to organize your links"
            maxTags={10}
            maxTagLength={30}
            popularTags={popularTags}
            error={typeof form.errors.tags === 'string' ? form.errors.tags : undefined}
          />

          {/* Advanced Styling Options */}
          <div>
            <Group justify="space-between" align="center" mb="xs">
              <Group gap="xs">
                <IconPalette size={isMobile ? 18 : 16} />
                <Text size="sm" fw={500}>
                  Custom Styling
                </Text>
              </Group>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              >
                {showAdvancedOptions ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
              </ActionIcon>
            </Group>

            <Collapse in={showAdvancedOptions}>
              <Stack gap="md" p="md" style={{ 
                background: 'var(--mantine-color-gray-0)', 
                borderRadius: 'var(--mantine-radius-md)',
                border: '1px solid var(--mantine-color-gray-3)'
              }}>
                <Group grow>
                  <EnhancedColorPicker
                    label="Background Color"
                    value={form.values.customStyling?.backgroundColor || ''}
                    onChange={(color) => form.setFieldValue('customStyling.backgroundColor', color)}
                    placeholder="Choose background color"
                    showPreview={true}
                    previewText={form.values.title || 'Preview'}
                    error={typeof form.errors['customStyling.backgroundColor'] === 'string' ? form.errors['customStyling.backgroundColor'] : undefined}
                  />
                  
                  <EnhancedColorPicker
                    label="Text Color"
                    value={form.values.customStyling?.textColor || ''}
                    onChange={(color) => form.setFieldValue('customStyling.textColor', color)}
                    placeholder="Choose text color"
                    showPreview={true}
                    previewText={form.values.title || 'Preview'}
                    error={typeof form.errors['customStyling.textColor'] === 'string' ? form.errors['customStyling.textColor'] : undefined}
                    swatches={[
                      '#000000', '#ffffff', '#25262b', '#868e96', '#495057', '#212529'
                    ]}
                  />
                </Group>

                <Group grow>
                  <NumberInput
                    label="Border Radius"
                    placeholder="8"
                    min={0}
                    max={50}
                    {...form.getInputProps("customStyling.borderRadius")}
                    size={isMobile ? "md" : "sm"}
                    suffix="px"
                  />
                  
                  <NumberInput
                    label="Font Size"
                    placeholder="16"
                    min={10}
                    max={24}
                    {...form.getInputProps("customStyling.fontSize")}
                    size={isMobile ? "md" : "sm"}
                    suffix="px"
                  />
                </Group>

                <Group grow>
                  <EnhancedColorPicker
                    label="Border Color"
                    value={form.values.customStyling?.borderColor || ''}
                    onChange={(color) => form.setFieldValue('customStyling.borderColor', color)}
                    placeholder="Choose border color"
                    showPreview={false}
                    error={typeof form.errors['customStyling.borderColor'] === 'string' ? form.errors['customStyling.borderColor'] : undefined}
                  />
                  
                  <NumberInput
                    label="Border Width"
                    placeholder="0"
                    min={0}
                    max={10}
                    {...form.getInputProps("customStyling.borderWidth")}
                    size={isMobile ? "md" : "sm"}
                    suffix="px"
                  />
                </Group>

                <Group grow>
                  <Select
                    label="Font Weight"
                    data={[
                      { value: 'light', label: 'Light' },
                      { value: 'normal', label: 'Normal' },
                      { value: 'bold', label: 'Bold' },
                    ]}
                    {...form.getInputProps("customStyling.fontWeight")}
                    size={isMobile ? "md" : "sm"}
                  />
                  
                  <Box pt={isMobile ? "md" : "sm"}>
                    <Switch
                      label="Drop Shadow"
                      {...form.getInputProps("customStyling.shadow", { type: 'checkbox' })}
                      size={isMobile ? "md" : "sm"}
                    />
                  </Box>
                </Group>

                {/* Style Preview */}
                {(form.values.customStyling.backgroundColor || 
                  form.values.customStyling.textColor || 
                  form.values.customStyling.borderColor) && (
                  <div>
                    <Text size="xs" fw={500} mb="xs" c="dimmed">
                      Preview:
                    </Text>
                    <Box
                      p="md"
                      style={{
                        backgroundColor: form.values.customStyling.backgroundColor || 'transparent',
                        color: form.values.customStyling.textColor || 'inherit',
                        borderRadius: form.values.customStyling.borderRadius || 8,
                        border: form.values.customStyling.borderWidth 
                          ? `${form.values.customStyling.borderWidth}px solid ${form.values.customStyling.borderColor || '#ddd'}`
                          : 'none',
                        fontSize: form.values.customStyling.fontSize || 16,
                        fontWeight: form.values.customStyling.fontWeight || 'normal',
                        boxShadow: form.values.customStyling.shadow 
                          ? '0 2px 8px rgba(0, 0, 0, 0.1)' 
                          : 'none',
                        textAlign: 'center' as const,
                      }}
                    >
                      {form.values.title || 'Your Link Title'}
                    </Box>
                  </div>
                )}
              </Stack>
            </Collapse>
          </div>

          {/* Featured Toggle */}
          <Switch
            label="Featured Link"
            description="Featured links appear at the top of your profile"
            {...form.getInputProps("isFeatured", { type: 'checkbox' })}
            size={isMobile ? "md" : "sm"}
          />

          <Divider />

          {/* Enhanced Form Validation Summary */}
          <ValidationSummary 
            errors={Object.fromEntries(
              Object.entries(validationResults).filter(([_, result]) => !result.isValid)
            )}
            warnings={Object.fromEntries(
              Object.entries(validationResults).filter(([_, result]) => 
                result.isValid && result.severity === 'warning'
              )
            )}
            infos={Object.fromEntries(
              Object.entries(validationResults).filter(([_, result]) => 
                result.isValid && result.severity === 'info'
              )
            )}
          />

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