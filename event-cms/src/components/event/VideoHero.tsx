"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { VideoBackgroundSettings } from "@/lib/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface VideoHeroProps {
  settings: VideoBackgroundSettings;
  children?: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VideoHero({ settings, children }: VideoHeroProps) {
  const { videoUrl, posterUrl, autoplay, loop, muted, overlayOpacity } = settings;
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Detect mobile to avoid video on low-bandwidth devices
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100svh",
        overflow: "hidden",
      }}
    >
      {/* Background: video on desktop, poster on mobile */}
      {isMobile ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: posterUrl ? `url(${posterUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            background: posterUrl ? undefined : "#111",
          }}
        />
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          autoPlay={autoplay}
          loop={loop}
          muted={muted}
          playsInline
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
          onError={() => {
            // Fallback: hide video on error; poster is already set
            if (videoRef.current) videoRef.current.style.display = "none";
          }}
        />
      )}

      {/* Color overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `rgba(0,0,0,${overlayOpacity ?? 0.4})`,
          zIndex: 1,
        }}
      />

      {/* Overlay content */}
      <div style={{ position: "relative", zIndex: 2, width: "100%", height: "100%" }}>
        {children}
      </div>
    </section>
  );
}
