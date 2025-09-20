"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
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
} from "@mantine/core";
import { IconLogin } from "@tabler/icons-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
                  Sign in to your account
                </Title>
                <Text size="sm" c="dark.6" ta="center">
                  Or{" "}
                  <Anchor
                    component={Link}
                    href="/signup"
                    c="dark.8"
                    td="underline"
                  >
                    create a new account
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
                    placeholder="Enter your password"
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
                    leftSection={<IconLogin size={16} />}
                    mt="md"
                  >
                    {loading ? "Signing in..." : "Sign in"}
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
