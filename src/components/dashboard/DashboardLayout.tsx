"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Container,
  Loader,
  Center,
  Stack,
  Text,
  AppShell,
  Tabs,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";

// Types
export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Link {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  order_index: number;
  created_at: Date;
}

export interface DashboardState {
  links: Link[];
  selectedLink: Link | null;
  isAddingLink: boolean;
  isLoading: boolean;
}

export function DashboardLayout() {
  const { data: session } = useSession();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // State management
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    links: [],
    selectedLink: null,
    isAddingLink: false,
    isLoading: true,
  });
  const [activeTab, setActiveTab] = useState<string>("manage");

  // Fetch profile data
  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  // Fetch links when profile is loaded
  useEffect(() => {
    if (profile?.id) {
      fetchLinks();
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/profiles?userId=${session?.user?.id}`);
      if (res.ok) {
        const profileData = await res.json();
        setProfile(profileData);
      } else if (res.status === 404) {
        // Profile doesn't exist, redirect to create profile
        router.push(`/create-profile?userId=${session?.user?.id}`);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchLinks = async () => {
    try {
      setDashboardState(prev => ({ ...prev, isLoading: true }));
      const res = await fetch(`/api/links?profileId=${profile?.id}`);
      if (res.ok) {
        const linksData = await res.json();
        setDashboardState(prev => ({
          ...prev,
          links: linksData,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching links:", error);
      setDashboardState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Update dashboard state
  const updateDashboardState = (updates: Partial<DashboardState>) => {
    setDashboardState(prev => ({ ...prev, ...updates }));
  };

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

  // Mobile layout with tabs
  if (isMobile) {
    return (
      <Box style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
        <AppShell
          header={{ height: 0 }}
          navbar={{ width: 0, breakpoint: "sm" }}
          padding="md"
        >
          <AppShell.Main>
            <Tabs value={activeTab} onChange={(value) => setActiveTab(value || "manage")} keepMounted={false}>
              <Tabs.List grow>
                <Tabs.Tab value="manage">Manage Links</Tabs.Tab>
                <Tabs.Tab value="preview">Preview</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="manage" pt="md">
                <LeftPanel
                  profile={profile}
                  dashboardState={dashboardState}
                  updateDashboardState={updateDashboardState}
                  onRefreshLinks={fetchLinks}
                />
              </Tabs.Panel>

              <Tabs.Panel value="preview" pt="md">
                <RightPanel
                  profile={profile}
                  links={dashboardState.links}
                />
              </Tabs.Panel>
            </Tabs>
          </AppShell.Main>
        </AppShell>
      </Box>
    );
  }

  // Desktop and tablet layout with split panels
  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <Container size="xl" px="md" py="md">
        <Grid gutter="lg" style={{ minHeight: "calc(100vh - 2rem)" }}>
          {/* Left Panel - Management Interface */}
          <Grid.Col 
            span={{ base: 12, md: isTablet ? 7 : 6 }}
            style={{ 
              borderRight: isTablet ? "none" : "1px solid #e9ecef",
              paddingRight: isTablet ? "0" : "1rem"
            }}
          >
            <LeftPanel
              profile={profile}
              dashboardState={dashboardState}
              updateDashboardState={updateDashboardState}
              onRefreshLinks={fetchLinks}
            />
          </Grid.Col>

          {/* Right Panel - Preview Interface */}
          <Grid.Col 
            span={{ base: 12, md: isTablet ? 5 : 6 }}
            style={{ 
              paddingLeft: isTablet ? "0" : "1rem",
              marginTop: isTablet ? "1rem" : "0"
            }}
          >
            <RightPanel
              profile={profile}
              links={dashboardState.links}
            />
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}