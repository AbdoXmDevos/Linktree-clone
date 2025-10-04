// Responsive typography system
export const responsiveTypography = {
  // Display text (hero sections, main headings)
  display: {
    mobile: {
      fontSize: "28px",
      lineHeight: "32px",
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    tablet: {
      fontSize: "36px",
      lineHeight: "40px",
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    desktop: {
      fontSize: "48px",
      lineHeight: "56px",
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
  },

  // Heading 1 (page titles)
  h1: {
    mobile: {
      fontSize: "24px",
      lineHeight: "28px",
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    tablet: {
      fontSize: "30px",
      lineHeight: "36px",
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    desktop: {
      fontSize: "36px",
      lineHeight: "44px",
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
  },

  // Heading 2 (section titles)
  h2: {
    mobile: {
      fontSize: "20px",
      lineHeight: "24px",
      fontWeight: 600,
      letterSpacing: "0",
    },
    tablet: {
      fontSize: "22px",
      lineHeight: "28px",
      fontWeight: 600,
      letterSpacing: "0",
    },
    desktop: {
      fontSize: "24px",
      lineHeight: "32px",
      fontWeight: 600,
      letterSpacing: "0",
    },
  },

  // Heading 3 (subsection titles)
  h3: {
    mobile: {
      fontSize: "18px",
      lineHeight: "22px",
      fontWeight: 600,
      letterSpacing: "0",
    },
    tablet: {
      fontSize: "19px",
      lineHeight: "24px",
      fontWeight: 600,
      letterSpacing: "0",
    },
    desktop: {
      fontSize: "20px",
      lineHeight: "28px",
      fontWeight: 600,
      letterSpacing: "0",
    },
  },

  // Body large (important content)
  bodyLarge: {
    mobile: {
      fontSize: "16px",
      lineHeight: "24px",
      fontWeight: 400,
      letterSpacing: "0",
    },
    tablet: {
      fontSize: "17px",
      lineHeight: "26px",
      fontWeight: 400,
      letterSpacing: "0",
    },
    desktop: {
      fontSize: "18px",
      lineHeight: "28px",
      fontWeight: 400,
      letterSpacing: "0",
    },
  },

  // Body (standard content)
  body: {
    mobile: {
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: 400,
      letterSpacing: "0",
    },
    tablet: {
      fontSize: "15px",
      lineHeight: "22px",
      fontWeight: 400,
      letterSpacing: "0",
    },
    desktop: {
      fontSize: "16px",
      lineHeight: "24px",
      fontWeight: 400,
      letterSpacing: "0",
    },
  },

  // Body small (secondary content)
  bodySmall: {
    mobile: {
      fontSize: "13px",
      lineHeight: "18px",
      fontWeight: 400,
      letterSpacing: "0",
    },
    tablet: {
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: 400,
      letterSpacing: "0",
    },
    desktop: {
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: 400,
      letterSpacing: "0",
    },
  },

  // Caption (labels, metadata)
  caption: {
    mobile: {
      fontSize: "12px",
      lineHeight: "16px",
      fontWeight: 400,
      letterSpacing: "0.01em",
    },
    tablet: {
      fontSize: "12px",
      lineHeight: "16px",
      fontWeight: 400,
      letterSpacing: "0.01em",
    },
    desktop: {
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: 400,
      letterSpacing: "0.01em",
    },
  },

  // Button text
  button: {
    mobile: {
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: 500,
      letterSpacing: "0.01em",
    },
    tablet: {
      fontSize: "15px",
      lineHeight: "22px",
      fontWeight: 500,
      letterSpacing: "0.01em",
    },
    desktop: {
      fontSize: "16px",
      lineHeight: "24px",
      fontWeight: 500,
      letterSpacing: "0.01em",
    },
  },
};

// Responsive spacing scale
export const responsiveSpacing = {
  // Extra small spacing
  xs: {
    mobile: "4px",
    tablet: "4px",
    desktop: "4px",
  },

  // Small spacing
  sm: {
    mobile: "8px",
    tablet: "8px",
    desktop: "8px",
  },

  // Medium spacing
  md: {
    mobile: "12px",
    tablet: "16px",
    desktop: "16px",
  },

  // Large spacing
  lg: {
    mobile: "16px",
    tablet: "20px",
    desktop: "24px",
  },

  // Extra large spacing
  xl: {
    mobile: "20px",
    tablet: "28px",
    desktop: "32px",
  },

  // Extra extra large spacing
  xxl: {
    mobile: "24px",
    tablet: "36px",
    desktop: "48px",
  },

  // Section spacing (between major sections)
  section: {
    mobile: "32px",
    tablet: "48px",
    desktop: "64px",
  },

  // Page spacing (top/bottom page margins)
  page: {
    mobile: "16px",
    tablet: "24px",
    desktop: "32px",
  },
};

// Responsive border radius
export const responsiveBorderRadius = {
  sm: {
    mobile: "4px",
    tablet: "6px",
    desktop: "6px",
  },
  md: {
    mobile: "6px",
    tablet: "8px",
    desktop: "8px",
  },
  lg: {
    mobile: "8px",
    tablet: "12px",
    desktop: "12px",
  },
  xl: {
    mobile: "12px",
    tablet: "16px",
    desktop: "16px",
  },
};

// Responsive shadows
export const responsiveShadows = {
  sm: {
    mobile: "0 1px 2px rgba(0, 0, 0, 0.05)",
    tablet: "0 1px 3px rgba(0, 0, 0, 0.1)",
    desktop: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  md: {
    mobile: "0 2px 4px rgba(0, 0, 0, 0.1)",
    tablet: "0 4px 6px rgba(0, 0, 0, 0.1)",
    desktop: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  lg: {
    mobile: "0 4px 8px rgba(0, 0, 0, 0.1)",
    tablet: "0 8px 15px rgba(0, 0, 0, 0.1)",
    desktop: "0 10px 25px rgba(0, 0, 0, 0.1)",
  },
  xl: {
    mobile: "0 8px 16px rgba(0, 0, 0, 0.15)",
    tablet: "0 15px 30px rgba(0, 0, 0, 0.15)",
    desktop: "0 25px 50px rgba(0, 0, 0, 0.15)",
  },
};

// Utility function to get responsive value
export function getResponsiveValue<T>(
  values: { mobile: T; tablet: T; desktop: T },
  breakpoint: "mobile" | "tablet" | "desktop"
): T {
  return values[breakpoint];
}

// CSS-in-JS helper for responsive styles
export function createResponsiveStyles(
  mobileStyles: Record<string, any>,
  tabletStyles: Record<string, any> = {},
  desktopStyles: Record<string, any> = {}
) {
  return {
    // Base mobile styles
    ...mobileStyles,
    
    // Tablet styles
    "@media (min-width: 769px) and (max-width: 1024px)": {
      ...mobileStyles,
      ...tabletStyles,
    },
    
    // Desktop styles
    "@media (min-width: 1025px)": {
      ...mobileStyles,
      ...tabletStyles,
      ...desktopStyles,
    },
  };
}

// Hook for getting current breakpoint typography
export function useResponsiveTypography(variant: keyof typeof responsiveTypography) {
  // This would typically use a media query hook
  // For now, returning desktop values as default
  return responsiveTypography[variant].desktop;
}

// Hook for getting current breakpoint spacing
export function useResponsiveSpacing(size: keyof typeof responsiveSpacing) {
  // This would typically use a media query hook
  // For now, returning desktop values as default
  return responsiveSpacing[size].desktop;
}