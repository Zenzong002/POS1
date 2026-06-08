"use client";

import { useMemo } from "react";
import type { FloatingDecorationConfig, FloatingAnimationType } from "@/lib/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface FloatingDecorationsProps {
  config: FloatingDecorationConfig;
}

// ─── Emoji / preset map ───────────────────────────────────────────────────────

function getPresetContent(
  preset: FloatingDecorationConfig["preset"]
): string {
  switch (preset) {
    case "flowers":
      return "🌸";
    case "leaves":
      return "🍃";
    case "sparkles":
      return "✨";
    case "particles":
      return "●";
    default:
      return "✨";
  }
}

// ─── Keyframes builder ────────────────────────────────────────────────────────

function buildKeyframes(type: FloatingAnimationType): string {
  switch (type) {
    case "fall":
      return `
        @keyframes floatFall {
          0%   { transform: translateY(-60px) rotate(0deg);   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
      `;
    case "float":
      return `
        @keyframes floatFloat {
          0%   { transform: translateY(0)     translateX(0);  opacity: 0; }
          10%  { opacity: 1; }
          50%  { transform: translateY(-30px) translateX(15px); }
          90%  { opacity: 1; }
          100% { transform: translateY(-100px) translateX(-10px); opacity: 0; }
        }
      `;
    case "sparkle":
      return `
        @keyframes floatSparkle {
          0%   { transform: scale(0.5) rotate(0deg);   opacity: 0; }
          20%  { opacity: 1; }
          50%  { transform: scale(1.3) rotate(180deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: scale(0.5) rotate(360deg); opacity: 0; }
        }
      `;
    case "drift":
      return `
        @keyframes floatDrift {
          0%   { transform: translateX(0)   translateY(0);  opacity: 0; }
          10%  { opacity: 1; }
          50%  { transform: translateX(40px) translateY(-20px); }
          90%  { opacity: 1; }
          100% { transform: translateX(-20px) translateY(-80px); opacity: 0; }
        }
      `;
    default:
      return "";
  }
}

function getAnimationName(type: FloatingAnimationType): string {
  switch (type) {
    case "fall":    return "floatFall";
    case "float":   return "floatFloat";
    case "sparkle": return "floatSparkle";
    case "drift":   return "floatDrift";
    default:        return "floatFall";
  }
}

// ─── Seeded random (stable per index) ────────────────────────────────────────

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FloatingDecorations({ config }: FloatingDecorationsProps) {
  if (!config.enabled) return null;

  const {
    imageUrl,
    preset,
    density,
    speed,
    opacity,
    animationType,
  } = config;

  const count = Math.min(Math.max(density ?? 10, 1), 50);
  const animName = getAnimationName(animationType);
  const keyframes = buildKeyframes(animationType);
  const presetContent = getPresetContent(preset);

  // Build stable list of element configs (changes only when config changes)
  const elements = useMemo(() => {
    const speedFactor = Math.min(Math.max(speed ?? 5, 1), 10);
    // speed 1 → slow (15s), speed 10 → fast (3s)
    const minDur = 3 + (10 - speedFactor) * 1.2;
    const maxDur = minDur + 5;

    return Array.from({ length: count }, (_, i) => {
      const r1 = seededRandom(i * 3);
      const r2 = seededRandom(i * 3 + 1);
      const r3 = seededRandom(i * 3 + 2);
      const r4 = seededRandom(i * 3 + 3);
      const r5 = seededRandom(i * 3 + 4);

      return {
        id: i,
        left: r1 * 100,          // 0–100vw
        top: -r2 * 30,           // -0 to -30% (above viewport)
        size: 20 + r3 * 40,      // 20–60px
        duration: minDur + r4 * (maxDur - minDur),
        delay: r5 * 5,           // 0–5s
      };
    });
  }, [count, speed]);

  return (
    <>
      <style>{keyframes}</style>
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 5,
          overflow: "hidden",
        }}
      >
        {elements.map((el) => (
          <div
            key={el.id}
            style={{
              position: "absolute",
              left: `${el.left}%`,
              top: `${el.top}%`,
              width: el.size,
              height: el.size,
              opacity,
              animation: `${animName} ${el.duration}s ${el.delay}s ease-in-out infinite`,
              willChange: "transform, opacity",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: el.size * 0.8,
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            {imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={imageUrl}
                alt=""
                width={el.size}
                height={el.size}
                style={{ objectFit: "contain", width: "100%", height: "100%" }}
              />
            ) : preset === "particles" ? (
              <div
                style={{
                  width: el.size * 0.3,
                  height: el.size * 0.3,
                  borderRadius: "50%",
                  background: "#c9a96e",
                }}
              />
            ) : (
              <span>{presetContent}</span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
