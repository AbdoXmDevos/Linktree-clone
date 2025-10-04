"use client";

import { motion } from "framer-motion";
import { Box, Text, Stack, Group } from "@mantine/core";
import { colors } from "../../styles/design-tokens";

// Skeleton Loading Animation
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  className?: string;
}

export const Skeleton = ({ 
  width = "100%", 
  height = 20, 
  radius = 4, 
  className 
}: SkeletonProps) => (
  <motion.div
    className={className}
    style={{
      width,
      height,
      borderRadius: radius,
      background: `linear-gradient(90deg, ${colors.neutral[200]} 25%, ${colors.neutral[100]} 50%, ${colors.neutral[200]} 75%)`,
      backgroundSize: "200% 100%",
    }}
    animate={{
      backgroundPosition: ["200% 0", "-200% 0"],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "linear",
    }}
  />
);

// Dots Loading Animation
interface DotsLoadingProps {
  size?: number;
  color?: string;
  gap?: number;
}

export const DotsLoading = ({ 
  size = 8, 
  color = colors.primary[500], 
  gap = 4 
}: DotsLoadingProps) => (
  <Group gap={gap} align="center">
    {[0, 1, 2].map((index) => (
      <motion.div
        key={index}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: color,
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: index * 0.2,
          ease: "easeInOut",
        }}
      />
    ))}
  </Group>
);

// Pulse Loading Animation
interface PulseLoadingProps {
  size?: number;
  color?: string;
}

export const PulseLoading = ({ 
  size = 40, 
  color = colors.primary[500] 
}: PulseLoadingProps) => (
  <Box style={{ position: "relative", width: size, height: size }}>
    {[0, 1, 2].map((index) => (
      <motion.div
        key={index}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size,
          height: size,
          borderRadius: "50%",
          border: `2px solid ${color}`,
          opacity: 0,
        }}
        animate={{
          scale: [0, 1],
          opacity: [1, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: index * 0.6,
          ease: "easeOut",
        }}
      />
    ))}
  </Box>
);

// Spinner Loading Animation
interface SpinnerLoadingProps {
  size?: number;
  color?: string;
  thickness?: number;
}

export const SpinnerLoading = ({ 
  size = 24, 
  color = colors.primary[500], 
  thickness = 2 
}: SpinnerLoadingProps) => (
  <motion.div
    style={{
      width: size,
      height: size,
      border: `${thickness}px solid ${colors.neutral[200]}`,
      borderTop: `${thickness}px solid ${color}`,
      borderRadius: "50%",
    }}
    animate={{ rotate: 360 }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    }}
  />
);

// Wave Loading Animation
interface WaveLoadingProps {
  width?: number;
  height?: number;
  color?: string;
}

export const WaveLoading = ({ 
  width = 60, 
  height = 40, 
  color = colors.primary[500] 
}: WaveLoadingProps) => (
  <Group gap={2} align="end" style={{ height }}>
    {[0, 1, 2, 3, 4].map((index) => (
      <motion.div
        key={index}
        style={{
          width: width / 5 - 2,
          backgroundColor: color,
          borderRadius: 2,
        }}
        animate={{
          height: [height * 0.3, height, height * 0.3],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: index * 0.1,
          ease: "easeInOut",
        }}
      />
    ))}
  </Group>
);

// Progress Circle Animation
interface ProgressCircleProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
}

export const ProgressCircle = ({
  progress,
  size = 60,
  strokeWidth = 4,
  color = colors.primary[500],
  backgroundColor = colors.neutral[200],
  showPercentage = true,
}: ProgressCircleProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Box style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </svg>
      {showPercentage && (
        <Box
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Text size="sm" fw={600} ta="center">
            {Math.round(progress)}%
          </Text>
        </Box>
      )}
    </Box>
  );
};

// Loading Card Skeleton
export const LoadingCardSkeleton = () => (
  <Box p="md" style={{ border: `1px solid ${colors.neutral[200]}`, borderRadius: 8 }}>
    <Stack gap="sm">
      <Group gap="md">
        <Skeleton width={40} height={40} radius="50%" />
        <Stack gap={4} style={{ flex: 1 }}>
          <Skeleton width="70%" height={16} />
          <Skeleton width="50%" height={12} />
        </Stack>
      </Group>
      <Skeleton width="100%" height={12} />
      <Skeleton width="80%" height={12} />
    </Stack>
  </Box>
);

// Loading List Skeleton
interface LoadingListSkeletonProps {
  items?: number;
}

export const LoadingListSkeleton = ({ items = 3 }: LoadingListSkeletonProps) => (
  <Stack gap="md">
    {Array.from({ length: items }).map((_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <LoadingCardSkeleton />
      </motion.div>
    ))}
  </Stack>
);

// Typing Animation
interface TypingAnimationProps {
  text: string;
  speed?: number;
  className?: string;
}

export const TypingAnimation = ({ 
  text, 
  speed = 50, 
  className 
}: TypingAnimationProps) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * (speed / 1000) }}
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
};

// Morphing Loader
export const MorphingLoader = ({ size = 40, color = colors.primary[500] }) => (
  <motion.div
    style={{
      width: size,
      height: size,
      backgroundColor: color,
    }}
    animate={{
      borderRadius: ["0%", "50%", "0%"],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// Breathing Animation
interface BreathingProps {
  children: React.ReactNode;
  scale?: number;
  duration?: number;
}

export const Breathing = ({ 
  children, 
  scale = 1.05, 
  duration = 2 
}: BreathingProps) => (
  <motion.div
    animate={{
      scale: [1, scale, 1],
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    {children}
  </motion.div>
);