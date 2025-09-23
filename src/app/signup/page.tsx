"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Center,
  Anchor,
  Box,
  Loader,
} from "@mantine/core";
import { IconUserPlus } from "@tabler/icons-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        // Redirect to profile creation with the user ID
        router.push(`/create-profile?userId=${data.userId}`);
      } else {
        const data = await res.json();
        setError(data.error || "Signup failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
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

  // Don't render signup form if already authenticated
  if (status === "authenticated") {
    return null;
  }

  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <Container size="sm" py="xl">
        <Center style={{ minHeight: "80vh" }}>
          <Paper
            shadow="sm"
            p="xl"
            radius="md"
            withBorder
            style={{ width: "100%", maxWidth: 400 }}
          >
            <Stack gap="xl">
              <Stack gap="md" align="center">
                <Title order={1} size="h2" ta="center" c="black">
                  Create your account
                </Title>
                <Text size="sm" c="dark.6" ta="center">
                  Or{" "}
                  <Anchor
                    component={Link}
                    href="/login"
                    c="dark.8"
                    td="underline"
                  >
                    sign in to your existing account
                  </Anchor>
                </Text>
              </Stack>

              <form onSubmit={handleSubmit}>
                <Stack gap="md">
                  {error && (
                    <Alert color="red">
                      {error}
                    </Alert>
                  )}

                  <TextInput
                    label="Email address"
                    placeholder="Enter your email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    styles={{
                      input: {
                        borderColor: "#000000",
                        "&:focus": {
                          borderColor: "#000000",
                        },
                      },
                    }}
                  />

                  <PasswordInput
                    label="Password"
                    placeholder="Create a password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    styles={{
                      input: {
                        borderColor: "#000000",
                        "&:focus": {
                          borderColor: "#000000",
                        },
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    size="md"
                    color="dark"
                    loading={loading}
                    leftSection={<IconUserPlus size={16} />}
                    mt="md"
                  >
                    {loading ? "Creating account..." : "Create account"}
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Paper>
        </Center>
      </Container>
    </Box>
  );
}
