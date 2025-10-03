"use client";

import { SessionProvider } from "next-auth/react";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { enhancedTheme } from "../styles/mantine-theme";
import { ThemeProvider } from "../contexts/ThemeContext";
import "../styles/css-variables.css";
import "../styles/utilities.css";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true} // Refetch when window gains focus
    >
      <MantineProvider theme={enhancedTheme} defaultColorScheme="light">
        <ThemeProvider>
          <Notifications position="top-right" zIndex={1700} />
          {children}
        </ThemeProvider>
      </MantineProvider>
    </SessionProvider>
  );
}