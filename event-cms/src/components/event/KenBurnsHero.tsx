"use client";

import type { ReactNode } from "react";
import type { KenBurnsSettings, KenBurnsDirection } from "@/lib/types";

// ─── Keyframe generation ──────────────────────────────────────────────────────

function getKeyframes(direction: KenBurnsDirection, scale: number): string {
  const s = scale ?? 1.2;
  switch (direction) {
    case "zoom_in":
      return `
        @keyframes kenBurns {
          from { transform: scale(1); }
          to   { transform: scale(${s}); }
        }
      `;
    case "zoom_out":
      return `
        @keyframes kenBurns {
          from { transform: scale(${s}); }
          to   { transform: scale(1); }
        }
      `;
    case "pan_left":
      return `
        @keyframes kenBurns {
          from { transform: scale(${s}) translateX(0); }
          to   { transform: scale(${s}) translateX(-10%); }
        }
      `;
    case "pan_right":
      return `
        @keyframes kenBurns {
          from { transform: scale(${s}) translateX(0); }
          to   { transform: scale(${s}) translateX(10%); }
        }
      `;
    default:
      return `
        @keyframes kenBurns {
          from { transform: scale(1); }
          to   { transform: scale(${s}); }
        }
      `;
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface KenBurnsHeroProps {
  imageUrl: string;
  settings: KenBurnsSettings;
  children?: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function KenBurnsHero({
  imageUrl,
  settings,
  children,
}: KenBurnsHeroProps) {
  const { direction, duration, scale } = settings;
  const keyframes = getKeyframes(direction, scale);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100svh",
        overflow: "hidden",
      }}
    >
      {/* Injected keyframes */}
      <style>{keyframes}</style>

      {/* Animated background image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          animation: `kenBurns ${duration}s ease-in-out infinite alternate`,
          willChange: "transform",
        }}
        aria-hidden="true"
      />

      {/* Dark overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 1,
        }}
      />

      {/* Overlay content */}
      <div style={{ position: "relative", zIndex: 2, width: "100%", height: "100%" }}>
        {children}
      </div>
    </div>
  );
}
