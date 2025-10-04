"use client";

import { Button, Card, Text, Group, Stack } from '@mantine/core';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Test component to verify design system implementation
 * This component demonstrates the usage of design tokens, utility classes, and theme context
 */
export function DesignSystemTest() {
  const { mode, setMode, customTheme } = useTheme();

  return (
    <Stack gap="lg" p="xl">
      <Text size="xl" fw={600} className="text-gradient-primary">
        Design System Test
      </Text>

      {/* Theme Controls */}
      <Card className="card-modern">
        <Text size="lg" fw={500} mb="md">Theme Controls</Text>
        <Group>
          <Button 
            variant={mode === 'light' ? 'filled' : 'outline'}
            onClick={() => setMode('light')}
          >
            Light
          </Button>
          <Button 
            variant={mode === 'dark' ? 'filled' : 'outline'}
            onClick={() => setMode('dark')}
          >
            Dark
          </Button>
          <Button 
            variant={mode === 'auto' ? 'filled' : 'outline'}
            onClick={() => setMode('auto')}
          >
            Auto
          </Button>
        </Group>
      </Card>

      {/* Color Palette */}
      <Card className="card-modern">
        <Text size="lg" fw={500} mb="md">Color Palette</Text>
        <Group>
          <div 
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 8,
              background: 'var(--color-primary-500)' 
            }} 
          />
          <div 
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 8,
              background: 'var(--color-secondary-500)' 
            }} 
          />
          <div 
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 8,
              background: 'var(--color-success-500)' 
            }} 
          />
          <div 
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 8,
              background: 'var(--color-warning-500)' 
            }} 
          />
          <div 
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 8,
              background: 'var(--color-error-500)' 
            }} 
          />
        </Group>
      </Card>

      {/* Gradient Backgrounds */}
      <Card className="card-modern">
        <Text size="lg" fw={500} mb="md">Gradient Backgrounds</Text>
        <Group>
          <div className="bg-gradient-primary" style={{ width: 100, height: 40, borderRadius: 8 }} />
          <div className="bg-gradient-secondary" style={{ width: 100, height: 40, borderRadius: 8 }} />
          <div className="bg-gradient-success" style={{ width: 100, height: 40, borderRadius: 8 }} />
        </Group>
      </Card>

      {/* Glass Effects */}
      <Card className="card-modern">
        <Text size="lg" fw={500} mb="md">Glass Effects</Text>
        <div style={{ background: 'var(--gradient-primary)', padding: 20, borderRadius: 12 }}>
          <Group>
            <div className="glass" style={{ padding: 16, borderRadius: 8 }}>
              <Text c="white" size="sm">Glass Effect</Text>
            </div>
            <div className="glass-light" style={{ padding: 16, borderRadius: 8 }}>
              <Text c="white" size="sm">Light Glass</Text>
            </div>
            <div className="glass-strong" style={{ padding: 16, borderRadius: 8 }}>
              <Text c="white" size="sm">Strong Glass</Text>
            </div>
          </Group>
        </div>
      </Card>

      {/* Interactive Elements */}
      <Card className="card-modern">
        <Text size="lg" fw={500} mb="md">Interactive Elements</Text>
        <Group>
          <Button className="btn-modern">Modern Button</Button>
          <Button className="btn-gradient">Gradient Button</Button>
          <div className="hover-lift" style={{ padding: 12, background: 'var(--color-neutral-100)', borderRadius: 8 }}>
            <Text size="sm">Hover to Lift</Text>
          </div>
        </Group>
      </Card>

      {/* Animations */}
      <Card className="card-modern">
        <Text size="lg" fw={500} mb="md">Animations</Text>
        <Group>
          <div className="animate-fade-in" style={{ padding: 12, background: 'var(--color-primary-100)', borderRadius: 8 }}>
            <Text size="sm">Fade In</Text>
          </div>
          <div className="animate-scale-in" style={{ padding: 12, background: 'var(--color-secondary-100)', borderRadius: 8 }}>
            <Text size="sm">Scale In</Text>
          </div>
          <div className="loading-skeleton" style={{ width: 100, height: 20, borderRadius: 4 }} />
        </Group>
      </Card>

      {/* Current Theme Info */}
      <Card className="card-elevated">
        <Text size="lg" fw={500} mb="md">Current Theme</Text>
        <Stack gap="xs">
          <Text size="sm">Mode: {mode}</Text>
          <Text size="sm">Primary Color: {customTheme.primaryColor}</Text>
          <Text size="sm">Background Style: {customTheme.backgroundStyle}</Text>
          <Text size="sm">Border Radius: {customTheme.borderRadius}</Text>
          <Text size="sm">Glass Effect: {customTheme.glassEffect ? 'Enabled' : 'Disabled'}</Text>
        </Stack>
      </Card>
    </Stack>
  );
}