"use client";

import { Suspense } from "react";
import { AuthGuard } from "../../components/AuthGuard";
import { Box, Loader, Center, Stack, Text } from "@mantine/core";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";

function DashboardContent() {
  return <DashboardLayout />;
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <Box style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
          <Center h="100vh">
            <Stack align="center" gap="md">
              <Loader color="dark" size="lg" />
              <Text c="dark.6">Loading dashboard...</Text>
            </Stack>
          </Center>
        </Box>
      }>
        <DashboardContent />
      </Suspense>
    </AuthGuard>
  );
}