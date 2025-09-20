import { db } from "../../../lib/db";
import * as schema from "../../../db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Container, Avatar, Text, Title, Paper, Button, Stack, Group, Center, Box } from "@mantine/core";

async function getProfileData(username: string) {
  try {
    // Get profile
    const profile = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.username, username))
      .limit(1);

    if (profile.length === 0) {
      return null;
    }

    // Get links
    const links = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.profile_id, profile[0].id))
      .orderBy(schema.links.order_index);

    return {
      profile: profile[0],
      links,
    };
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return null;
  }
}

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const data = await getProfileData(params.username);

  if (!data) {
    notFound();
  }

  const { profile, links } = data;

  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <Container size="sm" py="xl">
        <Center>
          <Stack align="center" gap="xl" style={{ maxWidth: 400, width: "100%" }}>
            {/* Profile Header */}
            <Stack align="center" gap="md">
              {profile.avatar_url && (
                <Avatar
                  src={profile.avatar_url}
                  alt={profile.display_name || profile.username}
                  size={120}
                  style={{ border: "3px solid #000000" }}
                />
              )}
              <Title order={1} size="h2" c="black" ta="center">
                {profile.display_name || `@${profile.username}`}
              </Title>
              {profile.bio && (
                <Paper
                  p="md"
                  radius="md"
                  style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    maxWidth: 320,
                  }}
                >
                  <Text size="sm" c="dark.7" ta="center" style={{ lineHeight: 1.5 }}>
                    {profile.bio}
                  </Text>
                </Paper>
              )}
            </Stack>

            {/* Links */}
            <Stack gap="md" style={{ width: "100%" }}>
              {links.length === 0 ? (
                <Paper
                  p="xl"
                  radius="md"
                  style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                  }}
                >
                  <Text ta="center" c="dark.6">
                    No links added yet
                  </Text>
                </Paper>
              ) : (
                links.map((link) => (
                  <Button
                    key={link.id}
                    component="a"
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    color="dark"
                    size="lg"
                    radius="md"
                    fullWidth
                    style={{
                      height: "auto",
                      padding: "16px",
                      border: "2px solid #000000",
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      transition: "all 0.2s ease",
                    }}
                    styles={{
                      root: {
                        "&:hover": {
                          backgroundColor: "#000000",
                          color: "#ffffff",
                          transform: "translateY(-2px)",
                        },
                      },
                    }}
                  >
                    <Group gap="sm" justify="center">
                      {link.icon && (
                        <Text size="lg">{link.icon}</Text>
                      )}
                      <Text fw={500} size="md">
                        {link.title}
                      </Text>
                    </Group>
                  </Button>
                ))
              )}
            </Stack>

            {/* Footer */}
            <Text size="xs" c="dark.4" ta="center" mt="xl">
              Powered by Linktree Clone
            </Text>
          </Stack>
        </Center>
      </Container>
    </Box>
  );
}