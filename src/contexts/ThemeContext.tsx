"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMantineColorScheme } from '@mantine/core';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface CustomTheme {
  primaryColor: string;
  backgroundStyle: 'solid' | 'gradient' | 'image';
  backgroundValue: string;
  borderRadius: 'sm' | 'md' | 'lg' | 'xl';
  glassEffect: boolean;
}

interface ThemeContextType {
  mode: ThemeMode;
  customTheme: CustomTheme;
  setMode: (mode: ThemeMode) => void;
  updateCustomTheme: (theme: Partial<CustomTheme>) => void;
  resetTheme: () => void;
}

const defaultCustomTheme: CustomTheme = {
  primaryColor: '#3b82f6',
  backgroundStyle: 'solid',
  backgroundValue: '#ffffff',
  borderRadius: 'lg',
  glassEffect: false,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [mode, setMode] = useState<ThemeMode>('light');
  const [customTheme, setCustomTheme] = useState<CustomTheme>(defaultCustomTheme);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
    const savedCustomTheme = localStorage.getItem('custom-theme');

    if (savedMode) {
      setMode(savedMode);
      if (savedMode === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setColorScheme(prefersDark ? 'dark' : 'light');
      } else {
        setColorScheme(savedMode);
      }
    }

    if (savedCustomTheme) {
      try {
        const parsed = JSON.parse(savedCustomTheme);
        setCustomTheme({ ...defaultCustomTheme, ...parsed });
      } catch (error) {
        console.warn('Failed to parse saved custom theme:', error);
      }
    }
  }, [setColorScheme]);

  // Apply custom theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply primary color
    root.style.setProperty('--color-primary-custom', customTheme.primaryColor);
    
    // Apply background style
    switch (customTheme.backgroundStyle) {
      case 'solid':
        root.style.setProperty('--bg-custom', customTheme.backgroundValue);
        break;
      case 'gradient':
        root.style.setProperty('--bg-custom', customTheme.backgroundValue);
        break;
      case 'image':
        root.style.setProperty('--bg-custom', `url(${customTheme.backgroundValue})`);
        break;
    }
    
    // Apply border radius
    root.style.setProperty('--radius-custom', `var(--radius-${customTheme.borderRadius})`);
    
    // Apply glass effect
    root.classList.toggle('glass-enabled', customTheme.glassEffect);
  }, [customTheme]);

  // Handle auto mode system preference changes
  useEffect(() => {
    if (mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setColorScheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [mode, setColorScheme]);

  const handleSetMode = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);

    if (newMode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setColorScheme(prefersDark ? 'dark' : 'light');
    } else {
      setColorScheme(newMode);
    }
  };

  const updateCustomTheme = (updates: Partial<CustomTheme>) => {
    const newTheme = { ...customTheme, ...updates };
    setCustomTheme(newTheme);
    localStorage.setItem('custom-theme', JSON.stringify(newTheme));
  };

  const resetTheme = () => {
    setCustomTheme(defaultCustomTheme);
    localStorage.removeItem('custom-theme');
    
    // Reset CSS variables
    const root = document.documentElement;
    root.style.removeProperty('--color-primary-custom');
    root.style.removeProperty('--bg-custom');
    root.style.removeProperty('--radius-custom');
    root.classList.remove('glass-enabled');
  };

  const value: ThemeContextType = {
    mode,
    customTheme,
    setMode: handleSetMode,
    updateCustomTheme,
    resetTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for getting current theme values
export function useThemeValues() {
  const { mode, customTheme } = useTheme();
  const { colorScheme } = useMantineColorScheme();

  return {
    isDark: colorScheme === 'dark',
    isLight: colorScheme === 'light',
    mode,
    customTheme,
    effectiveColorScheme: colorScheme,
  };
}