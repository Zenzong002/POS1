"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { IntroVideoSettings } from "@/lib/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface IntroVideoProps {
  settings: IntroVideoSettings;
  onComplete: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function IntroVideo({ settings, onComplete }: IntroVideoProps) {
  const { videoUrl, skipEnabled, autoSkipSeconds } = settings;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(true);
  const [countdown, setCountdown] = useState<number>(autoSkipSeconds ?? 0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Trigger fade-out then call onComplete
  const handleComplete = () => {
    setVisible(false);
  };

  // After AnimatePresence exit animation finishes, call onComplete
  const handleExitComplete = () => {
    onComplete();
  };

  // Start countdown if autoSkipSeconds is set
  useEffect(() => {
    if (!autoSkipSeconds || autoSkipSeconds <= 0) return;
    setCountdown(autoSkipSeconds);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSkipSeconds]);

  const handleVideoEnded = () => {
    handleComplete();
  };

  const handleSkip = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    handleComplete();
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <motion.div
          key="intro-video"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "#000",
          }}
        >
          {/* Video */}
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnded}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {/* Skip button */}
          {skipEnabled && (
            <button
              onClick={handleSkip}
              style={{
                position: "absolute",
                bottom: "2rem",
                right: "2rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: "9999px",
                cursor: "pointer",
                backdropFilter: "blur(4px)",
                fontSize: "0.875rem",
                fontWeight: 500,
                zIndex: 51,
              }}
            >
              <X size={14} />
              {autoSkipSeconds && countdown > 0
                ? `Skip in ${countdown}s`
                : "Skip"}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
