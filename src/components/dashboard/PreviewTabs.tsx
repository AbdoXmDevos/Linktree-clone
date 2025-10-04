"use client";

import { useState } from "react";
import { Stack, Title, Text, Avatar, Group, Box, Image, Tabs, Skeleton, Card, Center } from "@mantine/core";
import { IconLink, IconAlertCircle, IconDeviceMobile, IconDeviceTablet, IconDeviceDesktop } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import type { Profile } from "../../../db/schema";
import type { Link } from "../../../types/dashboard";
import { colors, shadows, borderRadius, animation } from "../../styles/design-tokens";
import { LinkCardPreview } from "./LinkCardPreview";
import { PreviewHeader } from "./PreviewHeader";
import { useTheme } from "../../contexts/ThemeContext";
import { FadeIn, SlideIn, AnimatedCard } from "../animations/AnimatedComponents";
import { AnimatePresence, motion } from "framer-motion";

interface PreviewTabsProps {
    profile: Profile;
    links: Link[];
    isLoading?: boolean;
}

type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface DeviceFrameProps {
    children: React.ReactNode;
    deviceType: DeviceType;
    isLoading?: boolean;
}

// Enhanced helper function to render link icons with improved styling
function LinkIcon({ icon, title, size = 32 }: { icon?: string | null; title: string; size?: number }) {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Consistent square container for all icon types with modern styling
    const iconContainerStyle = {
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
        flexShrink: 0,
        transition: animation.duration.normal,
        background: colors.gradients.glass,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${colors.neutral[200]}`,
    };

    if (!icon) {
        return (
            <Box style={{ 
                ...iconContainerStyle, 
                backgroundColor: colors.neutral[50],
                border: `1px solid ${colors.neutral[200]}` 
            }}>
                <IconLink size={size * 0.5} color={colors.neutral[500]} />
            </Box>
        );
    }

    // Check if icon is likely an emoji
    const isEmoji = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/u.test(icon);

    if (isEmoji) {
        return (
            <Box style={{ 
                ...iconContainerStyle, 
                backgroundColor: colors.neutral[50],
                fontSize: `${size * 0.6}px`,
                fontFamily: 'system-ui'
            }}>
                {icon}
            </Box>
        );
    }

    // Handle image URLs
    const isImageUrl = /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i.test(icon);

    if (isImageUrl && !imageError) {
        return (
            <Box style={{ ...iconContainerStyle, position: 'relative', overflow: 'hidden' }}>
                {isLoading && (
                    <Skeleton 
                        width={size} 
                        height={size} 
                        radius="md"
                        style={{ position: 'absolute', top: 0, left: 0 }}
                    />
                )}
                <Image
                    src={icon}
                    alt={`Icon for ${title}`}
                    width={size}
                    height={size}
                    radius="md"
                    style={{
                        objectFit: 'cover',
                        width: '100%',
                        height: '100%',
                        opacity: isLoading ? 0 : 1,
                        transition: `opacity ${animation.duration.normal}`,
                    }}
                    onLoad={() => setIsLoading(false)}
                    onLoadStart={() => setIsLoading(true)}
                    onError={() => {
                        setImageError(true);
                        setIsLoading(false);
                    }}
                />
            </Box>
        );
    }

    // Fallback for failed images or invalid URLs
    return (
        <Box style={{ 
            ...iconContainerStyle, 
            backgroundColor: colors.error[50],
            border: `1px solid ${colors.error[200]}` 
        }}>
            <IconAlertCircle size={size * 0.5} color={colors.error[500]} />
        </Box>
    );
}

// Device frame component with accurate dimensions and modern styling
function DeviceFrame({ children, deviceType, isLoading = false }: DeviceFrameProps) {
    const deviceConfig = {
        mobile: {
            width: 280,
            height: 580,
            borderRadius: 32,
            padding: 8,
            screenRadius: 24,
            shadow: shadows.xl,
        },
        tablet: {
            width: 400,
            height: 520,
            borderRadius: 24,
            padding: 6,
            screenRadius: 18,
            shadow: shadows.lg,
        },
        desktop: {
            width: 600,
            height: 400,
            borderRadius: 12,
            padding: 4,
            screenRadius: 8,
            shadow: shadows.md,
        },
    };

    const config = deviceConfig[deviceType];

    if (isLoading) {
        return (
            <Box
                style={{
                    width: config.width,
                    height: config.height,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Skeleton width={config.width} height={config.height} radius={config.borderRadius} />
            </Box>
        );
    }

    return (
        <Box
            style={{
                width: config.width,
                height: config.height,
                backgroundColor: deviceType === 'desktop' ? colors.neutral[100] : colors.neutral[900],
                borderRadius: config.borderRadius,
                padding: config.padding,
                position: 'relative',
                boxShadow: config.shadow,
                transition: `all ${animation.duration.normal} ${animation.easing.inOut}`,
                transform: 'scale(1)',
            }}
            className="device-frame"
        >
            {/* Device-specific decorations */}
            {deviceType === 'mobile' && (
                <>
                    {/* Dynamic Island */}
                    <Box
                        style={{
                            position: 'absolute',
                            top: 12,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 60,
                            height: 6,
                            backgroundColor: colors.neutral[900],
                            borderRadius: borderRadius.full,
                            zIndex: 10,
                        }}
                    />
                    {/* Home indicator */}
                    <Box
                        style={{
                            position: 'absolute',
                            bottom: 8,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 40,
                            height: 4,
                            backgroundColor: colors.neutral[900],
                            borderRadius: borderRadius.full,
                            zIndex: 10,
                        }}
                    />
                </>
            )}

            {deviceType === 'tablet' && (
                <>
                    {/* Home button */}
                    <Box
                        style={{
                            position: 'absolute',
                            bottom: 12,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 20,
                            height: 20,
                            backgroundColor: colors.neutral[900],
                            borderRadius: borderRadius.full,
                            border: `2px solid ${colors.neutral[700]}`,
                            zIndex: 10,
                        }}
                    />
                </>
            )}

            {/* Screen */}
            <Box
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: colors.neutral[50],
                    borderRadius: config.screenRadius,
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.1)',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}

// Enhanced Mobile Preview with profile-like design
function EnhancedMobilePreview({ profile, links, isLoading }: PreviewTabsProps) {
    const displayName = profile.display_name || profile.username;
    const sortedLinks = [...links].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    const content = (
        <Stack align="center" gap="sm" p="lg" style={{ 
            height: "100%", 
            justifyContent: "flex-start", 
            paddingTop: "1.5rem",
            overflowY: "auto",
            scrollBehavior: "smooth"
        }}>
            {/* Enhanced Profile Header */}
            <PreviewHeader 
                profile={profile} 
                variant="compact" 
                isLoading={isLoading}
            />

            {/* Enhanced Links */}
            <Box mt="sm" style={{ width: "100%", maxWidth: "200px" }}>
                <LinkCardPreview 
                    links={sortedLinks} 
                    isLoading={isLoading}
                    variant="compact"
                    showSkeleton={true}
                />
            </Box>
        </Stack>
    );

    return (
        <FadeIn>
            <DeviceFrame deviceType="mobile" isLoading={isLoading}>
                {content}
            </DeviceFrame>
        </FadeIn>
    );
}

// Enhanced Tablet Preview with optimized layout
function EnhancedTabletPreview({ profile, links, isLoading }: PreviewTabsProps) {
    const displayName = profile.display_name || profile.username;
    const sortedLinks = [...links].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    const content = (
        <Stack align="center" gap="md" p="xl" style={{ 
            height: "100%", 
            justifyContent: "flex-start",
            overflowY: "auto",
            scrollBehavior: "smooth"
        }}>
            {/* Enhanced Profile Header */}
            <PreviewHeader 
                profile={profile} 
                variant="default" 
                isLoading={isLoading}
            />

            {/* Enhanced Links */}
            <Box mt="md" style={{ width: "100%", maxWidth: "320px" }}>
                <LinkCardPreview 
                    links={sortedLinks} 
                    isLoading={isLoading}
                    variant="default"
                    showSkeleton={true}
                />
            </Box>
        </Stack>
    );

    return (
        <FadeIn>
            <DeviceFrame deviceType="tablet" isLoading={isLoading}>
                {content}
            </DeviceFrame>
        </FadeIn>
    );
}

// Enhanced Desktop Preview with professional layout
function EnhancedDesktopPreview({ profile, links, isLoading }: PreviewTabsProps) {
    const displayName = profile.display_name || profile.username;
    const sortedLinks = [...links].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    const content = (
        <Box
            style={{
                background: colors.gradients.glass,
                backdropFilter: "blur(20px)",
                borderRadius: borderRadius.xl,
                padding: "2rem",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
            }}
        >
            <Box
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: borderRadius.xl,
                    padding: "2rem",
                    maxWidth: "480px",
                    width: "100%",
                    boxShadow: shadows.lg,
                    border: `1px solid ${colors.neutral[200]}`,
                    backdropFilter: "blur(10px)"
                }}
            >
                <Stack align="center" gap="lg">
                    {/* Enhanced Profile Header */}
                    <PreviewHeader 
                        profile={profile} 
                        variant="elevated" 
                        showBadge={false}
                        isLoading={isLoading}
                    />

                    {/* Enhanced Links */}
                    <Box mt="lg" style={{ width: "100%", maxWidth: "400px" }}>
                        <LinkCardPreview 
                            links={sortedLinks} 
                            isLoading={isLoading}
                            variant="elevated"
                            showSkeleton={true}
                        />
                    </Box>
                </Stack>
            </Box>
        </Box>
    );

    return (
        <FadeIn>
            <DeviceFrame deviceType="desktop" isLoading={isLoading}>
                {content}
            </DeviceFrame>
        </FadeIn>
    );
}

export function PreviewTabs({ profile, links, isLoading = false }: PreviewTabsProps) {
    const [activeTab, setActiveTab] = useState<DeviceType>("mobile");
    const isMobile = useMediaQuery("(max-width: 768px)");
    const { theme, isDark } = useTheme();

    const tabConfig = [
        { 
            value: 'mobile' as DeviceType, 
            label: 'Mobile', 
            icon: IconDeviceMobile,
            description: 'iPhone & Android'
        },
        { 
            value: 'tablet' as DeviceType, 
            label: 'Tablet', 
            icon: IconDeviceTablet,
            description: 'iPad & Tablets'
        },
        { 
            value: 'desktop' as DeviceType, 
            label: 'Desktop', 
            icon: IconDeviceDesktop,
            description: 'Laptop & Desktop'
        },
    ];

    const renderPreview = () => {
        switch (activeTab) {
            case 'mobile':
                return <EnhancedMobilePreview profile={profile} links={links} isLoading={isLoading} />;
            case 'tablet':
                return <EnhancedTabletPreview profile={profile} links={links} isLoading={isLoading} />;
            case 'desktop':
                return <EnhancedDesktopPreview profile={profile} links={links} isLoading={isLoading} />;
            default:
                return <EnhancedMobilePreview profile={profile} links={links} isLoading={isLoading} />;
        }
    };

    return (
        <Stack gap="lg" style={{ height: "100%" }} className="preview-tabs-container">
            {/* Header */}
            <Stack align="center" gap="xs">
                <Title order={2} size="h2" c="black" ta="center" fw={700} style={{
                    background: colors.gradients.primary,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}>
                    Live Preview
                </Title>
                <Text c="dimmed" size="sm" ta="center" fw={500}>
                    See how your profile looks across all devices
                </Text>
            </Stack>

            {/* Enhanced Tabs */}
            <Tabs 
                value={activeTab} 
                onChange={(value) => setActiveTab(value as DeviceType)}
                variant="pills"
                radius="lg"
                style={{ width: "100%" }}
            >
                <Tabs.List justify="center" style={{
                    backgroundColor: colors.neutral[100],
                    padding: "4px",
                    borderRadius: borderRadius.xl,
                    border: `1px solid ${colors.neutral[200]}`,
                    backdropFilter: "blur(10px)",
                }}>
                    {tabConfig.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <Tabs.Tab
                                key={tab.value}
                                value={tab.value}
                                leftSection={<Icon size={16} />}
                                style={{
                                    fontWeight: 500,
                                    transition: `all ${animation.duration.normal}`,
                                    borderRadius: borderRadius.lg,
                                    padding: "8px 16px",
                                }}
                                data-active={activeTab === tab.value}
                            >
                                {isMobile ? tab.label.charAt(0) : tab.label}
                            </Tabs.Tab>
                        );
                    })}
                </Tabs.List>

                {/* Preview Content with smooth transitions */}
                <Box 
                    mt="lg" 
                    style={{ 
                        flex: 1, 
                        display: "flex", 
                        justifyContent: "center", 
                        alignItems: "flex-start",
                        minHeight: "400px",
                        position: "relative"
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ 
                                opacity: isLoading ? 0.7 : 1, 
                                scale: isLoading ? 0.98 : 1,
                                y: 0
                            }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            transition={{ 
                                duration: 0.3, 
                                ease: "easeInOut" 
                            }}
                        >
                            {renderPreview()}
                        </motion.div>
                    </AnimatePresence>
                </Box>

                {/* Device Info */}
                <Center mt="md">
                    <Text size="xs" c="dimmed" ta="center" style={{ 
                        maxWidth: "300px",
                        lineHeight: 1.4
                    }}>
                        {tabConfig.find(tab => tab.value === activeTab)?.description} • 
                        Responsive scaling based on available space
                    </Text>
                </Center>
            </Tabs>
        </Stack>
    );
}