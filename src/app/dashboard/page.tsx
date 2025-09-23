"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProgressSteps from "../../components/ProgressSteps";
import { AuthGuard } from "../../components/AuthGuard";
import {
  Container,
  Grid,
  Card,
  Text,
  Title,
  Button,
  Stack,
  Group,
  Avatar,
  Badge,
  Box,
  Loader,
  Center,
  Anchor,
  Alert,
  Modal,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import ImageUpload from "../../components/ImageUpload";
import { IconExternalLink, IconPlus, IconEye, IconEdit, IconLogout } from "@tabler/icons-react";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface Link {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  order_index: number;
}

function DashboardContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showSetupComplete, setShowSetupComplete] = useState(false);

  // Edit Profile Modal
  const [opened, { open, close }] = useDisclosure(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    bio: "",
    avatarUrl: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (searchParams?.get("setupComplete") === "true") {
      setShowSetupComplete(true);
      // Remove the query parameter from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);

      // Hide the message after 10 seconds
      setTimeout(() => {
        setShowSetupComplete(false);
      }, 10000);
    }
  }, [searchParams]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

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
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchLinks = async () => {
    try {
      const res = await fetch(`/api/links?profileId=${profile?.id}`);
      if (res.ok) {
        const linksData = await res.json();
        setLinks(linksData);
      }
    } catch (error) {
      console.error("Error fetching links:", error);
    }
  };

  const handleEditProfile = () => {
    if (profile) {
      setEditForm({
        displayName: profile.display_name || "",
        bio: profile.bio || "",
        avatarUrl: profile.avatar_url || "",
      });
      setEditError("");
      open();
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile || !editForm.displayName.trim()) {
      setEditError("Display name is required");
      return;
    }

    setEditLoading(true);
    setEditError("");

    try {
      const res = await fetch("/api/profiles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          displayName: editForm.displayName,
          bio: editForm.bio,
          avatarUrl: editForm.avatarUrl,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        close();
        // Show success message or notification here if needed
      } else {
        const data = await res.json();
        setEditError(data.error || "Failed to update profile");
      }
    } catch (error) {
      setEditError("An error occurred. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <Box style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
        <Center h="100vh">
          <Stack align="center" gap="md">
            <Loader color="dark" size="lg" />
            <Text c="dark.6">Loading profile...</Text>
          </Stack>
        </Center>
      </Box>
    );
  }

  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          {/* Welcome Message */}
          {showSetupComplete && (
            <Alert
              color="green"
              title="🎉 Setup Complete!"
              radius="md"
              style={{ border: "1px solid #51cf66" }}
            >
              <Stack gap="md">
                <ProgressSteps
                  currentStep={4}
                  steps={["Create Profile", "Add Links", "Dashboard"]}
                />
                <Text c="dark.7">
                  Welcome to your dashboard. Your profile is live and ready to share!
                </Text>
              </Stack>
            </Alert>
          )}

          <Grid>
            {/* User Info Card */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card padding="lg" radius="md" withBorder>
                <Title order={2} size="h3" mb="md" c="black">
                  Account Information
                </Title>
                <Stack gap="xs">
                  <Group>
                    <Text fw={500} c="dark.8">Email:</Text>
                    <Text c="dark.6">{session.user?.email}</Text>
                  </Group>
                  <Group>
                    <Text fw={500} c="dark.8">Name:</Text>
                    <Text c="dark.6">{session.user?.name || "Not provided"}</Text>
                  </Group>
                  <Group>
                    <Text fw={500} c="dark.8">User ID:</Text>
                    <Text c="dark.6" size="sm">{session.user?.id}</Text>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>

            {/* Profile Info Card */}
            {profile && (
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card padding="lg" radius="md" withBorder>
                  <Title order={2} size="h3" mb="md" c="black">
                    Profile Information
                  </Title>
                  <Stack gap="xs">
                    <Group>
                      <Text fw={500} c="dark.8">Username:</Text>
                      <Text c="dark.6">@{profile.username}</Text>
                    </Group>
                    <Group>
                      <Text fw={500} c="dark.8">Display Name:</Text>
                      <Text c="dark.6">{profile.display_name || "Not set"}</Text>
                    </Group>
                    <Group>
                      <Text fw={500} c="dark.8">Bio:</Text>
                      <Text c="dark.6">{profile.bio || "No bio yet"}</Text>
                    </Group>
                    {profile.avatar_url && (
                      <Group>
                        <Text fw={500} c="dark.8">Avatar:</Text>
                        <Avatar src={profile.avatar_url} alt="Profile avatar" size="md" />
                      </Group>
                    )}
                    <Group>
                      <Text fw={500} c="dark.8">Profile URL:</Text>
                      <Anchor
                        href={`/${profile.username}`}
                        target="_blank"
                        c="dark.8"
                        td="underline"
                      >
                        /{profile.username}
                      </Anchor>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            )}
          </Grid>

          {/* Links Section */}
          {profile && (
            <Card padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="md">
                <Group>
                  <Title order={2} size="h3" c="black">
                    Your Links
                  </Title>
                  <Badge color="dark" variant="light">
                    {links.length}
                  </Badge>
                </Group>
                <Button
                  leftSection={<IconPlus size={16} />}
                  color="dark"
                  onClick={() => router.push(`/add-links?profileId=${profile.id}`)}
                >
                  {links.length === 0 ? "Add Your First Link" : "Manage Links"}
                </Button>
              </Group>

              {links.length === 0 ? (
                <Center py="xl">
                  <Stack align="center" gap="xs">
                    <Text c="dark.5" size="lg">No links added yet</Text>
                    <Text c="dark.4" size="sm" ta="center">
                      Add links to your social media, website, or anything you want to share
                    </Text>
                  </Stack>
                </Center>
              ) : (
                <Stack gap="sm">
                  {links.slice(0, 5).map((link) => (
                    <Card
                      key={link.id}
                      padding="md"
                      radius="sm"
                      withBorder
                      style={{ backgroundColor: "#f8f9fa" }}
                    >
                      <Group justify="space-between">
                        <Group>
                          {link.icon && (
                            <Text size="lg">{link.icon}</Text>
                          )}
                          <Stack gap={2}>
                            <Text fw={500} c="dark.8">{link.title}</Text>
                            <Text size="sm" c="dark.5" style={{ maxWidth: 300 }} truncate>
                              {link.url}
                            </Text>
                          </Stack>
                        </Group>
                        <Button
                          component="a"
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="light"
                          color="dark"
                          size="xs"
                          rightSection={<IconExternalLink size={14} />}
                        >
                          Visit
                        </Button>
                      </Group>
                    </Card>
                  ))}
                  {links.length > 5 && (
                    <Text size="sm" c="dark.5" ta="center" pt="sm">
                      And {links.length - 5} more links...
                    </Text>
                  )}
                </Stack>
              )}
            </Card>
          )}

          {/* Quick Actions */}
          <Card padding="lg" radius="md" withBorder>
            <Title order={2} size="h3" mb="md" c="black">
              Quick Actions
            </Title>
            <Group>
              {profile && (
                <>
                  <Button
                    leftSection={<IconEdit size={16} />}
                    variant="outline"
                    color="dark"
                    onClick={handleEditProfile}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    color="dark"
                    onClick={() => router.push(`/add-links?profileId=${profile.id}`)}
                  >
                    Manage Links
                  </Button>
                  <Button
                    component="a"
                    href={`/${profile.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    leftSection={<IconEye size={16} />}
                    variant="light"
                    color="dark"
                  >
                    View Public Profile
                  </Button>
                </>
              )}
              <Button
                leftSection={<IconLogout size={16} />}
                variant="outline"
                color="red"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign Out
              </Button>
            </Group>
          </Card>
        </Stack>
      </Container>

      {/* Edit Profile Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Title order={2} size="h3" c="black">
            Edit Profile
          </Title>
        }
        size="md"
        radius="md"
        styles={{
          header: {
            borderBottom: "1px solid #e9ecef",
            paddingBottom: "1rem",
          },
          body: {
            paddingTop: "1.5rem",
          },
        }}
      >
        <form onSubmit={handleUpdateProfile}>
          <Stack gap="lg">
            {editError && (
              <Alert color="red" radius="md">
                {editError}
              </Alert>
            )}

            <TextInput
              label="Display Name"
              description="This is how your name will appear on your profile"
              placeholder="Your Display Name"
              required
              size="md"
              value={editForm.displayName}
              onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
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

            <Textarea
              label="Bio"
              description="Tell people about yourself (optional)"
              placeholder="Tell people about yourself..."
              rows={3}
              size="md"
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
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

            {profile && (
              <Box>
                <Text size="sm" fw={600} c="black" mb="xs">
                  Profile Picture
                </Text>
                <Text size="xs" c="dark.6" mb="md">
                  Update your profile picture (optional)
                </Text>
                <ImageUpload
                  onImageUpload={(url) => setEditForm({ ...editForm, avatarUrl: url })}
                  username={profile.username}
                  currentImageUrl={editForm.avatarUrl}
                  disabled={editLoading}
                />
              </Box>
            )}

            <Group justify="flex-end" gap="md" mt="xl">
              <Button
                variant="outline"
                color="dark"
                onClick={close}
                disabled={editLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="dark"
                loading={editLoading}
                leftSection={<IconEdit size={16} />}
              >
                {editLoading ? "Updating..." : "Update Profile"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}