"use client";

import { useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EventVisualSettings } from "@/lib/types";
import IntroVideo from "@/components/event/IntroVideo";
import OpeningAnimation from "@/components/event/OpeningAnimation";
import MusicPlayer from "@/components/event/MusicPlayer";
import FloatingDecorations from "@/components/event/FloatingDecorations";

// ─── Props ────────────────────────────────────────────────────────────────────

interface EventPageClientProps {
  eventId: string;
  slug: string;
  visualSettings?: EventVisualSettings;
  children: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EventPageClient({
  slug,
  visualSettings,
  children,
}: EventPageClientProps) {
  const heroMedia = visualSettings?.heroMedia;
  const openingSettings = visualSettings?.openingSettings;
  const musicSettings = visualSettings?.musicSettings;
  const floatingConfig = visualSettings?.floatingDecorations;

  // ── Intro video state ──────────────────────────────────────────────────────
  const showIntroVideo =
    heroMedia?.mode === "intro_video" && Boolean(heroMedia?.introVideo?.videoUrl);

  const [introDone, setIntroDone] = useState(() => {
    // Skip intro if already seen this session (checked lazily on first render)
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(`intro_seen_${slug}`) === "1";
    }
    return false;
  });

  const handleIntroComplete = () => {
    sessionStorage.setItem(`intro_seen_${slug}`, "1");
    setIntroDone(true);
  };

  // ── Opening animation state ────────────────────────────────────────────────
  const hasOpening =
    openingSettings && openingSettings.style !== "none";

  const [isOpen, setIsOpen] = useState(!hasOpening);

  // Auto-open when style is 'none'
  useEffect(() => {
    if (openingSettings?.style === "none") {
      setIsOpen(true);
    }
  }, [openingSettings?.style]);

  const handleOpen = () => setIsOpen(true);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* 1. Intro video — shown before everything else */}
      {showIntroVideo && !introDone && heroMedia?.introVideo && (
        <IntroVideo
          settings={heroMedia.introVideo}
          onComplete={handleIntroComplete}
        />
      )}

      {/* 2. Opening animation overlay */}
      {hasOpening && (
        <OpeningAnimation
          settings={openingSettings}
          onOpen={handleOpen}
          isOpen={isOpen}
        />
      )}

      {/* 3. Main content — fades in after opening */}
      <AnimatePresence>
        {(introDone || !showIntroVideo) && (
          <motion.div
            key="main-content"
            initial={hasOpening ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Music player — always visible once page is shown */}
      {musicSettings?.musicUrl && (
        <MusicPlayer settings={musicSettings} />
      )}

      {/* 5. Floating decorations */}
      {floatingConfig?.enabled && (
        <FloatingDecorations config={floatingConfig} />
      )}
    </>
  );
}
