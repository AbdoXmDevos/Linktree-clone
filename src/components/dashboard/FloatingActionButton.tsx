"use client";

import { ActionIcon, Tooltip, Menu, Stack, Text } from "@mantine/core";
import { IconPlus, IconLink, IconStar, IconTag, IconCategory } from "@tabler/icons-react";
import { FloatingActionButton as AnimatedFAB } from "../animations/InteractiveAnimations";
import { colors, shadows } from "../../styles/design-tokens";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingActionButtonProps {
  onAddLink: () => void;
  onAddFeaturedLink?: () => void;
  onAddCategory?: () => void;
  onQuickActions?: () => void;
}

export function FloatingActionButton({
  onAddLink,
  onAddFeaturedLink,
  onAddCategory,
  onQuickActions,
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions = [
    {
      icon: IconLink,
      label: "Add Link",
      color: colors.primary[500],
      onClick: onAddLink,
    },
    {
      icon: IconStar,
      label: "Featured Link",
      color: colors.warning[500],
      onClick: onAddFeaturedLink,
    },
    {
      icon: IconCategory,
      label: "Add Category",
      color: colors.secondary[500],
      onClick: onAddCategory,
    },
  ];

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
      {/* Quick Action Buttons */}
      <AnimatePresence>
        {isExpanded && (
          <Stack gap="sm" mb="md" align="end">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  transition: { delay: index * 0.1 }
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0, 
                  y: 20,
                  transition: { delay: (quickActions.length - index - 1) * 0.05 }
                }}
              >
                <Tooltip label={action.label} position="left">
                  <ActionIcon
                    size="lg"
                    radius="xl"
                    style={{
                      backgroundColor: action.color,
                      color: "white",
                      boxShadow: shadows.lg,
                    }}
                    onClick={() => {
                      action.onClick?.();
                      setIsExpanded(false);
                    }}
                  >
                    <action.icon size={20} />
                  </ActionIcon>
                </Tooltip>
              </motion.div>
            ))}
          </Stack>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <Tooltip label={isExpanded ? "Close" : "Quick Actions"} position="left">
        <AnimatedFAB
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            backgroundColor: colors.primary[500],
            color: "white",
            boxShadow: shadows.xl,
          }}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <IconPlus size={24} />
          </motion.div>
        </AnimatedFAB>
      </Tooltip>
    </div>
  );
}