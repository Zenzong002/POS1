"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { StoryData, Theme, DecorationItem } from "@/lib/types";
import SectionWrapper from "./SectionWrapper";

// ─── Animation variants ───────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface StorySectionProps {
  storyData: StoryData;
  theme: Theme;
  decorations: DecorationItem[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StorySection({
  storyData,
  theme,
  decorations,
}: StorySectionProps) {
  const { title, description, storyImageUrl } = storyData;

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <SectionWrapper
      id="story"
      decorations={decorations}
      className="py-20 md:py-28"
      style={{
        background: `var(--color-secondary-bg, #fdf9f4)`,
      }}
    >
      <div
        ref={ref}
        className="relative z-20 max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center"
      >
        {/* ── Text column ──────────────────────────────────────────────────── */}
        <motion.div
          variants={fadeLeft}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col gap-6"
        >
          {/* Section label */}
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "2.5rem",
                height: "2px",
                background: `var(--color-accent, ${theme.accentColor})`,
              }}
            />
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: `var(--color-accent, ${theme.accentColor})` }}
            >
              Our Story
            </span>
          </div>

          {/* Title */}
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
            style={{
              fontFamily: `var(--font-family, ${theme.fontFamily})`,
              color: `var(--color-primary, ${theme.primaryColor})`,
            }}
          >
            {title}
          </h2>

          {/* Decorative rule */}
          <div
            style={{
              width: "4rem",
              height: "2px",
              background: `linear-gradient(to right, var(--color-accent, ${theme.accentColor}), transparent)`,
            }}
          />

          {/* Description */}
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: "rgba(0,0,0,0.6)", lineHeight: 1.85 }}
          >
            {description}
          </p>
        </motion.div>

        {/* ── Image column ─────────────────────────────────────────────────── */}
        {storyImageUrl && (
          <motion.div
            variants={fadeRight}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="flex justify-center md:justify-end"
          >
            <div className="relative" style={{ width: "min(380px, 100%)" }}>
              {/* Decorative offset frame */}
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  right: "-16px",
                  bottom: "-16px",
                  border: `2px solid var(--color-accent, ${theme.accentColor})`,
                  borderRadius: "4px",
                  opacity: 0.45,
                }}
              />
              {/* Image container */}
              <div
                className="relative overflow-hidden"
                style={{
                  borderRadius: "4px",
                  aspectRatio: "4/5",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                }}
              >
                <Image
                  src={storyImageUrl}
                  alt={`Story: ${title}`}
                  fill
                  sizes="(max-width: 768px) 90vw, 380px"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </SectionWrapper>
  );
}
