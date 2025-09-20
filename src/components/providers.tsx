"use client";

import { SessionProvider } from "next-auth/react";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";

const theme = createTheme({
  primaryColor: "dark",
  colors: {
    dark: [
      "#f8f9fa",
      "#e9ecef",
      "#dee2e6",
      "#ced4da",
      "#adb5bd",
      "#6c757d",
      "#495057",
      "#343a40",
      "#212529",
      "#000000",
    ],
  },
  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  headings: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MantineProvider theme={theme} defaultColorScheme="light">
        {children}
      </MantineProvider>
    </SessionProvider>
  );
}