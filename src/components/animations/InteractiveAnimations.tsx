"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef, MouseEvent } from "react";
import { colors } from "../../styles/design-tokens";

// Magnetic Button Effect
interface MagneticButtonProps {
  children: ReactNode;
  strength?: number;
  className?: string;
  onClick?: () => void;
}

export const MagneticButton = ({ 
  children, 
  strength = 0.3, 
  className, 
  onClick 
}: MagneticButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};

// Tilt Card Effect
interface TiltCardProps {
  children: ReactNode;
  tiltStrength?: number;
  className?: string;
}

export const TiltCard = ({ 
  children, 
  tiltStrength = 10, 
  className 
}: TiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-0.5, 0.5], [tiltStrength, -tiltStrength]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-tiltStrength, tiltStrength]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) / rect.width;
    const deltaY = (e.clientY - centerY) / rect.height;
    
    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
    >
      {children}
    </motion.div>
  );
};

// Ripple Effect
interface RippleEffectProps {
  children: ReactNode;
  color?: string;
  duration?: number;
  className?: string;
  onClick?: () => void;
}

export const RippleEffect = ({ 
  children, 
  color = colors.primary[500], 
  duration = 0.6, 
  className, 
  onClick 
}: RippleEffectProps) => {
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const ripple = document.createElement("span");
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      transform: scale(0);
      animation: ripple ${duration}s linear;
      pointer-events: none;
      opacity: 0.3;
    `;
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, duration * 1000);
    
    onClick?.();
  };

  return (
    <motion.div
      className={className}
      style={{ position: "relative", overflow: "hidden" }}
      onClick={handleClick}
      whileTap={{ scale: 0.98 }}
    >
      {children}
      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </motion.div>
  );
};

// Parallax Scroll Effect
interface ParallaxScrollProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export const ParallaxScroll = ({ 
  children, 
  speed = 0.5, 
  className 
}: ParallaxScrollProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  
  const yTransform = useTransform(y, (value) => value * speed);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y: yTransform }}
    >
      {children}
    </motion.div>
  );
};

// Glow Effect on Hover
interface GlowEffectProps {
  children: ReactNode;
  glowColor?: string;
  intensity?: number;
  className?: string;
}

export const GlowEffect = ({ 
  children, 
  glowColor = colors.primary[500], 
  intensity = 20, 
  className 
}: GlowEffectProps) => (
  <motion.div
    className={className}
    whileHover={{
      boxShadow: `0 0 ${intensity}px ${glowColor}`,
      transition: { duration: 0.3 },
    }}
  >
    {children}
  </motion.div>
);

// Elastic Button
interface ElasticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const ElasticButton = ({ children, className, onClick }: ElasticButtonProps) => (
  <motion.button
    className={className}
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.9 }}
    transition={{
      type: "spring",
      stiffness: 400,
      damping: 10,
    }}
  >
    {children}
  </motion.button>
);

// Morphing Shape
interface MorphingShapeProps {
  size?: number;
  color?: string;
  shapes?: string[];
  duration?: number;
}

export const MorphingShape = ({ 
  size = 60, 
  color = colors.primary[500], 
  shapes = ["0%", "50%", "25%"], 
  duration = 2 
}: MorphingShapeProps) => (
  <motion.div
    style={{
      width: size,
      height: size,
      backgroundColor: color,
    }}
    animate={{
      borderRadius: shapes,
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// Bounce on Scroll
interface BounceOnScrollProps {
  children: ReactNode;
  className?: string;
}

export const BounceOnScroll = ({ children, className }: BounceOnScrollProps) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      }
    }}
    viewport={{ once: true, amount: 0.3 }}
  >
    {children}
  </motion.div>
);

// Stagger Reveal on Hover
interface StaggerRevealProps {
  children: ReactNode[];
  className?: string;
}

export const StaggerReveal = ({ children, className }: StaggerRevealProps) => (
  <motion.div
    className={className}
    initial="hidden"
    whileHover="visible"
    variants={{
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.1,
        },
      },
    }}
  >
    {children.map((child, index) => (
      <motion.div
        key={index}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        {child}
      </motion.div>
    ))}
  </motion.div>
);

// Floating Action Button
interface FloatingActionButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const FloatingActionButton = ({ 
  children, 
  className, 
  onClick 
}: FloatingActionButtonProps) => (
  <motion.button
    className={className}
    onClick={onClick}
    style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      borderRadius: "50%",
      width: 56,
      height: 56,
      border: "none",
      cursor: "pointer",
      zIndex: 1000,
    }}
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    whileHover={{ 
      scale: 1.1,
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
    }}
    whileTap={{ scale: 0.9 }}
    transition={{
      type: "spring",
      stiffness: 300,
      damping: 20,
    }}
  >
    {children}
  </motion.button>
);

// Reveal on Scroll
interface RevealOnScrollProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  className?: string;
}

export const RevealOnScroll = ({ 
  children, 
  direction = "up", 
  distance = 50, 
  className 
}: RevealOnScrollProps) => {
  const getInitialPosition = () => {
    switch (direction) {
      case "up": return { y: distance };
      case "down": return { y: -distance };
      case "left": return { x: distance };
      case "right": return { x: -distance };
      default: return { y: distance };
    }
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...getInitialPosition() }}
      whileInView={{ 
        opacity: 1, 
        x: 0, 
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
      }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// Count Up Animation
interface CountUpProps {
  from: number;
  to: number;
  duration?: number;
  className?: string;
}

export const CountUp = ({ from, to, duration = 2, className }: CountUpProps) => {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onViewportEnter={() => {
        count.set(to);
      }}
      transition={{ duration }}
    >
      <motion.span>{rounded}</motion.span>
    </motion.span>
  );
};