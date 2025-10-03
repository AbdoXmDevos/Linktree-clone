/**
 * Design System Exports
 * Central export file for all design system components
 */

// Export design tokens
export * from './design-tokens';

// Export Mantine theme
export { enhancedTheme } from './mantine-theme';

// Type definitions for design tokens
export type ColorScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950?: string;
};

export type DesignTokens = {
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    success: ColorScale;
    warning: ColorScale;
    error: ColorScale;
    neutral: ColorScale;
    gradients: Record<string, string>;
  };
  typography: {
    fontFamily: Record<string, string>;
    fontSize: Record<string, string>;
    lineHeight: Record<string, string>;
    fontWeight: Record<string, string>;
    letterSpacing: Record<string, string>;
  };
  spacing: Record<string | number, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  zIndex: Record<string, number | string>;
  animation: {
    duration: Record<string, string>;
    easing: Record<string, string>;
  };
  components: Record<string, any>;
};

// Utility functions for working with design tokens
export const getColorValue = (color: string, shade: number = 500): string => {
  // This would be implemented to get color values from the design tokens
  return `var(--color-${color}-${shade})`;
};

export const getSpacingValue = (size: string | number): string => {
  return `var(--spacing-${size})`;
};

export const getShadowValue = (size: string): string => {
  return `var(--shadow-${size})`;
};

export const getRadiusValue = (size: string): string => {
  return `var(--radius-${size})`;
};

// CSS-in-JS helper functions
export const createGlassEffect = (opacity: number = 0.1, blur: number = 10) => ({
  background: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: `blur(${blur}px)`,
  WebkitBackdropFilter: `blur(${blur}px)`,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: 'var(--shadow-glass)',
});

export const createGradientBackground = (type: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral' = 'primary') => ({
  background: `var(--gradient-${type})`,
});

export const createHoverLift = (translateY: number = -2) => ({
  transition: 'transform var(--duration-fast) var(--easing-out)',
  '&:hover': {
    transform: `translateY(${translateY}px)`,
  },
});

export const createFocusRing = (color: string = 'primary') => ({
  outline: '2px solid transparent',
  outlineOffset: '2px',
  transition: 'outline var(--duration-fast) var(--easing-out)',
  '&:focus-visible': {
    outline: `2px solid var(--color-${color}-500)`,
  },
});