"use client";

import { useState } from "react";
import { Stack, Title, Text, Button, TextInput, Avatar, ActionIcon, Group, Box, ThemeIcon, Image } from "@mantine/core";
import { IconCopy, IconLink, IconAlertCircle } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import type { Profile } from "../../../db/schema";
import type { Link } from "../../../types/dashboard";

interface PreviewTabsProps {
    profile: Profile;
    links: Link[];
    isLoading?: boolean;
}

// Helper function to render link icons
function LinkIcon({ icon, title }: { icon?: string | null; title: string }) {
    const [imageError, setImageError] = useState(false);

    // Consistent square container for all icon types
    const iconContainerStyle = {
        width: 32,
        height: 32,
        minWidth: 32,
        minHeight: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        flexShrink: 0
    };

    if (!icon) {
        return (
            <Box style={{ ...iconContainerStyle, backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                <IconLink size={16} color="#6c757d" />
            </Box>
        );
    }

    // Check if icon is likely an emoji
    const isEmoji = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/u.test(icon);

    if (isEmoji) {
        return (
            <Box style={{ ...iconContainerStyle, backgroundColor: '#f8f9fa', fontSize: '18px' }}>
                {icon}
            </Box>
        );
    }

    // Handle image URLs
    const isImageUrl = /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i.test(icon);

    if (isImageUrl && !imageError) {
        return (
            <Box style={iconContainerStyle}>
                <Image
                    src={icon}
                    alt={`Icon for ${title}`}
                    width={32}
                    height={32}
                    radius="6px"
                    style={{
                        objectFit: 'cover',
                        width: '100%',
                        height: '100%'
                    }}
                    onError={() => setImageError(true)}
                />
            </Box>
        );
    }

    // Fallback for failed images or invalid URLs
    return (
        <Box style={{ ...iconContainerStyle, backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}>
            <IconAlertCircle size={16} color="#dc2626" />
        </Box>
    );
}

// Enhanced Mobile Preview with profile-like design
function EnhancedMobilePreview({ profile, links }: PreviewTabsProps) {
    const profileUrl = `http://alfan.link/${profile.username}`;
    const displayName = profile.display_name || profile.username;
    const sortedLinks = [...links].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    return (
        <Stack align="center" gap="xl" style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
            {/* Mobile Frame */}
            <Box
                style={{
                    width: "280px",
                    height: "580px",
                    backgroundColor: "#000",
                    borderRadius: "32px",
                    padding: "8px",
                    position: "relative",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
                }}
            >
                {/* Screen */}
                <Box
                    style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#fff",
                        borderRadius: "24px",
                        overflow: "hidden",
                        position: "relative"
                    }}
                >
                    {/* Profile Content */}
                    <Stack align="center" gap="sm" p="lg" style={{ height: "100%", justifyContent: "flex-start", paddingTop: "2rem" }}>
                        {/* Profile Picture */}
                        <Avatar
                            src={profile.avatar_url}
                            alt={displayName}
                            size={80}
                            radius="50%"
                            style={{
                                border: "3px solid #fff",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                            }}
                        />

                        {/* Name and Stats */}
                        <Stack align="center" gap={2}>
                            <Title order={3} size="h4" c="black" ta="center" fw={700}>
                                {displayName}
                            </Title>
                            {/* You can add follower count logic here if you have it in your data */}
                            <Text size="sm" c="dimmed" ta="center">
                                @{profile.username}
                            </Text>
                        </Stack>

                        {/* Bio */}
                        {profile.bio && (
                            <Text size="sm" c="dark.6" ta="center" style={{ maxWidth: "200px", lineHeight: 1.4 }}>
                                {profile.bio}
                            </Text>
                        )}



                        {/* Links */}
                        <Stack gap="xs" mt="lg" style={{ width: "100%", maxWidth: "220px" }}>
                            {sortedLinks.length > 0 ? (
                                sortedLinks.map((link) => (
                                    <Group
                                        key={link.id}
                                        gap="sm"
                                        p="sm"
                                        align="center"
                                        style={{
                                            backgroundColor: "#f8f9fa",
                                            borderRadius: "8px",
                                            border: "1px solid #e9ecef",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease"
                                        }}
                                    >
                                        <LinkIcon icon={link.icon} title={link.title} />
                                        <Box style={{ flex: 1, minWidth: 0 }}>
                                            <Text size="sm" fw={500} style={{ wordBreak: "break-word" }}>
                                                {link.title}
                                            </Text>
                                            {link.description && (
                                                <Text size="xs" c="dimmed" lineClamp={1}>
                                                    {link.description}
                                                </Text>
                                            )}
                                        </Box>
                                    </Group>
                                ))
                            ) : (
                                <Text size="sm" c="dimmed" ta="center" py="md">
                                    No links added yet
                                </Text>
                            )}
                        </Stack>
                    </Stack>
                </Box>
            </Box>

            {/* URL Input and Save Button */}
            <Group gap="sm" style={{ width: "100%", maxWidth: "400px" }}>
                <TextInput
                    value={profileUrl}
                    readOnly
                    style={{ flex: 1 }}
                    styles={{
                        input: {
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #e9ecef",
                            borderRadius: "8px"
                        }
                    }}
                    rightSection={
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={() => navigator.clipboard.writeText(profileUrl)}
                            style={{ cursor: "pointer" }}
                        >
                            <IconCopy size={16} />
                        </ActionIcon>
                    }
                />
                <Button
                    style={{
                        backgroundColor: "#ffd43b",
                        color: "#000",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: 600
                    }}
                    px="xl"
                >
                    Save
                </Button>
            </Group>
        </Stack>
    );
}

// Desktop preview
function DesktopPreview({ profile, links }: PreviewTabsProps) {
    const displayName = profile.display_name || profile.username;
    const sortedLinks = [...links].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    return (
        <Box
            style={{
                backgroundColor: "#f8f9fa",
                borderRadius: "12px",
                padding: "2rem",
                minHeight: "500px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <Box
                style={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    padding: "3rem",
                    maxWidth: "500px",
                    width: "100%",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    border: "1px solid #e9ecef"
                }}
            >
                <Stack align="center" gap="lg">
                    {/* Profile Picture */}
                    <Avatar
                        src={profile.avatar_url}
                        alt={displayName}
                        size={100}
                        radius="50%"
                        style={{
                            border: "4px solid #fff",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                        }}
                    />

                    {/* Name */}
                    <Stack align="center" gap={4}>
                        <Title order={2} c="black" ta="center" fw={700}>
                            {displayName}
                        </Title>
                        <Text c="dimmed" ta="center">
                            @{profile.username}
                        </Text>
                    </Stack>

                    {/* Bio */}
                    {profile.bio && (
                        <Text size="md" c="dark.6" ta="center" style={{ maxWidth: "400px", lineHeight: 1.5 }}>
                            {profile.bio}
                        </Text>
                    )}

                    {/* Links */}
                    <Stack gap="sm" mt="lg" style={{ width: "100%", maxWidth: "350px" }}>
                        {sortedLinks.length > 0 ? (
                            sortedLinks.map((link) => (
                                <Group
                                    key={link.id}
                                    gap="md"
                                    p="md"
                                    style={{
                                        backgroundColor: "#f8f9fa",
                                        borderRadius: "12px",
                                        border: "2px solid #e9ecef",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease"
                                    }}
                                >
                                    <LinkIcon icon={link.icon} title={link.title} />
                                    <Box style={{ flex: 1, minWidth: 0 }}>
                                        <Text fw={600} c="black" style={{ wordBreak: "break-word" }}>
                                            {link.title}
                                        </Text>
                                        {link.description && (
                                            <Text size="sm" c="dimmed" lineClamp={1}>
                                                {link.description}
                                            </Text>
                                        )}
                                    </Box>
                                </Group>
                            ))
                        ) : (
                            <Text c="dimmed" ta="center" py="xl">
                                No links added yet
                            </Text>
                        )}
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
}

export function PreviewTabs({ profile, links, isLoading = false }: PreviewTabsProps) {
    const [activeTab, setActiveTab] = useState<string | null>("mobile");
    const isMobile = useMediaQuery("(max-width: 768px)");

    return (
        <Stack gap="lg" style={{ height: "100%" }} className="mobile-safe-area">
            {/* Header */}
            <Stack align="center" gap="xs">
                <Title order={2} size="h2" c="black" ta="center" fw={700}>
                    Preview
                </Title>
                <Text c="dimmed" size="sm" ta="center">
                    100% Mirror Screen will display on profile
                </Text>
            </Stack>

            {/* Tabs */}
            <Group justify="center" gap="xs">
                <Button
                    variant={activeTab === "mobile" ? "filled" : "light"}
                    color={activeTab === "mobile" ? "dark" : "gray"}
                    size="sm"
                    radius="md"
                    onClick={() => setActiveTab("mobile")}
                    style={{
                        backgroundColor: activeTab === "mobile" ? "#f1f3f4" : "transparent",
                        color: activeTab === "mobile" ? "#000" : "#666",
                        border: "none",
                        fontWeight: activeTab === "mobile" ? 600 : 400
                    }}
                >
                    Mobile
                </Button>
                <Button
                    variant={activeTab === "desktop" ? "filled" : "light"}
                    color={activeTab === "desktop" ? "dark" : "gray"}
                    size="sm"
                    radius="md"
                    onClick={() => setActiveTab("desktop")}
                    style={{
                        backgroundColor: activeTab === "desktop" ? "#f1f3f4" : "transparent",
                        color: activeTab === "desktop" ? "#000" : "#666",
                        border: "none",
                        fontWeight: activeTab === "desktop" ? 600 : 400
                    }}
                >
                    Desktop
                </Button>
            </Group>

            {/* Preview Content */}
            <Box style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "1rem" }}>
                {activeTab === "mobile" ? (
                    <EnhancedMobilePreview profile={profile} links={links} isLoading={isLoading} />
                ) : (
                    <DesktopPreview profile={profile} links={links} isLoading={isLoading} />
                )}
            </Box>
        </Stack>
    );
}