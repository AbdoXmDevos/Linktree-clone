"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ProgressSteps from "../../components/ProgressSteps";
import ImageUpload from "../../components/ImageUpload";
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Textarea,
  Button,
  Stack,
  Alert,
  Group,
  Avatar,
  Box,
  Center,
  Loader,
  Anchor,
} from "@mantine/core";
import { IconCheck, IconX, IconUser } from "@tabler/icons-react";

export default function CreateProfilePage() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  useEffect(() => {
    if (!userId) {
      router.push("/signup");
    }
  }, [userId, router]);

  // Check username availability
  const checkUsername = async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const res = await fetch(`/api/profiles/check-username?username=${username}`);
      const data = await res.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error("Error checking username:", error);
    } finally {
      setCheckingUsername(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username) {
        checkUsername(username);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setError("User ID is missing. Please sign up again.");
      return;
    }

    if (!usernameAvailable) {
      setError("Please choose an available username.");
      return;
    }

    if (!displayName.trim()) {
      setError("Display name is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          username,
          displayName,
          bio,
          avatarUrl: avatarUrl || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/add-links?profileId=${data.profile.id}`);
      } else {
        const data = await res.json();
        setError(data.error || "Profile creation failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <Box style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
        <Center h="100vh">
          <Stack align="center" gap="md">
            <Loader color="dark" size="lg" />
            <Text c="dark.6">Redirecting to signup...</Text>
          </Stack>
        </Center>
      </Box>
    );
  }

  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <Container size="md" py="xl">
        <Stack gap="xl" align="center">
          {/* Progress Stepper */}
          <Box style={{ width: "100%", maxWidth: 600 }}>
            <ProgressSteps
              currentStep={1}
              steps={["Create Profile", "Add Links", "Dashboard"]}
            />
          </Box>

          {/* Main Content */}
          <Paper
            shadow="md"
            p="2rem"
            radius="lg"
            withBorder
            style={{ 
              width: "100%", 
              maxWidth: 500,
              border: "2px solid #000000"
            }}
          >
            <Stack gap="xl">
              <Stack gap="sm" align="center">
                <Title order={1} size="1.75rem" ta="center" c="black" fw={600}>
                  Create Your Profile
                </Title>
                <Text size="md" c="dark.6" ta="center" style={{ lineHeight: 1.5 }}>
                  Set up your basic profile information to get started with your personal link page
                </Text>
              </Stack>

              <form onSubmit={handleSubmit}>
                <Stack gap="lg">
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

                  {/* Username */}
                  <Stack gap="xs">
                    <TextInput
                      label="Username"
                      description="This will be your unique URL: yoursite.com/username"
                      placeholder="your-username"
                      required
                      size="md"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                      rightSection={
                        username && (
                          checkingUsername ? (
                            <Loader size="sm" color="dark" />
                          ) : usernameAvailable === true ? (
                            <IconCheck size={18} color="#51cf66" />
                          ) : usernameAvailable === false ? (
                            <IconX size={18} color="#fa5252" />
                          ) : null
                        )
                      }
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
                    {username && (
                      <Text size="sm" fw={500} c={
                        checkingUsername ? "dark.5" :
                        usernameAvailable === true ? "green.6" :
                        usernameAvailable === false ? "red.6" : "dark.5"
                      }>
                        {checkingUsername ? "Checking availability..." :
                         usernameAvailable === true ? "✓ Username available" :
                         usernameAvailable === false ? "✗ Username taken" : ""}
                      </Text>
                    )}
                  </Stack>

                  {/* Display Name */}
                  <TextInput
                    label="Display Name"
                    description="This is how your name will appear on your profile"
                    placeholder="Your Display Name"
                    required
                    size="md"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
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

                  {/* Bio */}
                  <Textarea
                    label="Bio"
                    description="Tell people about yourself (optional)"
                    placeholder="Tell people about yourself..."
                    rows={3}
                    size="md"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
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

                  {/* Profile Picture Upload */}
                  <Box>
                    <Text size="sm" fw={600} c="black" mb="xs">
                      Profile Picture
                    </Text>
                    <Text size="xs" c="dark.6" mb="md">
                      Upload a profile picture to personalize your page (optional)
                    </Text>
                    {username ? (
                      <ImageUpload
                        onImageUpload={setAvatarUrl}
                        username={username}
                        currentImageUrl={avatarUrl}
                        disabled={loading}
                      />
                    ) : (
                      <Group>
                        <Avatar size="xl" color="dark" variant="light">
                          <IconUser size={32} />
                        </Avatar>
                        <Text size="sm" c="dark.5">
                          Enter a username first to upload your profile picture
                        </Text>
                      </Group>
                    )}
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    color="dark"
                    loading={loading}
                    disabled={!usernameAvailable || checkingUsername}
                    mt="lg"
                    styles={{
                      root: {
                        height: "48px",
                        fontSize: "1rem",
                        fontWeight: 600,
                      },
                    }}
                  >
                    {loading ? "Creating profile..." : "Create Profile & Continue"}
                  </Button>

                  <Center>
                    <Anchor
                      component={Link}
                      href="/login"
                      size="sm"
                      c="dark.6"
                      td="underline"
                    >
                      Skip for now and sign in later
                    </Anchor>
                  </Center>
                </Stack>
              </form>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}