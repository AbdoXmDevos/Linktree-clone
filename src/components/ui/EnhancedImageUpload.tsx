"use client";

import { useState, useCallback } from "react";
import {
  Group,
  Text,
  Image,
  Button,
  ActionIcon,
  Progress,
  Alert,
  Box,
  Stack,
  Tooltip,
  Card
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE, FileWithPath } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import {
  IconUpload,
  IconX,
  IconPhoto,
  IconAlertCircle,
  IconCheck,
  IconRefresh,
  IconEye,
  IconDownload
} from "@tabler/icons-react";

interface EnhancedImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onError?: (error: string) => void;
  label?: string;
  description?: string;
  maxSize?: number; // in bytes
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  previewSize?: number;
  acceptedFormats?: string[];
}

export function EnhancedImageUpload({
  value,
  onChange,
  onError,
  label = "Upload Image",
  description = "Drag image here or click to select",
  maxSize = 5 * 1024 * 1024, // 5MB default
  disabled = false,
  required = false,
  placeholder,
  previewSize = 80,
  acceptedFormats = ['PNG', 'JPG', 'GIF', 'SVG', 'WebP']
}: EnhancedImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: FileWithPath): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`;
    }

    // Check file type
    if (!IMAGE_MIME_TYPE.includes(file.type as any)) {
      return `File must be an image (${acceptedFormats.join(', ')})`;
    }

    // Check for suspicious file names
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      return 'Invalid file name';
    }

    return null;
  };

  const simulateUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            
            // Create data URL for preview
            const reader = new FileReader();
            reader.onload = (e) => {
              setIsUploading(false);
              setUploadProgress(100);
              resolve(e.target?.result as string);
            };
            reader.onerror = () => {
              setIsUploading(false);
              reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(file);
            
            return 100;
          }
          return prev + Math.random() * 20;
        });
      }, 100);
    });
  };

  const handleDrop = useCallback(async (files: FileWithPath[]) => {
    if (files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);

    if (validationError) {
      onError?.(validationError);
      notifications.show({
        title: 'Upload Error',
        message: validationError,
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
      return;
    }

    try {
      const dataUrl = await simulateUpload(file);
      onChange(dataUrl);
      setPreviewError(false);
      
      notifications.show({
        title: 'Upload Successful',
        message: `${file.name} uploaded successfully`,
        color: 'green',
        icon: <IconCheck size={16} />
      });
    } catch (error) {
      const errorMessage = 'Failed to upload image. Please try again.';
      onError?.(errorMessage);
      notifications.show({
        title: 'Upload Failed',
        message: errorMessage,
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
    }
  }, [onChange, onError, maxSize]);

  const handleReject = useCallback((fileRejections: any[]) => {
    const file = fileRejections[0]?.file;
    let message = 'File rejected';
    
    if (file) {
      if (file.size > maxSize) {
        message = `File too large. Maximum size is ${formatFileSize(maxSize)}`;
      } else if (!IMAGE_MIME_TYPE.includes(file.type as any)) {
        message = `Invalid file type. Please upload ${acceptedFormats.join(', ')} files only`;
      }
    }

    onError?.(message);
    notifications.show({
      title: 'Upload Error',
      message,
      color: 'red',
      icon: <IconAlertCircle size={16} />
    });
  }, [maxSize, acceptedFormats, onError]);

  const handleRemove = () => {
    onChange('');
    setPreviewError(false);
    setUploadProgress(0);
  };

  const handlePreviewError = () => {
    setPreviewError(true);
  };

  const openPreview = () => {
    if (value) {
      window.open(value, '_blank');
    }
  };

  return (
    <Stack gap="xs">
      {label && (
        <Text size="sm" fw={500}>
          {label}
          {required && <Text component="span" c="red" ml={4}>*</Text>}
        </Text>
      )}

      <Dropzone
        onDrop={handleDrop}
        onReject={handleReject}
        maxSize={maxSize}
        accept={IMAGE_MIME_TYPE}
        multiple={false}
        disabled={disabled || isUploading}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        style={{
          borderColor: dragActive 
            ? 'var(--mantine-color-blue-5)' 
            : value && !previewError 
              ? 'var(--mantine-color-green-5)' 
              : undefined,
          backgroundColor: dragActive 
            ? 'var(--mantine-color-blue-0)' 
            : undefined,
          transition: 'all 0.2s ease'
        }}
      >
        <Group justify="center" gap="xl" style={{ minHeight: 120, pointerEvents: 'none' }}>
          {value && !previewError ? (
            <Card withBorder p="sm" style={{ pointerEvents: 'auto' }}>
              <Stack gap="sm" align="center">
                <Image
                  src={value}
                  alt="Uploaded image"
                  width={previewSize}
                  height={previewSize}
                  fit="cover"
                  radius="sm"
                  onError={handlePreviewError}
                  style={{ border: '2px solid var(--mantine-color-green-5)' }}
                />
                
                <Group gap="xs">
                  <Tooltip label="Preview image">
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={openPreview}
                    >
                      <IconEye size={14} />
                    </ActionIcon>
                  </Tooltip>
                  
                  <Tooltip label="Remove image">
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      color="red"
                      onClick={handleRemove}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                
                <Text size="xs" c="green" ta="center">
                  Image uploaded successfully
                </Text>
              </Stack>
            </Card>
          ) : previewError ? (
            <Stack align="center" gap="sm">
              <IconAlertCircle size={48} color="var(--mantine-color-red-5)" />
              <div>
                <Text size="sm" c="red" ta="center">
                  Failed to load image preview
                </Text>
                <Text size="xs" c="dimmed" ta="center">
                  The image may be corrupted or in an unsupported format
                </Text>
              </div>
              <Button
                size="xs"
                variant="light"
                color="red"
                leftSection={<IconRefresh size={12} />}
                onClick={handleRemove}
              >
                Try again
              </Button>
            </Stack>
          ) : (
            <Stack align="center" gap="sm">
              <IconUpload 
                size={48} 
                color={dragActive ? "var(--mantine-color-blue-5)" : "var(--mantine-color-dimmed)"} 
              />
              <div>
                <Text size="sm" ta="center">
                  {dragActive ? 'Drop image here' : description}
                </Text>
                <Text size="xs" c="dimmed" ta="center">
                  {acceptedFormats.join(', ')} up to {formatFileSize(maxSize)}
                </Text>
                {placeholder && (
                  <Text size="xs" c="dimmed" ta="center" mt={4}>
                    {placeholder}
                  </Text>
                )}
              </div>
            </Stack>
          )}
        </Group>
      </Dropzone>

      {/* Upload Progress */}
      {isUploading && (
        <Box>
          <Group justify="space-between" mb={4}>
            <Text size="xs" c="dimmed">Uploading...</Text>
            <Text size="xs" c="dimmed">{Math.round(uploadProgress)}%</Text>
          </Group>
          <Progress value={uploadProgress} size="sm" animated />
        </Box>
      )}

      {/* Help Text */}
      {!value && !isUploading && (
        <Alert
          icon={<IconPhoto size={16} />}
          color="blue"
          variant="light"
        >
          <Text size="xs">
            Upload a custom icon image or use the emoji/URL field above. 
            Images will be automatically resized and optimized.
          </Text>
        </Alert>
      )}
    </Stack>
  );
}