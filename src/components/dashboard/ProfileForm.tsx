"use client";

import { useState, useEffect } from "react";
import { Stack, TextInput, Textarea, Button, Avatar, Group, Text, FileInput, Box } from "@mantine/core";
import { IconUser, IconAt, IconFileText, IconPhoto } from "@tabler/icons-react";
import type { Profile } from "../../../db/schema";

interface ProfileFormData {
  display_name: string;
  username: string;
  bio: string;
  avatar_url: string;
}

interface ProfileFormProps {
  profile: Profile;
  onSubmit: (formData: ProfileFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function ProfileForm({ profile, onSubmit, isLoading = false, error }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    display_name: profile.display_name || "",
    username: profile.username || "",
    bio: profile.bio || "",
    avatar_url: profile.avatar_url || "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Update form when profile changes
  useEffect(() => {
    setFormData({
      display_name: profile.display_name || "",
      username: profile.username || "",
      bio: profile.bio || "",
      avatar_url: profile.avatar_url || "",
    });
  }, [profile]);

  // Handle avatar file selection
  useEffect(() => {
    if (avatarFile) {
      const url = URL.createObjectURL(avatarFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [avatarFile]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Handle avatar file upload here
    // For now, we'll just use the existing avatar_url
    const submitData = {
      ...formData,
      avatar_url: previewUrl || formData.avatar_url
    };
    
    await onSubmit(submitData);
  };

  const hasChanges = 
    formData.display_name !== (profile.display_name || "") ||
    formData.bio !== (profile.bio || "") ||
    formData.avatar_url !== (profile.avatar_url || "") ||
    avatarFile !== null;

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="lg">
        {/* Avatar Section */}
        <Box>
          <Text size="sm" fw={500} mb="xs">
            Profile Picture
          </Text>
          <Group gap="md" align="center">
            <Avatar
              src={previewUrl || formData.avatar_url}
              alt={formData.display_name || formData.username}
              size={80}
              radius="md"
            />
            <Stack gap="xs" style={{ flex: 1 }}>
              <FileInput
                placeholder="Choose image file"
                accept="image/*"
                value={avatarFile}
                onChange={setAvatarFile}
                leftSection={<IconPhoto size={16} />}
                size="sm"
              />
              <Text size="xs" c="dimmed">
                Recommended: Square image, at least 400x400px
              </Text>
            </Stack>
          </Group>
        </Box>

        {/* Display Name */}
        <TextInput
          label="Display Name"
          placeholder="Your display name"
          value={formData.display_name}
          onChange={(e) => handleInputChange("display_name", e.target.value)}
          leftSection={<IconUser size={16} />}
          maxLength={50}
        />

        {/* Username */}
        <TextInput
          label="Username"
          value={formData.username}
          leftSection={<IconAt size={16} />}
          description="Username cannot be changed"
          readOnly
          styles={{
            input: {
              backgroundColor: "#f8f9fa",
              color: "#6c757d",
              cursor: "not-allowed"
            }
          }}
        />

        {/* Bio */}
        <Textarea
          label="Bio"
          placeholder="Tell people about yourself..."
          value={formData.bio}
          onChange={(e) => handleInputChange("bio", e.target.value)}
          leftSection={<IconFileText size={16} />}
          minRows={3}
          maxRows={5}
          maxLength={160}
          description={`${formData.bio.length}/160 characters`}
        />

        {/* Error Message */}
        {error && (
          <Text c="red" size="sm">
            {error}
          </Text>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          loading={isLoading}
          disabled={!hasChanges || isLoading}
          fullWidth
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </Stack>
    </form>
  );
}