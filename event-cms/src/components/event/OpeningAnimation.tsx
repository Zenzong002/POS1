"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { OpeningSettings, OpeningStyle } from "@/lib/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface OpeningAnimationProps {
  settings: OpeningSettings;
  onOpen: () => void;
  isOpen: boolean;
}

// ─── Flower SVG ───────────────────────────────────────────────────────────────

function FlowerSVG({ scale }: { scale: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={120}
      height={120}
      style={{
        transform: `scale(${scale}) rotate(${scale * 30}deg)`,
        transition: "transform 1s ease-out",
      }}
    >
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse
          key={deg}
          cx={50}
          cy={25}
          rx={12}
          ry={22}
          fill="#f9a8d4"
          opacity={0.85}
          transform={`rotate(${deg}, 50, 50)`}
        />
      ))}
      <circle cx={50} cy={50} r={12} fill="#fbbf24" />
    </svg>
  );
}

// ─── Wax Seal SVG ─────────────────────────────────────────────────────────────

function WaxSeal() {
  return (
    <svg viewBox="0 0 60 60" width={60} height={60}>
      <circle cx={30} cy={30} r={28} fill="#c9a96e" />
      <circle cx={30} cy={30} r={22} fill="#b8922a" />
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        fill="#fff"
        fontSize={18}
        fontFamily="serif"
        dominantBaseline="middle"
      >
        ♥
      </text>
    </svg>
  );
}

// ─── Envelope Style ───────────────────────────────────────────────────────────

function EnvelopeOpening({
  settings,
  onOpen,
}: {
  settings: OpeningSettings;
  onOpen: () => void;
}) {
  const [flapping, setFlapping] = useState(false);

  const handleClick = () => {
    if (flapping) return;
    setFlapping(true);
    setTimeout(() => onOpen(), 900);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
      }}
    >
      {/* Envelope */}
      <div style={{ position: "relative", width: 280, height: 200 }}>
        {/* Envelope body */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#fff",
            borderRadius: "4px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            overflow: "hidden",
          }}
        >
          {/* Bottom triangle (V shape) */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "50%",
              background: "#f5efe6",
            }}
          />
          {/* Left flap */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 0,
              height: 0,
              borderLeft: "140px solid #e8d5b7",
              borderTop: "100px solid transparent",
              borderBottom: "100px solid transparent",
            }}
          />
          {/* Right flap */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 0,
              height: 0,
              borderRight: "140px solid #e8d5b7",
              borderTop: "100px solid transparent",
              borderBottom: "100px solid transparent",
            }}
          />
        </div>

        {/* Top flap (animated) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "50%",
            transformOrigin: "top center",
            transform: flapping ? "rotateX(-180deg)" : "rotateX(0deg)",
            transition: "transform 0.8s ease-in-out",
            perspective: 600,
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "140px solid transparent",
              borderRight: "140px solid transparent",
              borderTop: "100px solid #dcc49a",
            }}
          />
        </div>

        {/* Wax seal centered */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
            opacity: flapping ? 0 : 1,
            transition: "opacity 0.3s",
          }}
        >
          <WaxSeal />
        </div>
      </div>

      <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", letterSpacing: "0.1em" }}>
        Click to open
      </p>

      <button onClick={handleClick} style={buttonStyle}>
        {settings.buttonText ?? "Open Invitation"}
      </button>
    </div>
  );
}

// ─── Curtain Style ────────────────────────────────────────────────────────────

function CurtainOpening({
  settings,
  onOpen,
}: {
  settings: OpeningSettings;
  onOpen: () => void;
}) {
  const [opening, setOpening] = useState(false);

  const handleClick = () => {
    if (opening) return;
    setOpening(true);
    setTimeout(() => onOpen(), 1000);
  };

  return (
    <>
      {/* Left curtain */}
      <motion.div
        animate={{ x: opening ? "-100%" : 0 }}
        transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "50%",
          height: "100%",
          background: "linear-gradient(to right, #4a0e0e, #7b1a1a)",
          zIndex: 2,
        }}
      />

      {/* Right curtain */}
      <motion.div
        animate={{ x: opening ? "100%" : 0 }}
        transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          height: "100%",
          background: "linear-gradient(to left, #4a0e0e, #7b1a1a)",
          zIndex: 2,
        }}
      />

      {/* Center content visible between curtains */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <button onClick={handleClick} style={buttonStyle}>
          {settings.buttonText ?? "Open Invitation"}
        </button>
      </div>
    </>
  );
}

// ─── Fade Style ───────────────────────────────────────────────────────────────

function FadeOpening({
  settings,
  onOpen,
}: {
  settings: OpeningSettings;
  onOpen: () => void;
}) {
  const [fading, setFading] = useState(false);

  const handleClick = () => {
    if (fading) return;
    setFading(true);
    setTimeout(() => onOpen(), 700);
  };

  return (
    <motion.div
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: 0.6 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        textAlign: "center",
        padding: "2rem",
        width: "100%",
      }}
    >
      <p
        style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: "0.8rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
        }}
      >
        You are invited
      </p>
      <button onClick={handleClick} style={buttonStyle}>
        {settings.buttonText ?? "Enter"}
      </button>
    </motion.div>
  );
}

// ─── Flower Bloom Style ───────────────────────────────────────────────────────

function FlowerBloomOpening({
  settings,
  onOpen,
}: {
  settings: OpeningSettings;
  onOpen: () => void;
}) {
  const [blooming, setBlooming] = useState(false);
  const [flowerScale, setFlowerScale] = useState(0.2);

  useEffect(() => {
    // Initial bloom animation
    const t = setTimeout(() => setFlowerScale(1), 100);
    return () => clearTimeout(t);
  }, []);

  const handleClick = () => {
    if (blooming) return;
    setBlooming(true);
    setFlowerScale(2);
    setTimeout(() => onOpen(), 900);
  };

  return (
    <motion.div
      animate={{ opacity: blooming ? 0 : 1 }}
      transition={{ duration: 0.8 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <FlowerSVG scale={flowerScale} />
      <button onClick={handleClick} style={buttonStyle}>
        {settings.buttonText ?? "Open"}
      </button>
    </motion.div>
  );
}

// ─── Shared button style ──────────────────────────────────────────────────────

const buttonStyle: React.CSSProperties = {
  padding: "0.75rem 2.5rem",
  background: "linear-gradient(135deg, #c9a96e, #a07840)",
  color: "#fff",
  border: "none",
  borderRadius: "9999px",
  cursor: "pointer",
  fontSize: "1rem",
  fontWeight: 600,
  letterSpacing: "0.05em",
  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
  transition: "transform 0.15s, box-shadow 0.15s",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function OpeningAnimation({
  settings,
  onOpen,
  isOpen,
}: OpeningAnimationProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-call onOpen for 'none' style
  useEffect(() => {
    if (settings.style === "none") {
      onOpen();
    }
  }, [settings.style, onOpen]);

  // Music playback
  useEffect(() => {
    if (!settings.musicUrl) return;
    const audio = new Audio(settings.musicUrl);
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;
    audio.play().catch(() => {
      // Autoplay blocked — handled by user interaction
    });
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [settings.musicUrl]);

  const renderStyle = (style: OpeningStyle) => {
    switch (style) {
      case "envelope":
        return <EnvelopeOpening settings={settings} onOpen={onOpen} />;
      case "curtain":
        return <CurtainOpening settings={settings} onOpen={onOpen} />;
      case "fade":
        return <FadeOpening settings={settings} onOpen={onOpen} />;
      case "flower_bloom":
        return <FlowerBloomOpening settings={settings} onOpen={onOpen} />;
      case "none":
        return null;
      default:
        return null;
    }
  };

  if (settings.style === "none") return null;

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          key="opening-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(10,6,2,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(2px)",
          }}
        >
          {renderStyle(settings.style)}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
