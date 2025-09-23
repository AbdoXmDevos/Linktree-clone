import Link from "next/link";
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Box,
  Center,
  Paper,
  SimpleGrid,
} from "@mantine/core";
import { IconLink, IconUser, IconShare, IconArrowRight } from "@tabler/icons-react";

export default function Home() {
  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <Container size="lg" py="xl">
        <Stack gap="xl" style={{ minHeight: "90vh" }}>
          {/* Header */}
          <Group justify="space-between" py="md">
            <Title order={2} c="black">
              Cleverlink
            </Title>
            <Group>
              <Button
                component={Link}
                href="/login"
                variant="outline"
                color="dark"
              >
                Sign In
              </Button>
              <Button
                component={Link}
                href="/signup"
                color="dark"
              >
                Get Started
              </Button>
            </Group>
          </Group>

          {/* Hero Section */}
          <Center style={{ flex: 1 }}>
            <Stack align="center" gap="xl" style={{ maxWidth: 600, textAlign: "center" }}>
              <Stack gap="md" align="center">
                <Title
                  order={1}
                  size="3rem"
                  c="black"
                  style={{ lineHeight: 1.2 }}
                >
                  Everything you are.
                  <br />
                  In one simple link.
                </Title>
                <Text size="xl" c="dark.6" style={{ maxWidth: 500 }}>
                  Join millions of people using LinkTree to share everything they create, 
                  curate and sell from their Instagram, TikTok, Twitter, YouTube and other social media profiles.
                </Text>
              </Stack>

              <Group>
                <Button
                  component={Link}
                  href="/signup"
                  size="lg"
                  color="dark"
                  rightSection={<IconArrowRight size={20} />}
                >
                  Get started for free
                </Button>
                <Button
                  component={Link}
                  href="/login"
                  size="lg"
                  variant="outline"
                  color="dark"
                >
                  Sign in
                </Button>
              </Group>
            </Stack>
          </Center>

          {/* Features */}
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" py="xl">
            <Paper p="xl" radius="md" withBorder style={{ textAlign: "center" }}>
              <Stack align="center" gap="md">
                <Box
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    backgroundColor: "#f8f9fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #000000",
                  }}
                >
                  <IconUser size={24} color="#000000" />
                </Box>
                <Title order={3} size="h4" c="black">
                  Create Your Profile
                </Title>
                <Text c="dark.6" size="sm">
                  Set up your personalized profile with your photo, bio, and branding in minutes.
                </Text>
              </Stack>
            </Paper>

            <Paper p="xl" radius="md" withBorder style={{ textAlign: "center" }}>
              <Stack align="center" gap="md">
                <Box
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    backgroundColor: "#f8f9fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #000000",
                  }}
                >
                  <IconLink size={24} color="#000000" />
                </Box>
                <Title order={3} size="h4" c="black">
                  Add Your Links
                </Title>
                <Text c="dark.6" size="sm">
                  Add links to your social media, website, store, videos, music, podcasts, events and more.
                </Text>
              </Stack>
            </Paper>

            <Paper p="xl" radius="md" withBorder style={{ textAlign: "center" }}>
              <Stack align="center" gap="md">
                <Box
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    backgroundColor: "#f8f9fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #000000",
                  }}
                >
                  <IconShare size={24} color="#000000" />
                </Box>
                <Title order={3} size="h4" c="black">
                  Share Everything
                </Title>
                <Text c="dark.6" size="sm">
                  Share your LinkTree from your Instagram, TikTok, Twitter and everywhere else you are.
                </Text>
              </Stack>
            </Paper>
          </SimpleGrid>

          {/* Footer */}
          <Center py="md">
            <Text size="sm" c="dark.4">
              © 2024 LinkTree Clone. Built with Next.js and Mantine.
            </Text>
          </Center>
        </Stack>
      </Container>
    </Box>
  );
}
