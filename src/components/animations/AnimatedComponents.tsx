"use client";

import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import { ReactNode, forwardRef } from "react";
import {
  fadeVariants,
  slideVariants,
  scaleVariants,
  cardVariants,
  buttonVariants,
  staggerVariants,
  staggerItemVariants,
  modalVariants,
  backdropVariants,
  pageVariants,
} from "../../lib/animations";

// Base animated components
export const MotionBox = motion.div;
export const MotionButton = motion.button;
export const MotionCard = motion.div;
export const MotionText = motion.p;
export const MotionImage = motion.img;

// Fade In Component
interface FadeInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
}

export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  ({ children, delay = 0, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeVariants}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
);

FadeIn.displayName = "FadeIn";

// Slide In Component
interface SlideInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
}

export const SlideIn = forwardRef<HTMLDivElement, SlideInProps>(
  ({ children, direction = "up", delay = 0, ...props }, ref) => {
    const initialVariant = `hidden${direction.charAt(0).toUpperCase() + direction.slice(1)}` as keyof typeof slideVariants;
    
    return (
      <motion.div
        ref={ref}
        initial={initialVariant}
        animate="visible"
        exit="exit"
        variants={slideVariants}
        transition={{ delay }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

SlideIn.displayName = "SlideIn";

// Scale In Component
interface ScaleInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
}

export const ScaleIn = forwardRef<HTMLDivElement, ScaleInProps>(
  ({ children, delay = 0, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={scaleVariants}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
);

ScaleIn.displayName = "ScaleIn";

// Animated Card Component
interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  enableHover?: boolean;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, enableHover = true, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="rest"
      whileHover={enableHover ? "hover" : undefined}
      whileTap={enableHover ? "tap" : undefined}
      variants={cardVariants}
      {...props}
    >
      {children}
    </motion.div>
  )
);

AnimatedCard.displayName = "AnimatedCard";

// Animated Button Component
interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  enableHover?: boolean;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, enableHover = true, ...props }, ref) => (
    <motion.button
      ref={ref}
      initial="rest"
      whileHover={enableHover ? "hover" : undefined}
      whileTap={enableHover ? "tap" : undefined}
      variants={buttonVariants}
      {...props}
    >
      {children}
    </motion.button>
  )
);

AnimatedButton.displayName = "AnimatedButton";

// Stagger Container Component
interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  staggerDelay?: number;
}

export const StaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({ children, staggerDelay = 0.1, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        ...staggerVariants,
        visible: {
          ...staggerVariants.visible,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
);

StaggerContainer.displayName = "StaggerContainer";

// Stagger Item Component
interface StaggerItemProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
}

export const StaggerItem = forwardRef<HTMLDivElement, StaggerItemProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={staggerItemVariants}
      {...props}
    >
      {children}
    </motion.div>
  )
);

StaggerItem.displayName = "StaggerItem";

// Page Transition Component
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export const PageTransition = ({ children, className }: PageTransitionProps) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    className={className}
  >
    {children}
  </motion.div>
);

// Modal Animation Component
interface AnimatedModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const AnimatedModal = ({ children, isOpen, onClose, className }: AnimatedModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <>
        {/* Backdrop */}
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
          }}
        />
        
        {/* Modal Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
          className={className}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1001,
          }}
        >
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export const LoadingSpinner = ({ size = 24, color = "#3B82F6" }: LoadingSpinnerProps) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    }}
    style={{
      width: size,
      height: size,
      border: `2px solid transparent`,
      borderTop: `2px solid ${color}`,
      borderRadius: "50%",
    }}
  />
);

// Pulse Animation Component
interface PulseProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
}

export const Pulse = forwardRef<HTMLDivElement, PulseProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      animate={{
        scale: [1, 1.05, 1],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
);

Pulse.displayName = "Pulse";

// Floating Animation Component
interface FloatingProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
}

export const Floating = forwardRef<HTMLDivElement, FloatingProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      animate={{
        y: [-5, 5, -5],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
);

Floating.displayName = "Floating";

// Progress Bar Component
interface AnimatedProgressProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  className?: string;
}

export const AnimatedProgress = ({
  progress,
  height = 4,
  color = "#3B82F6",
  backgroundColor = "#E5E7EB",
  className,
}: AnimatedProgressProps) => (
  <div
    className={className}
    style={{
      width: "100%",
      height,
      backgroundColor,
      borderRadius: height / 2,
      overflow: "hidden",
    }}
  >
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: progress / 100 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        height: "100%",
        backgroundColor: color,
        borderRadius: height / 2,
        transformOrigin: "left",
      }}
    />
  </div>
);

// Shake Animation Component
interface ShakeProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  trigger?: boolean;
}

export const Shake = forwardRef<HTMLDivElement, ShakeProps>(
  ({ children, trigger = false, ...props }, ref) => (
    <motion.div
      ref={ref}
      animate={trigger ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  )
);

Shake.displayName = "Shake";

// Success Checkmark Component
export const SuccessCheckmark = ({ size = 24, color = "#10B981" }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <motion.path
      d="M20 6L9 17L4 12"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: { duration: 0.5, ease: "easeInOut" },
        opacity: { duration: 0.1 },
      }}
    />
  </motion.svg>
);

// Animated List Component
interface AnimatedListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export const AnimatedList = ({ children, className, staggerDelay = 0.1 }: AnimatedListProps) => (
  <StaggerContainer className={className} staggerDelay={staggerDelay}>
    {children.map((child, index) => (
      <StaggerItem key={index}>
        {child}
      </StaggerItem>
    ))}
  </StaggerContainer>
);