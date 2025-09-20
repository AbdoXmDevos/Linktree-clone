"use client";

import { useState, useRef } from "react";
import { Group, Avatar, Button, Text, Stack, Alert, ActionIcon } from "@mantine/core";
import { IconUpload, IconX, IconUser, IconLoader } from "@tabler/icons-react";

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  username: string;
  currentImageUrl?: string;
  disabled?: boolean;
}

export default function ImageUpload({ 
  onImageUpload, 
  username, 
  currentImageUrl, 
  disabled = false 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (32MB limit)
    if (file.size > 32 * 1024 * 1024) {
      setError("File size too large. Maximum 32MB allowed.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append("image", file);
      formData.append("username", username);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onImageUpload(data.imageUrl);
        setError("");
      } else {
        setError(data.error || "Upload failed");
        setPreview(currentImageUrl || null);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Upload failed. Please try again.");
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500} c="dark.8">
        Profile Picture
      </Text>
      
      <Group>
        {/* Preview */}
        <div style={{ position: "relative" }}>
          {preview ? (
            <div style={{ position: "relative" }}>
              <Avatar
                src={preview}
                alt="Profile preview"
                size="xl"
                style={{ border: "2px solid #000000" }}
              />
              {!disabled && (
                <ActionIcon
                  color="red"
                  size="sm"
                  radius="xl"
                  variant="filled"
                  onClick={handleRemoveImage}
                  disabled={uploading}
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                  }}
                >
                  <IconX size={12} />
                </ActionIcon>
              )}
            </div>
          ) : (
            <Avatar
              size="xl"
              color="dark"
              variant="light"
              style={{ border: "2px dashed #e9ecef" }}
            >
              <IconUser size={32} />
            </Avatar>
          )}
        </div>

        {/* Upload button */}
        <Stack gap="xs" style={{ flex: 1 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: "none" }}
            disabled={disabled || uploading}
          />
          <Button
            variant="outline"
            color="dark"
            leftSection={
              uploading ? (
                <IconLoader size={16} className="animate-spin" />
              ) : (
                <IconUpload size={16} />
              )
            }
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            size="sm"
          >
            {uploading ? "Uploading..." : preview ? "Change Image" : "Upload Image"}
          </Button>
        </Stack>
      </Group>

      {error && (
        <Alert color="red" size="sm">
          {error}
        </Alert>
      )}

      <Text size="xs" c="dark.5">
        Recommended: Square image, max 32MB. Image will be automatically resized and compressed.
      </Text>
    </Stack>
  );
}