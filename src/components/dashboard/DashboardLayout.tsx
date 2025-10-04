"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Grid,
  Container,
  Loader,
  Center,
  Stack,
  Text,
  Button,
  Group,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import { DashboardHeader } from "./DashboardHeader";
import { FloatingActionButton } from "./FloatingActionButton";
import { PageTransition } from "../animations/AnimatedComponents";
import { ErrorBoundary } from "../error/ErrorBoundary";
import { OfflineIndicator } from "../ui/OfflineIndicator";
import { NonBlockingLoader } from "../ui/NonBlockingLoader";

import type { Profile } from "../../../db/schema";
import type { Link, EnhancedDashboardState } from "../../../types/dashboard";
import { fetchLinks as fetchLinksAction } from "../../lib/actions/links";

export function DashboardLayout() {
  const { data: session } = useSession();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px) and (min-width: 769px)");
  const isDesktop = useMediaQuery("(min-width: 1025px)");
  
  // Refs to track fetch status and prevent unnecessary refetches
  const hasFetchedProfile = useRef(false);
  const hasFetchedLinks = useRef(false);
  const lastUserId = useRef<string | null>(null);

  // Enhanced state management with persistence
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dashboardState, setDashboardState] = useState<EnhancedDashboardState>(() => {
    // Try to restore state from sessionStorage
    if (typeof window !== 'undefined') {
      const savedState = sessionStorage.getItem('dashboardState');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          return {
            ...parsed,
            // Core data
            profile: null,
            analytics: null,
            categories: [],
            
            // UI state
            selectedLinks: [],
            draggedLink: null,
            previewMode: 'mobile' as const,
            sidebarCollapsed: false,
            
            // Form state
            activeForm: null,
            formData: {
              title: '',
              url: '',
              description: '',
              icon: '',
              tags: [],
              customStyling: {
                backgroundColor: '#ffffff',
                textColor: '#000000',
                borderRadius: 8,
                borderColor: '#e2e8f0',
                borderWidth: 1,
                fontSize: 16,
                fontWeight: 'normal' as const,
                shadow: false,
              },
              isFeatured: false,
            },
            
            // Loading states
            isLoading: true,
            isSaving: false,
            isLoadingAnalytics: false,
            
            // Error handling
            error: null,
            errors: {},
            notifications: [],
          };
        } catch (e) {
          console.warn('Failed to parse saved dashboard state:', e);
        }
      }
    }
    return {
      // Core data
      links: [],
      selectedLink: null,
      isAddingLink: false,
      profile: null,
      analytics: null,
      categories: [],
      
      // UI state
      selectedLinks: [],
      draggedLink: null,
      previewMode: 'mobile' as const,
      sidebarCollapsed: false,
      
      // Form state
      activeForm: null,
      formData: {
        title: '',
        url: '',
        description: '',
        icon: '',
        tags: [],
        customStyling: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          borderRadius: 8,
          borderColor: '#e2e8f0',
          borderWidth: 1,
          fontSize: 16,
          fontWeight: 'normal' as const,
          shadow: false,
        },
        isFeatured: false,
      },
      
      // Loading states
      isLoading: true,
      isSaving: false,
      isLoadingAnalytics: false,
      
      // Error handling
      error: null,
      errors: {},
      notifications: [],
    };
  });
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Restore active tab from sessionStorage
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('activeTab') || "manage";
    }
    return "manage";
  });

  // Header interaction states
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showDashboardSettings, setShowDashboardSettings] = useState(false);

  // Fetch profile data - only when session user ID changes and we don't have a profile
  useEffect(() => {
    if (session?.user?.id && !profile) {
      fetchProfile();
    }
  }, [session?.user?.id, profile]);



  // Persist dashboard state to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stateToSave = {
        links: dashboardState.links,
        selectedLink: dashboardState.selectedLink,
        isAddingLink: dashboardState.isAddingLink,
        previewMode: dashboardState.previewMode,
        sidebarCollapsed: dashboardState.sidebarCollapsed,
      };
      sessionStorage.setItem('dashboardState', JSON.stringify(stateToSave));
    }
  }, [dashboardState.links, dashboardState.selectedLink, dashboardState.isAddingLink, dashboardState.previewMode, dashboardState.sidebarCollapsed]);

  // Persist active tab to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('activeTab', activeTab);
    }
  }, [activeTab]);

  // Enhanced data fetching with error handling
  const fetchProfile = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId || hasFetchedProfile.current && lastUserId.current === userId) {
      return; // Skip if already fetched for this user
    }

    try {
      setDashboardState(prev => ({ ...prev, error: null }));
      const res = await fetch(`/api/profiles?userId=${userId}`);
      if (res.ok) {
        const response = await res.json();
        if (response.success && response.data) {
          setProfile(response.data);
          hasFetchedProfile.current = true;
          lastUserId.current = userId;
          // Set loading to false if no links need to be fetched
          if (!response.data.id) {
            setDashboardState(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          throw new Error("Invalid response format");
        }
      } else if (res.status === 404) {
        // Profile doesn't exist, redirect to create profile
        router.push(`/create-profile?userId=${userId}`);
      } else {
        throw new Error(`Failed to fetch profile: ${res.status}`);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load profile";
      setDashboardState(prev => ({ ...prev, error: errorMessage }));
      notifications.show({
        title: "Error",
        message: "Failed to load profile. Please try again.",
        color: "red",
      });
    }
  }, [session?.user?.id, router]);

  const fetchLinks = useCallback(async () => {
    if (!profile?.id || (hasFetchedLinks.current && dashboardState.links.length > 0)) {
      return; // Skip if already fetched and we have links
    }
    
    try {
      setDashboardState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await fetchLinksAction(profile.id);
      
      if (result.success && result.data) {
        setDashboardState(prev => ({
          ...prev,
          links: result.data || [],
          isLoading: false,
        }));
        hasFetchedLinks.current = true;
      } else {
        const errorMessage = result.error?.message || "Failed to load links";
        setDashboardState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: errorMessage 
        }));
        
        // Show appropriate notification based on error type
        if (result.error?.type === 'network') {
          notifications.show({
            title: "Connection Error",
            message: result.error.message,
            color: "orange",
            autoClose: result.error.retryable ? 8000 : 5000,
          });
        } else {
          notifications.show({
            title: "Error",
            message: errorMessage,
            color: "red",
            autoClose: 5000,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching links:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load links";
      setDashboardState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      notifications.show({
        title: "Unexpected Error",
        message: "An unexpected error occurred. Please try again.",
        color: "red",
        autoClose: 5000,
      });
    }
  }, [profile?.id, dashboardState.links.length]);

  // Fetch links when profile is loaded - only when profile ID changes
  useEffect(() => {
    if (profile?.id) {
      fetchLinks();
    }
  }, [profile?.id]);

  // Ensure loading is false when both profile and links are ready
  useEffect(() => {
    if (profile && hasFetchedLinks.current) {
      setDashboardState(prev => ({ ...prev, isLoading: false }));
    }
  }, [profile, dashboardState.links]);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (dashboardState.isLoading && profile) {
        console.warn("Dashboard loading timeout - forcing loading to false");
        setDashboardState(prev => ({ ...prev, isLoading: false }));
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [dashboardState.isLoading, profile]);

  // Reset fetch flags when user changes
  useEffect(() => {
    const currentUserId = session?.user?.id;
    if (currentUserId && currentUserId !== lastUserId.current) {
      hasFetchedProfile.current = false;
      hasFetchedLinks.current = false;
      lastUserId.current = currentUserId;
    }
  }, [session?.user?.id]);

  // Manual refresh function that bypasses the cache
  const forceRefreshLinks = useCallback(async () => {
    hasFetchedLinks.current = false;
    await fetchLinks();
  }, [fetchLinks]);

  // Manual refresh profile function
  const forceRefreshProfile = useCallback(async () => {
    hasFetchedProfile.current = false;
    await fetchProfile();
  }, [fetchProfile]);

  // Enhanced state update functions
  const updateDashboardState = useCallback((updates: Partial<EnhancedDashboardState>) => {
    setDashboardState(prev => ({ ...prev, ...updates }));
  }, []);

  // State management helpers
  const setSelectedLink = useCallback((link: Link | null) => {
    updateDashboardState({ selectedLink: link });
  }, [updateDashboardState]);

  const setIsAddingLink = useCallback((isAdding: boolean) => {
    updateDashboardState({ isAddingLink: isAdding });
  }, [updateDashboardState]);

  const setIsSaving = useCallback((isSaving: boolean) => {
    updateDashboardState({ isSaving });
  }, [updateDashboardState]);

  const clearError = useCallback(() => {
    updateDashboardState({ error: null });
  }, [updateDashboardState]);

  // Add link to state (optimistic update)
  const addLinkToState = useCallback((newLink: Link) => {
    setDashboardState(prev => ({
      ...prev,
      links: [...prev.links, newLink].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
    }));
  }, []);

  // Update link in state (optimistic update)
  const updateLinkInState = useCallback((updatedLink: Link) => {
    setDashboardState(prev => ({
      ...prev,
      links: prev.links.map(link => 
        link.id === updatedLink.id ? updatedLink : link
      ).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
      selectedLink: prev.selectedLink?.id === updatedLink.id ? updatedLink : prev.selectedLink,
    }));
  }, []);

  // Remove link from state (optimistic update)
  const removeLinkFromState = useCallback((linkId: string) => {
    setDashboardState(prev => ({
      ...prev,
      links: prev.links.filter(link => link.id !== linkId),
      selectedLink: prev.selectedLink?.id === linkId ? null : prev.selectedLink,
    }));
  }, []);

  // Loading state
  if (!profile || dashboardState.isLoading) {
    return (
      <Box style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
        <Center h="100vh">
          <Stack align="center" gap="md">
            <Loader color="dark" size="lg" />
            <Text c="dark.6">Loading dashboard...</Text>
          </Stack>
        </Center>
      </Box>
    );
  }

  // Mobile layout with enhanced tab navigation (preserving left-right split)
  if (isMobile) {
    return (
      <ErrorBoundary level="page" showDetails={process.env.NODE_ENV === 'development'}>
        <Box 
          style={{ 
            minHeight: "100vh", 
            backgroundColor: "#ffffff",
            transition: "all 0.3s ease"
          }}
          className="safe-area-all"
        >
          <DashboardHeader
            profile={profile}
            onProfileClick={() => setShowProfileSettings(true)}
            onSettingsClick={() => setShowDashboardSettings(true)}
          />
          
          <Box
            style={{
              height: "calc(100vh - 60px - env(safe-area-inset-bottom, 0px))",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Mobile Tab Navigation */}
            <Box
              style={{
                display: "flex",
                borderBottom: "1px solid #e9ecef",
                backgroundColor: "white",
                position: "sticky",
                top: 0,
                zIndex: 100,
              }}
            >
              <Button
                variant={activeTab === "manage" ? "filled" : "subtle"}
                onClick={() => setActiveTab("manage")}
                style={{
                  flex: 1,
                  borderRadius: 0,
                  minHeight: "48px",
                  fontSize: "14px",
                  fontWeight: activeTab === "manage" ? 600 : 400,
                }}
                className="touch-target"
              >
                Manage Links
              </Button>
              <Button
                variant={activeTab === "preview" ? "filled" : "subtle"}
                onClick={() => setActiveTab("preview")}
                style={{
                  flex: 1,
                  borderRadius: 0,
                  minHeight: "48px",
                  fontSize: "14px",
                  fontWeight: activeTab === "preview" ? 600 : 400,
                }}
                className="touch-target"
              >
                Preview
              </Button>
            </Box>

            {/* Content Area */}
            <Box
              style={{
                flex: 1,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Left Panel - Management Interface */}
              <Box
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  transform: `translateX(${activeTab === "manage" ? "0%" : "-100%"})`,
                  transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  overflow: "auto",
                  WebkitOverflowScrolling: "touch",
                  padding: "16px",
                }}
                className="mobile-content"
              >
                <LeftPanel
                  profile={profile}
                  dashboardState={dashboardState}
                  updateDashboardState={updateDashboardState}
                  onRefreshLinks={forceRefreshLinks}
                  onRefreshProfile={forceRefreshProfile}
                  setSelectedLink={setSelectedLink}
                  setIsAddingLink={setIsAddingLink}
                  setIsSaving={setIsSaving}
                  clearError={clearError}
                  addLinkToState={addLinkToState}
                  updateLinkInState={updateLinkInState}
                  removeLinkFromState={removeLinkFromState}
                />
              </Box>

              {/* Right Panel - Preview Interface */}
              <Box
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  transform: `translateX(${activeTab === "preview" ? "0%" : "100%"})`,
                  transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  overflow: "auto",
                  WebkitOverflowScrolling: "touch",
                  padding: "16px",
                }}
                className="mobile-content"
              >
                <RightPanel
                  profile={profile}
                  links={dashboardState.links}
                  isLoading={dashboardState.isLoading}
                />
              </Box>
            </Box>
          </Box>

          {/* Profile Settings Modal */}
          {showProfileSettings && (
            <Box
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
              }}
              onClick={() => setShowProfileSettings(false)}
            >
              <Box
                className="mobile-modal"
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '2rem',
                  maxWidth: '90vw',
                  width: '100%',
                  maxHeight: '80vh',
                  overflow: 'auto',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Text size="lg" fw={600} mb="md">Profile Settings</Text>
                <Text c="dimmed" mb="lg">
                  Profile settings functionality will be implemented in a future task.
                </Text>
                <Group justify="flex-end">
                  <Button 
                    variant="light" 
                    onClick={() => setShowProfileSettings(false)}
                    className="touch-target"
                  >
                    Close
                  </Button>
                </Group>
              </Box>
            </Box>
          )}

          {/* Dashboard Settings Modal */}
          {showDashboardSettings && (
            <Box
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
              }}
              onClick={() => setShowDashboardSettings(false)}
            >
              <Box
                className="mobile-modal"
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '2rem',
                  maxWidth: '90vw',
                  width: '100%',
                  maxHeight: '80vh',
                  overflow: 'auto',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Text size="lg" fw={600} mb="md">Dashboard Settings</Text>
                <Text c="dimmed" mb="lg">
                  Dashboard settings functionality will be implemented in a future task.
                </Text>
                <Group justify="flex-end">
                  <Button 
                    variant="light" 
                    onClick={() => setShowDashboardSettings(false)}
                    className="touch-target"
                  >
                    Close
                  </Button>
                </Group>
              </Box>
            </Box>
          )}

          {/* Floating Action Button for Mobile */}
          <Box
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              zIndex: 999,
            }}
          >
            <Button
              onClick={() => setIsAddingLink(true)}
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#3B82F6",
                border: "none",
                boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                color: "white",
              }}
              className="touch-target"
            >
              +
            </Button>
          </Box>

          {/* Offline Indicator */}
          <OfflineIndicator position="bottom-left" compact />

          {/* Non-blocking Loading Indicators */}
          <NonBlockingLoader position="top-right" />
        </Box>
      </ErrorBoundary>
    );
  }

  // Desktop and tablet layout with enhanced responsive design
  return (
    <ErrorBoundary level="page" showDetails={process.env.NODE_ENV === 'development'}>
      <PageTransition>
        <Box 
          style={{ 
            minHeight: "100vh", 
            backgroundColor: "#ffffff",
            transition: "all 0.3s ease"
          }}
          className="layout-transition"
        >
          <DashboardHeader
            profile={profile}
            onProfileClick={() => setShowProfileSettings(true)}
            onSettingsClick={() => setShowDashboardSettings(true)}
          />
          
          <Container 
            size={isDesktop ? "xl" : "lg"} 
            px={isTablet ? "sm" : "md"} 
            py={isTablet ? "sm" : "md"}
          >
            <Grid 
              gutter={isTablet ? "md" : "lg"} 
              style={{ 
                minHeight: `calc(100vh - ${isTablet ? "1rem" : "2rem"})`,
                transition: "all 0.3s ease"
              }}
            >
              {/* Left Panel - Management Interface */}
              <Grid.Col 
                span={{ base: 12, md: 6, lg: 6 }}
                style={{ 
                  borderRight: isDesktop ? "1px solid #e9ecef" : "none",
                  paddingRight: isDesktop ? "1rem" : "0",
                  transition: "all 0.3s ease"
                }}
              >
                <LeftPanel
                  profile={profile}
                  dashboardState={dashboardState}
                  updateDashboardState={updateDashboardState}
                  onRefreshLinks={fetchLinks}
                  onRefreshProfile={forceRefreshProfile}
                  setSelectedLink={setSelectedLink}
                  setIsAddingLink={setIsAddingLink}
                  setIsSaving={setIsSaving}
                  clearError={clearError}
                  addLinkToState={addLinkToState}
                  updateLinkInState={updateLinkInState}
                  removeLinkFromState={removeLinkFromState}
                />
              </Grid.Col>

              {/* Right Panel - Preview Interface */}
              <Grid.Col 
                span={{ base: 12, md: 6, lg: 6 }}
                style={{ 
                  paddingLeft: isDesktop ? "1rem" : "0",
                  transition: "all 0.3s ease"
                }}
              >
                <RightPanel
                  profile={profile}
                  links={dashboardState.links}
                  isLoading={dashboardState.isLoading}
                />
              </Grid.Col>
            </Grid>
          </Container>

      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <Box
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowProfileSettings(false)}
        >
          <Box
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Text size="lg" fw={600} mb="md">Profile Settings</Text>
            <Text c="dimmed" mb="lg">
              Profile settings functionality will be implemented in a future task.
            </Text>
            <Group justify="flex-end">
              <Button variant="light" onClick={() => setShowProfileSettings(false)}>
                Close
              </Button>
            </Group>
          </Box>
        </Box>
      )}

      {/* Dashboard Settings Modal */}
      {showDashboardSettings && (
        <Box
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowDashboardSettings(false)}
        >
          <Box
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Text size="lg" fw={600} mb="md">Dashboard Settings</Text>
            <Text c="dimmed" mb="lg">
              Dashboard settings functionality will be implemented in a future task.
            </Text>
            <Group justify="flex-end">
              <Button variant="light" onClick={() => setShowDashboardSettings(false)}>
                Close
              </Button>
            </Group>
          </Box>
        </Box>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton
        onAddLink={() => setIsAddingLink(true)}
        onAddFeaturedLink={() => {
          // TODO: Implement featured link creation
          setIsAddingLink(true);
        }}
        onAddCategory={() => {
          // TODO: Implement category creation
          console.log("Add category");
        }}
      />

      {/* Offline Indicator */}
      <OfflineIndicator position="bottom-right" />

      {/* Non-blocking Loading Indicators */}
      <NonBlockingLoader position="top-right" />
      </Box>
    </PageTransition>
    </ErrorBoundary>
  );
}