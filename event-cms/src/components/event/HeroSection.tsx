"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { HeroData, Theme, DecorationItem, HeroMediaSettings } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import CountdownTimer from "./CountdownTimer";
import SectionWrapper from "./SectionWrapper";
import HeroWrapper from "./HeroWrapper";

// ─── Animation variants ───────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: EASE },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: EASE },
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface HeroSectionProps {
  heroData: HeroData;
  theme: Theme;
  decorations: DecorationItem[];
  heroMedia?: HeroMediaSettings;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroSection({
  heroData,
  theme,
  decorations,
  heroMedia,
}: HeroSectionProps) {
  const {
    eventTitle,
    subtitle,
    hostName,
    eventDate,
    countdownDate,
    heroBackgroundUrl,
    coverImageUrl,
  } = heroData;

  const formattedDate = formatDate(eventDate, "en-US");

  // Whether a HeroWrapper mode takes over the background rendering
  const delegateBackground =
    heroMedia &&
    (heroMedia.mode === "ken_burns" ||
      heroMedia.mode === "video_background" ||
      Boolean(heroMedia.imageUrl));

  // ── Overlay content ────────────────────────────────────────────────────────

  const overlayContent = (
    <SectionWrapper
      id="hero"
      decorations={decorations}
      className="min-h-svh flex flex-col"
      style={{ background: "transparent" }}
    >
      {/* ── Background (only when not delegated to HeroWrapper) ─────────────── */}
      {!delegateBackground && (
        <div className="absolute inset-0 -z-10">
          {heroBackgroundUrl ? (
            <Image
              src={heroBackgroundUrl}
              alt="Hero background"
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
              }}
            />
          )}
          {/* Dark overlay for readability */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.55) 100%)",
            }}
          />
        </div>
      )}

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="relative z-20 flex flex-col items-center justify-center flex-1 px-6 py-24 text-center">

        {/* Decorative top divider */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-3 mb-8"
        >
          <div
            style={{
              width: "3rem",
              height: "1px",
              background: `var(--color-accent, ${theme.accentColor})`,
              opacity: 0.8,
            }}
          />
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: `var(--color-accent, ${theme.accentColor})`,
            }}
          />
          <div
            style={{
              width: "3rem",
              height: "1px",
              background: `var(--color-accent, ${theme.accentColor})`,
              opacity: 0.8,
            }}
          />
        </motion.div>

        {/* Event title */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{
            fontFamily: `var(--font-family, ${theme.fontFamily})`,
            color: "#ffffff",
            textShadow: "0 2px 24px rgba(0,0,0,0.4)",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
          }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold max-w-4xl"
        >
          {eventTitle}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-4 text-xl sm:text-2xl italic"
            style={{
              color: "rgba(255,255,255,0.85)",
              fontFamily: `var(--font-family, ${theme.fontFamily})`,
            }}
          >
            {subtitle}
          </motion.p>
        )}

        {/* Host name */}
        <motion.p
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-3 text-base sm:text-lg font-medium tracking-widest uppercase"
          style={{ color: `var(--color-accent, ${theme.accentColor})`, letterSpacing: "0.2em" }}
        >
          {hostName}
        </motion.p>

        {/* Date */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-6 flex items-center gap-3"
        >
          <div
            style={{
              width: "2rem",
              height: "1px",
              background: "rgba(255,255,255,0.5)",
            }}
          />
          <p
            className="text-base sm:text-lg font-semibold tracking-wide"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            {formattedDate}
          </p>
          <div
            style={{
              width: "2rem",
              height: "1px",
              background: "rgba(255,255,255,0.5)",
            }}
          />
        </motion.div>

        {/* Cover image */}
        {coverImageUrl && (
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="mt-10 relative"
            style={{ width: "min(280px, 70vw)", aspectRatio: "3/4" }}
          >
            {/* Decorative frame */}
            <div
              style={{
                position: "absolute",
                inset: "-8px",
                border: `2px solid var(--color-accent, ${theme.accentColor})`,
                borderRadius: "4px",
                opacity: 0.7,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "-14px",
                border: `1px solid var(--color-accent, ${theme.accentColor})`,
                borderRadius: "2px",
                opacity: 0.35,
              }}
            />
            <div
              className="relative overflow-hidden"
              style={{ width: "100%", height: "100%", borderRadius: "2px" }}
            >
              <Image
                src={coverImageUrl}
                alt={`Cover photo for ${eventTitle}`}
                fill
                sizes="280px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
          </motion.div>
        )}

        {/* Countdown */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-12 w-full max-w-lg"
        >
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.2em" }}
          >
            Countdown to the celebration
          </p>
          <CountdownTimer targetDate={countdownDate} />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            style={{
              width: "24px",
              height: "40px",
              border: "2px solid rgba(255,255,255,0.4)",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "center",
              paddingTop: "6px",
            }}
          >
            <div
              style={{
                width: "4px",
                height: "8px",
                borderRadius: "2px",
                background: "rgba(255,255,255,0.6)",
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </SectionWrapper>
  );

  // ── Render with or without HeroWrapper ─────────────────────────────────────

  if (delegateBackground) {
    return (
      <HeroWrapper heroMedia={heroMedia}>
        {overlayContent}
      </HeroWrapper>
    );
  }

  return overlayContent;
}
