/**
 * Animation utilities and configurations for Framer Motion
 * Provides consistent animations across the application
 */

import { Variants, Transition } from "framer-motion";

// Animation durations
export const DURATIONS = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
} as const;

// Easing functions
export const EASINGS = {
  linear: [0, 0, 1, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  spring: [0.175, 0.885, 0.32, 1.275],
} as const;

// Common transitions
export const transitions: Record<string, Transition> = {
  fast: {
    duration: DURATIONS.fast,
    ease: EASINGS.easeOut,
  },
  normal: {
    duration: DURATIONS.normal,
    ease: EASINGS.easeInOut,
  },
  slow: {
    duration: DURATIONS.slow,
    ease: EASINGS.easeInOut,
  },
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  },
  bounce: {
    type: "spring",
    stiffness: 400,
    damping: 10,
  },
};

// Fade animations
export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

// Slide animations
export const slideVariants: Variants = {
  hiddenLeft: {
    opacity: 0,
    x: -50,
  },
  hiddenRight: {
    opacity: 0,
    x: 50,
  },
  hiddenUp: {
    opacity: 0,
    y: -50,
  },
  hiddenDown: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: transitions.fast,
  },
};

// Scale animations
export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: transitions.fast,
  },
  hover: {
    scale: 1.05,
    transition: transitions.fast,
  },
  tap: {
    scale: 0.95,
    transition: transitions.fast,
  },
};

// Stagger animations for lists
export const staggerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: transitions.fast,
  },
};

// Card hover animations
export const cardVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    transition: transitions.normal,
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    transition: transitions.fast,
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: transitions.fast,
  },
};

// Button animations
export const buttonVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    transition: transitions.normal,
  },
  hover: {
    scale: 1.05,
    y: -2,
    transition: transitions.fast,
  },
  tap: {
    scale: 0.95,
    y: 0,
    transition: transitions.fast,
  },
};

// Loading animations
export const loadingVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Page transition animations
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
    transition: transitions.normal,
  },
  out: {
    opacity: 0,
    y: -20,
    transition: transitions.fast,
  },
};

// Modal animations
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 30,
    transition: transitions.fast,
  },
};

export const backdropVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

// Notification animations
export const notificationVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 300,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    x: 300,
    scale: 0.8,
    transition: transitions.normal,
  },
};

// Tab animations
export const tabVariants: Variants = {
  inactive: {
    opacity: 0.6,
    y: 0,
    transition: transitions.fast,
  },
  active: {
    opacity: 1,
    y: -2,
    transition: transitions.fast,
  },
};

// Progress animations
export const progressVariants: Variants = {
  initial: {
    scaleX: 0,
    originX: 0,
  },
  animate: (progress: number) => ({
    scaleX: progress / 100,
    transition: transitions.normal,
  }),
};

// Floating animations
export const floatingVariants: Variants = {
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Shake animation for errors
export const shakeVariants: Variants = {
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
    },
  },
};

// Success checkmark animation
export const checkmarkVariants: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: "easeInOut" },
      opacity: { duration: 0.1 },
    },
  },
};

// Utility functions
export const createStaggerContainer = (staggerDelay = 0.1) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1,
    },
  },
});

export const createSlideIn = (direction: 'left' | 'right' | 'up' | 'down' = 'up', distance = 50) => {
  const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
  const value = direction === 'left' || direction === 'up' ? -distance : distance;
  
  return {
    hidden: {
      opacity: 0,
      [axis]: value,
    },
    visible: {
      opacity: 1,
      [axis]: 0,
      transition: transitions.normal,
    },
  };
};

export const createBounceIn = (delay = 0) => ({
  hidden: {
    opacity: 0,
    scale: 0.3,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      ...transitions.bounce,
      delay,
    },
  },
});