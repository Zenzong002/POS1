"use client";

import type { ReactNode } from "react";
import type { HeroMediaSettings } from "@/lib/types";
import KenBurnsHero from "./KenBurnsHero";
import VideoHero from "./VideoHero";

// ─── Props ────────────────────────────────────────────────────────────────────

interface HeroWrapperProps {
  heroMedia?: HeroMediaSettings;
  children: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroWrapper({ heroMedia, children }: HeroWrapperProps) {
  const mode = heroMedia?.mode ?? "static";

  if (mode === "ken_burns") {
    const imageUrl = heroMedia?.imageUrl ?? "";
    const kenBurnsSettings = heroMedia?.kenBurns ?? {
      direction: "zoom_in" as const,
      duration: 20,
      scale: 1.2,
    };
    return (
      <KenBurnsHero imageUrl={imageUrl} settings={kenBurnsSettings}>
        {children}
      </KenBurnsHero>
    );
  }

  if (mode === "video_background" && heroMedia?.videoBackground) {
    return (
      <VideoHero settings={heroMedia.videoBackground}>
        {children}
      </VideoHero>
    );
  }

  // static / intro_video / undefined — plain div, background provided by HeroSection
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100svh",
        overflow: "hidden",
        backgroundImage: heroMedia?.imageUrl ? `url(${heroMedia.imageUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {heroMedia?.imageUrl && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
        {children}
      </div>
    </div>
  );
}
