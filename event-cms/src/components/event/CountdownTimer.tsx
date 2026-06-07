"use client";

import { useState, useEffect } from "react";
import { getCountdown } from "@/lib/utils";
import type { CountdownResult } from "@/lib/types";

interface CountdownTimerProps {
  targetDate: string;
}

interface TimeBoxProps {
  value: number;
  label: string;
}

function TimeBox({ value, label }: TimeBoxProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex items-center justify-center rounded-lg"
        style={{
          width: "5rem",
          height: "5rem",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
        }}
      >
        <span
          className="font-bold tabular-nums"
          style={{
            fontSize: "2rem",
            lineHeight: 1,
            color: "var(--color-accent, #c9a96e)",
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            fontFamily: "var(--font-family, serif)",
          }}
        >
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span
        className="mt-2 text-xs uppercase tracking-widest"
        style={{ color: "rgba(255,255,255,0.8)", letterSpacing: "0.15em" }}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * Real-time countdown timer. Updates every second.
 * Displays as four elegant boxes: days / hours / minutes / seconds.
 */
export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [countdown, setCountdown] = useState<CountdownResult>(() =>
    getCountdown(targetDate)
  );

  useEffect(() => {
    if (countdown.expired) return;

    const id = setInterval(() => {
      const next = getCountdown(targetDate);
      setCountdown(next);
      if (next.expired) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, [targetDate, countdown.expired]);

  if (countdown.expired) {
    return (
      <p
        className="text-center text-lg italic"
        style={{ color: "rgba(255,255,255,0.9)" }}
      >
        The celebration has begun!
      </p>
    );
  }

  return (
    <div className="flex items-start justify-center gap-4 sm:gap-6">
      <TimeBox value={countdown.days} label="Days" />
      <div
        className="self-start mt-4 text-2xl font-light"
        style={{ color: "var(--color-accent, #c9a96e)" }}
      >
        :
      </div>
      <TimeBox value={countdown.hours} label="Hours" />
      <div
        className="self-start mt-4 text-2xl font-light"
        style={{ color: "var(--color-accent, #c9a96e)" }}
      >
        :
      </div>
      <TimeBox value={countdown.minutes} label="Minutes" />
      <div
        className="self-start mt-4 text-2xl font-light"
        style={{ color: "var(--color-accent, #c9a96e)" }}
      >
        :
      </div>
      <TimeBox value={countdown.seconds} label="Seconds" />
    </div>
  );
}
