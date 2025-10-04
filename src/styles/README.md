# Enhanced Design System

This directory contains the comprehensive design system for the dashboard UX enhancement. The design system provides a consistent, professional, and modern foundation for all UI components.

## Structure

```
src/styles/
├── design-tokens.ts      # Core design tokens (colors, typography, spacing)
├── mantine-theme.ts      # Enhanced Mantine theme configuration
├── css-variables.css     # CSS custom properties
├── utilities.css         # Utility classes for modern effects
├── index.ts             # Central export file
└── README.md            # This file
```

## Design Tokens

The design system is built around a comprehensive set of design tokens that ensure consistency across all components:

### Colors
- **Primary**: Modern blue gradient system (#3b82f6 to #1d4ed8)
- **Secondary**: Complementary purple (#8b5cf6)
- **Success**: Fresh green (#10b981)
- **Warning**: Warm orange (#f59e0b)
- **Error**: Modern red (#ef4444)
- **Neutral**: Sophisticated grays (#f8fafc to #020617)

### Typography
- **Font Family**: Inter with system fallbacks
- **Scale**: 12px to 60px with consistent line heights
- **Weights**: 100 to 900 with semantic naming

### Spacing
- **Base Unit**: 4px
- **Scale**: 0px to 256px following 4px increments

### Shadows
- **Range**: xs to 2xl with glassmorphism support
- **Special**: Glass effect shadows for modern UI

## Usage

### Importing Design Tokens

```typescript
import { colors, typography, spacing } from '@/styles/design-tokens';

// Use in components
const primaryColor = colors.primary[500];
const headingFont = typography.fontFamily.sans;
const mediumSpacing = spacing[4];
```

### Using CSS Variables

```css
.my-component {
  color: var(--color-primary-500);
  font-family: var(--font-family-sans);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
```

### Utility Classes

The design system includes comprehensive utility classes for common patterns:

#### Glassmorphism Effects
```html
<div class="glass">Glass effect</div>
<div class="glass-light">Light glass</div>
<div class="glass-strong">Strong glass</div>
```

#### Gradient Backgrounds
```html
<div class="bg-gradient-primary">Primary gradient</div>
<div class="bg-gradient-secondary">Secondary gradient</div>
```

#### Modern Cards
```html
<div class="card-modern">Modern card</div>
<div class="card-elevated">Elevated card</div>
<div class="card-glass">Glass card</div>
```

#### Animations
```html
<div class="animate-fade-in">Fade in animation</div>
<div class="animate-slide-in-left">Slide in from left</div>
<div class="hover-lift">Lift on hover</div>
```

### Mantine Theme Integration

The enhanced Mantine theme automatically applies design tokens to all Mantine components:

```tsx
import { Button, Card, TextInput } from '@mantine/core';

// These components automatically use the enhanced theme
<Button>Styled button</Button>
<Card>Styled card</Card>
<TextInput placeholder="Styled input" />
```

### Theme Context

Use the theme context for dynamic theming:

```tsx
import { useTheme, useThemeValues } from '@/contexts/ThemeContext';

function MyComponent() {
  const { mode, customTheme, setMode } = useTheme();
  const { isDark, isLight } = useThemeValues();
  
  return (
    <div>
      <button onClick={() => setMode('dark')}>
        Switch to dark mode
      </button>
    </div>
  );
}
```

## CSS-in-JS Helpers

The design system provides helper functions for CSS-in-JS:

```typescript
import { 
  createGlassEffect, 
  createGradientBackground, 
  createHoverLift 
} from '@/styles';

const styles = {
  glassCard: createGlassEffect(0.1, 10),
  primaryButton: createGradientBackground('primary'),
  hoverElement: createHoverLift(-2),
};
```

## Responsive Design

The design system includes responsive utilities and breakpoints:

```css
/* Responsive utilities */
.mobile-hidden { display: none; } /* Hidden on mobile */
.desktop-hidden { display: none; } /* Hidden on desktop */

/* Breakpoints */
@media (max-width: 768px) {
  .mobile-stack { flex-direction: column; }
}
```

## Accessibility

The design system ensures accessibility compliance:

- **Focus States**: Consistent focus rings using `:focus-visible`
- **Color Contrast**: All color combinations meet WCAG 2.1 AA standards
- **Touch Targets**: Minimum 44px touch targets on mobile
- **Screen Readers**: Proper semantic markup support

## Performance

The design system is optimized for performance:

- **CSS Variables**: Efficient runtime theming
- **Tree Shaking**: Only import what you need
- **Minimal Bundle**: Optimized for production builds
- **Hardware Acceleration**: GPU-accelerated animations

## Customization

### Custom Colors
```typescript
// Add custom colors to the theme
const customTheme = {
  ...enhancedTheme,
  colors: {
    ...enhancedTheme.colors,
    brand: ['#fff', '#f0f0f0', /* ... */],
  },
};
```

### Custom Components
```typescript
// Extend component styles
const customTheme = {
  ...enhancedTheme,
  components: {
    ...enhancedTheme.components,
    MyComponent: {
      styles: {
        root: { /* custom styles */ },
      },
    },
  },
};
```

## Best Practices

1. **Use Design Tokens**: Always use design tokens instead of hardcoded values
2. **Consistent Spacing**: Use the spacing scale for margins and padding
3. **Semantic Colors**: Use semantic color names (primary, success, error)
4. **Responsive First**: Design for mobile first, enhance for desktop
5. **Accessibility**: Always test with screen readers and keyboard navigation
6. **Performance**: Use CSS variables for dynamic theming
7. **Maintainability**: Keep styles modular and reusable

## Migration Guide

When migrating existing components to use the design system:

1. Replace hardcoded colors with design tokens
2. Update spacing to use the spacing scale
3. Apply consistent border radius and shadows
4. Add hover and focus states using utilities
5. Ensure responsive behavior with breakpoint utilities
6. Test accessibility compliance

## Browser Support

The design system supports:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Features gracefully degrade in older browsers with appropriate fallbacks.