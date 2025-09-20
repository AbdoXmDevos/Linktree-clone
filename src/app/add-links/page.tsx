"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import ProgressSteps from "../../components/ProgressSteps";
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Stack,
  Alert,
  Group,
  Card,
  Badge,
  ActionIcon,
  Box,
  Center,
  Loader,
} from "@mantine/core";
import { IconPlus, IconTrash, IconExternalLink, IconLink, IconArrowRight, IconPlayerSkipForward } from "@tabler/icons-react";

interface Link {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  order_index: number;
}

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
}

export default function AddLinksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get("profileId");
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [newLink, setNewLink] = useState({ title: "", url: "", icon: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Only redirect to login if we're sure the user is unauthenticated AND we don't have a profileId
    // This allows the onboarding flow to continue even if session is still loading
    if (status === "unauthenticated" && !profileId) {
      router.push("/login");
    }
  }, [status, router, profileId]);

  useEffect(() => {
    if (!profileId) {
      // Only redirect to dashboard if we don't have a profileId and we're authenticated
      if (status === "authenticated") {
        router.push("/dashboard");
      }
      return;
    }
    
    // Wait for session to load before fetching profile data
    if (status !== "loading") {
      fetchProfile();
      fetchLinks();
    }
  }, [profileId, status]);

  const fetchProfile = async () => {
    try {
      // If we have a session, use the userId from it
      if (session?.user?.id) {
        const res = await fetch(`/api/profiles?userId=${session.user.id}`);
        if (res.ok) {
          const profileData = await res.json();
          setProfile(profileData);
        }
      } else if (profileId) {
        // If we don't have a session yet but have profileId, fetch profile by profileId
        const res = await fetch(`/api/profiles/by-id?profileId=${profileId}`);
        if (res.ok) {
          const profileData = await res.json();
          setProfile(profileData);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchLinks = async () => {
    try {
      const res = await fetch(`/api/links?profileId=${profileId}`);
      if (res.ok) {
        const linksData = await res.json();
        setLinks(linksData);
      }
    } catch (error) {
      console.error("Error fetching links:", error);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newLink.title || !newLink.url) {
      setError("Title and URL are required");
      return;
    }

    // Basic URL validation
    let url = newLink.url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          title: newLink.title,
          url,
          icon: newLink.icon || null,
        }),
      });

      if (res.ok) {
        setNewLink({ title: "", url: "", icon: "" });
        fetchLinks(); // Refresh the links list
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add link");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      const res = await fetch(`/api/links?linkId=${linkId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchLinks(); // Refresh the links list
      }
    } catch (error) {
      console.error("Error deleting link:", error);
    }
  };

  const handleFinish = async () => {
    try {
      // If user is not authenticated, auto-signin them
      if (status !== "authenticated" && profileId) {
        const res = await fetch("/api/auth/auto-signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId }),
        });

        if (res.ok) {
          const data = await res.json();
          // Use NextAuth signIn with special auto-signin credentials
          const result = await signIn("credentials", {
            email: data.user.email,
            password: "AUTO_SIGNIN_ONBOARDING",
            redirect: false,
          });

          if (result?.ok) {
            router.push("/dashboard?setupComplete=true");
          } else {
            router.push("/login?message=Please sign in to continue");
          }
        } else {
          router.push("/login?message=Please sign in to continue");
        }
      } else {
        // User is already authenticated
        router.push("/dashboard?setupComplete=true");
      }
    } catch (error) {
      console.error("Error during finish:", error);
      router.push("/login?message=Please sign in to continue");
    }
  };

  if (status === "loading") {
    return (
      <Box style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
        <Center h="100vh">
          <Stack align="center" gap="md">
            <Loader color="dark" size="lg" />
            <Text c="dark.6">Loading...</Text>
          </Stack>
        </Center>
      </Box>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <Container size="lg" py="xl">
        <Stack gap="xl">
          {/* Progress Stepper */}
          <Box style={{ width: "100%", maxWidth: 800, margin: "0 auto" }}>
            <ProgressSteps 
              currentStep={2} 
              steps={["Create Profile", "Add Links", "Dashboard"]} 
            />
          </Box>

          <Stack align="center" gap="md">
            <Title order={1} size="1.75rem" ta="center" c="black" fw={600}>
              Add Links to Your Profile
            </Title>
            <Text size="md" c="dark.6" ta="center" style={{ lineHeight: 1.5 }}>
              Add links to your social media, website, or anything you want to share with your audience
            </Text>
            <Badge variant="filled" color="dark" size="md" radius="md">
              Profile: @{profile.username}
            </Badge>
          </Stack>

          <Group align="stretch" gap="xl" style={{ maxWidth: 1000, margin: "0 auto" }}>
            {/* Add New Link Form */}
            <Paper 
              shadow="md" 
              p="2rem" 
              radius="lg" 
              withBorder
              style={{ 
                flex: 1,
                minWidth: 400,
                height: "600px",
                border: "2px solid #000000",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <Stack gap="lg" style={{ height: "100%" }}>
                <Stack gap="xs">
                  <Title order={2} size="1.25rem" c="black" fw={600}>
                    Add New Link
                  </Title>
                  <Text size="sm" c="dark.6">
                    Create a new link to add to your profile
                  </Text>
                </Stack>
                
                {error && (
                  <Alert 
                    color="red" 
                    radius="md"
                    styles={{
                      root: {
                        border: "1px solid #fa5252"
                      }
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleAddLink} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <Stack gap="lg" style={{ flex: 1 }}>
                    <TextInput
                      label="Link Title"
                      description="Give your link a descriptive name"
                      placeholder="e.g., My Website, Instagram, YouTube"
                      required
                      size="md"
                      value={newLink.title}
                      onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                      styles={{
                        input: {
                          borderColor: "#000000",
                          borderWidth: "2px",
                          "&:focus": {
                            borderColor: "#000000",
                          },
                        },
                        label: {
                          fontWeight: 600,
                          color: "#000000",
                        },
                        description: {
                          fontSize: "0.8rem",
                        },
                      }}
                    />

                    <TextInput
                      label="URL"
                      description="The web address people will visit"
                      placeholder="e.g., https://example.com or example.com"
                      required
                      size="md"
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      styles={{
                        input: {
                          borderColor: "#000000",
                          borderWidth: "2px",
                          "&:focus": {
                            borderColor: "#000000",
                          },
                        },
                        label: {
                          fontWeight: 600,
                          color: "#000000",
                        },
                        description: {
                          fontSize: "0.8rem",
                        },
                      }}
                    />

                    <TextInput
                      label="Icon (optional)"
                      description="Add an emoji or icon to make your link stand out"
                      placeholder="e.g., 🌐, 📱, 🎵 or any emoji"
                      size="md"
                      value={newLink.icon}
                      onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
                      styles={{
                        input: {
                          borderColor: "#000000",
                          borderWidth: "2px",
                          "&:focus": {
                            borderColor: "#000000",
                          },
                        },
                        label: {
                          fontWeight: 600,
                          color: "#000000",
                        },
                        description: {
                          fontSize: "0.8rem",
                        },
                      }}
                    />

                    <Box style={{ marginTop: "auto" }}>
                      <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        color="dark"
                        loading={loading}
                        leftSection={<IconPlus size={18} />}
                        styles={{
                          root: {
                            height: "48px",
                            fontSize: "1rem",
                            fontWeight: 600,
                          },
                        }}
                      >
                        {loading ? "Adding..." : "Add Link"}
                      </Button>
                    </Box>
                  </Stack>
                </form>
              </Stack>
            </Paper>

            {/* Current Links */}
            <Paper 
              shadow="md" 
              p="2rem" 
              radius="lg" 
              withBorder
              style={{ 
                flex: 1,
                minWidth: 400,
                height: "600px",
                border: "2px solid #000000",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <Stack gap="lg" style={{ height: "100%" }}>
                <Group justify="space-between">
                  <Stack gap="xs">
                    <Title order={2} size="1.25rem" c="black" fw={600}>
                      Your Links
                    </Title>
                    <Text size="sm" c="dark.6">
                      Manage your existing links
                    </Text>
                  </Stack>
                  <Badge color="dark" variant="light" size="lg">
                    {links.length}
                  </Badge>
                </Group>
                
                {/* Scrollable Links Container */}
                <Box 
                  style={{ 
                    flex: 1,
                    overflowY: "auto",
                    paddingRight: "8px",
                    marginRight: "-8px"
                  }}
                >
                  {links.length === 0 ? (
                    <Center style={{ height: "100%" }}>
                      <Stack align="center" gap="md">
                        <IconLink size={64} color="#adb5bd" />
                        <Stack align="center" gap="xs">
                          <Text c="dark.5" size="lg" fw={500}>No links added yet</Text>
                          <Text c="dark.4" size="sm" ta="center">
                            Add your first link using the form on the left!
                          </Text>
                        </Stack>
                      </Stack>
                    </Center>
                  ) : (
                    <Stack gap="md">
                      {links.map((link) => (
                        <Card
                          key={link.id}
                          padding="lg"
                          radius="md"
                          withBorder
                          style={{ 
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #e9ecef",
                            flexShrink: 0
                          }}
                        >
                          <Group justify="space-between">
                            <Group gap="md">
                              {link.icon && (
                                <Text size="xl">{link.icon}</Text>
                              )}
                              <Stack gap={4}>
                                <Text fw={600} c="dark.8" size="md">{link.title}</Text>
                                <Text size="sm" c="dark.5" style={{ maxWidth: 200 }} truncate>
                                  {link.url}
                                </Text>
                              </Stack>
                            </Group>
                            <ActionIcon
                              color="red"
                              variant="light"
                              size="lg"
                              onClick={() => handleDeleteLink(link.id)}
                            >
                              <IconTrash size={18} />
                            </ActionIcon>
                          </Group>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Stack>
            </Paper>
          </Group>

          {/* Action Buttons */}
          <Stack gap="lg" align="center" style={{ maxWidth: 700, margin: "0 auto" }}>
            {/* Primary Action Button */}
            <Button
              onClick={handleFinish}
              size="xl"
              radius="md"
              fullWidth
              color={links.length > 0 ? "green" : "dark"}
              variant={links.length > 0 ? "filled" : "outline"}
              rightSection={links.length > 0 ? <IconArrowRight size={20} /> : <IconPlayerSkipForward size={20} />}
              styles={{
                root: {
                  height: "56px",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  maxWidth: "400px",
                  borderWidth: links.length === 0 ? "2px" : "1px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                  },
                },
              }}
            >
              {links.length > 0 ? "Complete Setup & Go to Dashboard" : "Skip for Now & Go to Dashboard"}
            </Button>

            {/* Secondary Actions */}
            {links.length > 0 && (
              <Group justify="center" gap="md">
                <Button
                  component="a"
                  href={`/${profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="light"
                  color="dark"
                  size="md"
                  leftSection={<IconExternalLink size={16} />}
                  styles={{
                    root: {
                      fontWeight: 500,
                    },
                  }}
                >
                  Preview Profile
                </Button>
              </Group>
            )}

            {/* Help Text */}
            <Text size="md" c="dark.6" ta="center" style={{ maxWidth: 450, lineHeight: 1.5 }}>
              {links.length === 0 ? (
                <>
                  <strong>No worries!</strong> You can always add links later from your dashboard. 
                  Your profile is ready to go.
                </>
              ) : (
                <>
                  <strong>Great job!</strong> You've added {links.length} link{links.length === 1 ? '' : 's'}. 
                  You can add more or edit existing ones anytime from your dashboard.
                </>
              )}
            </Text>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}