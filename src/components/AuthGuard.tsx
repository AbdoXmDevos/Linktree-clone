"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Box, Center, Stack, Loader, Text } from "@mantine/core";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Manual session check as backup
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session-check");
        const data = await response.json();
        
        console.log("Manual session check:", data);
        
        if (!data.authenticated) {
          console.log("Manual check: User not authenticated, redirecting");
          router.push("/login");
          return;
        }
        
        setSessionChecked(true);
      } catch (error) {
        console.error("Session check failed:", error);
        router.push("/login");
      } finally {
        setIsChecking(false);
      }
    };

    // Only do manual check if NextAuth session is taking too long
    const timer = setTimeout(() => {
      if (status === "loading") {
        console.log("Session loading too long, doing manual check");
        checkSession();
      } else {
        setIsChecking(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [status, router]);

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated") {
      console.log("AuthGuard: User is unauthenticated, redirecting to login");
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      setSessionChecked(true);
      setIsChecking(false);
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === "loading" || isChecking || !sessionChecked) {
    return (
      fallback || (
        <Box style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
          <Center h="100vh">
            <Stack align="center" gap="md">
              <Loader color="dark" size="lg" />
              <Text c="dark.6">Checking authentication...</Text>
            </Stack>
          </Center>
        </Box>
      )
    );
  }

  // Don't render children if not authenticated
  if (status === "unauthenticated" || !session) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
}