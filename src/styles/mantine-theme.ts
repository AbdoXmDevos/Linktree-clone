import { createTheme, MantineColorsTuple, MantineThemeOverride } from '@mantine/core';
import { colors, typography, spacing, borderRadius, shadows } from './design-tokens';

// Convert design tokens to Mantine color tuples
const primaryColors: MantineColorsTuple = [
  colors.primary[50],
  colors.primary[100],
  colors.primary[200],
  colors.primary[300],
  colors.primary[400],
  colors.primary[500],
  colors.primary[600],
  colors.primary[700],
  colors.primary[800],
  colors.primary[900],
];

const secondaryColors: MantineColorsTuple = [
  colors.secondary[50],
  colors.secondary[100],
  colors.secondary[200],
  colors.secondary[300],
  colors.secondary[400],
  colors.secondary[500],
  colors.secondary[600],
  colors.secondary[700],
  colors.secondary[800],
  colors.secondary[900],
];

const successColors: MantineColorsTuple = [
  colors.success[50],
  colors.success[100],
  colors.success[200],
  colors.success[300],
  colors.success[400],
  colors.success[500],
  colors.success[600],
  colors.success[700],
  colors.success[800],
  colors.success[900],
];

const warningColors: MantineColorsTuple = [
  colors.warning[50],
  colors.warning[100],
  colors.warning[200],
  colors.warning[300],
  colors.warning[400],
  colors.warning[500],
  colors.warning[600],
  colors.warning[700],
  colors.warning[800],
  colors.warning[900],
];

const errorColors: MantineColorsTuple = [
  colors.error[50],
  colors.error[100],
  colors.error[200],
  colors.error[300],
  colors.error[400],
  colors.error[500],
  colors.error[600],
  colors.error[700],
  colors.error[800],
  colors.error[900],
];

const neutralColors: MantineColorsTuple = [
  colors.neutral[50],
  colors.neutral[100],
  colors.neutral[200],
  colors.neutral[300],
  colors.neutral[400],
  colors.neutral[500],
  colors.neutral[600],
  colors.neutral[700],
  colors.neutral[800],
  colors.neutral[900],
];

// Enhanced Mantine theme configuration
export const enhancedTheme: MantineThemeOverride = createTheme({
  // Color system
  primaryColor: 'primary',
  colors: {
    primary: primaryColors,
    secondary: secondaryColors,
    success: successColors,
    warning: warningColors,
    error: errorColors,
    neutral: neutralColors,
    // Override default colors
    blue: primaryColors,
    green: successColors,
    yellow: warningColors,
    red: errorColors,
    gray: neutralColors,
  },

  // Typography
  fontFamily: typography.fontFamily.sans,
  fontFamilyMonospace: typography.fontFamily.mono,
  headings: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    sizes: {
      h1: {
        fontSize: typography.fontSize['4xl'],
        lineHeight: typography.lineHeight.tight,
        fontWeight: typography.fontWeight.bold,
      },
      h2: {
        fontSize: typography.fontSize['3xl'],
        lineHeight: typography.lineHeight.tight,
        fontWeight: typography.fontWeight.semibold,
      },
      h3: {
        fontSize: typography.fontSize['2xl'],
        lineHeight: typography.lineHeight.snug,
        fontWeight: typography.fontWeight.semibold,
      },
      h4: {
        fontSize: typography.fontSize.xl,
        lineHeight: typography.lineHeight.snug,
        fontWeight: typography.fontWeight.medium,
      },
      h5: {
        fontSize: typography.fontSize.lg,
        lineHeight: typography.lineHeight.normal,
        fontWeight: typography.fontWeight.medium,
      },
      h6: {
        fontSize: typography.fontSize.base,
        lineHeight: typography.lineHeight.normal,
        fontWeight: typography.fontWeight.medium,
      },
    },
  },

  // Font sizes
  fontSizes: {
    xs: typography.fontSize.xs,
    sm: typography.fontSize.sm,
    md: typography.fontSize.base,
    lg: typography.fontSize.lg,
    xl: typography.fontSize.xl,
  },

  // Spacing
  spacing: {
    xs: spacing[2],
    sm: spacing[3],
    md: spacing[4],
    lg: spacing[6],
    xl: spacing[8],
  },

  // Border radius
  radius: {
    xs: borderRadius.sm,
    sm: borderRadius.base,
    md: borderRadius.md,
    lg: borderRadius.lg,
    xl: borderRadius.xl,
  },

  // Shadows
  shadows: {
    xs: shadows.xs,
    sm: shadows.sm,
    md: shadows.base,
    lg: shadows.lg,
    xl: shadows.xl,
  },

  // Component-specific overrides
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: typography.fontWeight.medium,
          transition: 'all 150ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
      },
      // Note: Variants will be handled through custom CSS classes instead
    },

    Card: {
      defaultProps: {
        radius: 'lg',
        shadow: 'sm',
      },
      styles: {
        root: {
          transition: 'all 200ms ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: shadows.md,
          },
        },
      },
    },

    TextInput: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        input: {
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.normal,
          transition: 'all 150ms ease',
          '&:focus': {
            transform: 'translateY(-1px)',
            boxShadow: shadows.md,
          },
        },
      },
    },

    Textarea: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        input: {
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.normal,
          transition: 'all 150ms ease',
          '&:focus': {
            transform: 'translateY(-1px)',
            boxShadow: shadows.md,
          },
        },
      },
    },

    Select: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        input: {
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.normal,
          transition: 'all 150ms ease',
          '&:focus': {
            transform: 'translateY(-1px)',
            boxShadow: shadows.md,
          },
        },
      },
    },

    Paper: {
      defaultProps: {
        radius: 'lg',
        shadow: 'sm',
      },
    },

    Modal: {
      defaultProps: {
        radius: 'lg',
        shadow: 'xl',
      },
      styles: {
        content: {
          backdropFilter: 'blur(10px)',
        },
      },
    },

    Notification: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
      },
    },

    Tabs: {
      styles: {
        tab: {
          fontWeight: typography.fontWeight.medium,
          transition: 'all 150ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
      },
    },

    ActionIcon: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          transition: 'all 150ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
      },
    },
  },

  // Note: Global styles are handled in globals.css and utilities.css
});