"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import type { AnimationType } from "@/lib/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface SectionAnimationWrapperProps {
  animation: AnimationType;
  children: ReactNode;
  delay?: number;
  className?: string;
}

// ─── Transition ───────────────────────────────────────────────────────────────

const buildTransition = (delay: number) => ({
  duration: 0.7,
  ease: "easeOut" as const,
  delay,
});

// ─── Parallax wrapper ─────────────────────────────────────────────────────────

function ParallaxWrapper({
  children,
  delay,
  className,
}: {
  children: ReactNode;
  delay: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      transition={buildTransition(delay)}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SectionAnimationWrapper({
  animation,
  children,
  delay = 0,
  className,
}: SectionAnimationWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });

  if (animation === "none") {
    return <div className={className}>{children}</div>;
  }

  if (animation === "parallax") {
    return (
      <ParallaxWrapper delay={delay} className={className}>
        {children}
      </ParallaxWrapper>
    );
  }

  type MotionVariant = {
    opacity: number;
    x?: number;
    y?: number;
    scale?: number;
    filter?: string;
  };

  const variants: Record<AnimationType, { initial: MotionVariant; animate: MotionVariant }> = {
    fade_up: {
      initial: { opacity: 0, y: 40 },
      animate: { opacity: 1, y: 0 },
    },
    fade_down: {
      initial: { opacity: 0, y: -40 },
      animate: { opacity: 1, y: 0 },
    },
    fade_left: {
      initial: { opacity: 0, x: -40 },
      animate: { opacity: 1, x: 0 },
    },
    fade_right: {
      initial: { opacity: 0, x: 40 },
      animate: { opacity: 1, x: 0 },
    },
    scale_in: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
    },
    zoom_in: {
      initial: { opacity: 0, scale: 0.6 },
      animate: { opacity: 1, scale: 1 },
    },
    blur_reveal: {
      initial: { opacity: 0, filter: "blur(10px)" },
      animate: { opacity: 1, filter: "blur(0px)" },
    },
    // These are handled above, but need entries for type safety
    parallax: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    },
    none: {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
    },
  };

  const { initial, animate } = variants[animation] ?? variants.fade_up;

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={inView ? animate : initial}
      transition={buildTransition(delay)}
      className={className}
    >
      {children}
    </motion.div>
  );
}
