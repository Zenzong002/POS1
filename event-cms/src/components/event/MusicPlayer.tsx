"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Play, Pause } from "lucide-react";
import type { MusicSettings } from "@/lib/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface MusicPlayerProps {
  settings: MusicSettings;
}

// ─── Spinning disc animation keyframes ───────────────────────────────────────

const spinKeyframes = `
  @keyframes spinDisc {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function MusicPlayer({ settings }: MusicPlayerProps) {
  const { musicUrl, musicTitle, autoPlay, loop } = settings;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Create audio element once
  useEffect(() => {
    if (!musicUrl) return;
    const audio = new Audio(musicUrl);
    audio.loop = loop ?? true;
    audio.volume = 0.7;
    audioRef.current = audio;

    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("ended", () => setIsPlaying(false));

    setInitialized(true);

    // Attempt autoplay
    if (autoPlay) {
      audio.play().catch(() => {
        // Autoplay blocked; user must click
      });
    }

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [musicUrl, loop, autoPlay]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  if (!musicUrl || !initialized) return null;

  return (
    <>
      <style>{spinKeyframes}</style>

      <div
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "0.5rem",
        }}
      >
        {/* Tooltip */}
        {showTooltip && musicTitle && (
          <div
            style={{
              background: "rgba(0,0,0,0.75)",
              color: "#fff",
              padding: "0.375rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              whiteSpace: "nowrap",
              backdropFilter: "blur(4px)",
              pointerEvents: "none",
            }}
          >
            {musicTitle}
          </div>
        )}

        {/* Button */}
        <button
          onClick={toggle}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-label={isPlaying ? "Pause music" : "Play music"}
          style={{
            width: "3rem",
            height: "3rem",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #c9a96e, #a07840)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            animation: isPlaying ? "spinDisc 3s linear infinite" : "none",
            transition: "box-shadow 0.2s",
          }}
        >
          {isPlaying ? (
            <Pause size={18} />
          ) : (
            <Play size={18} style={{ marginLeft: 2 }} />
          )}

          {/* Music note indicator (outer ring glow when playing) */}
          {isPlaying && (
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: -4,
                borderRadius: "50%",
                border: "2px solid rgba(201,169,110,0.5)",
                animation: "spinDisc 3s linear infinite reverse",
              }}
            />
          )}
        </button>

        {/* Floating music icon when not playing */}
        {!isPlaying && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -8,
              right: -4,
              background: "#c9a96e",
              borderRadius: "50%",
              width: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <Music size={10} color="#fff" />
          </div>
        )}
      </div>
    </>
  );
}
