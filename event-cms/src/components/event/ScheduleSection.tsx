"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { ScheduleItem, Theme } from "@/lib/types";
import SectionWrapper from "./SectionWrapper";

// ─── Animation ────────────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ScheduleSectionProps {
  items: ScheduleItem[];
  theme: Theme;
}

// ─── Single schedule card ─────────────────────────────────────────────────────

function ScheduleCard({
  item,
  index,
  theme,
  inView,
}: {
  item: ScheduleItem;
  index: number;
  theme: Theme;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ delay: index * 0.08, duration: 0.55, ease: EASE }}
      className="flex items-start gap-4 sm:gap-6 rounded-2xl p-5 sm:p-6 group"
      style={{
        background: "#fff",
        border: `1px solid rgba(0,0,0,0.07)`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 8px 32px rgba(0,0,0,0.1)";
        (e.currentTarget as HTMLDivElement).style.borderColor = `var(--color-accent, ${theme.accentColor})40`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 2px 12px rgba(0,0,0,0.05)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,0,0,0.07)";
      }}
    >
      {/* Time badge */}
      <div
        className="shrink-0 rounded-xl px-3 py-2 text-center min-w-[70px]"
        style={{
          background: `var(--color-primary, ${theme.primaryColor})`,
        }}
      >
        <span
          className="block text-sm font-bold leading-none"
          style={{ color: "#fff", fontFamily: `var(--font-family, ${theme.fontFamily})` }}
        >
          {item.time}
        </span>
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <h3
          className="text-base sm:text-lg font-bold leading-snug"
          style={{
            fontFamily: `var(--font-family, ${theme.fontFamily})`,
            color: `var(--color-primary, ${theme.primaryColor})`,
          }}
        >
          {item.eventName}
        </h3>
        {item.description && (
          <p
            className="mt-1 text-sm leading-relaxed"
            style={{ color: "rgba(0,0,0,0.55)" }}
          >
            {item.description}
          </p>
        )}
      </div>

      {/* Right accent line */}
      <div
        className="shrink-0 self-stretch w-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          background: `var(--color-accent, ${theme.accentColor})`,
          width: "3px",
        }}
      />
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScheduleSection({ items, theme }: ScheduleSectionProps) {
  if (!items || items.length === 0) return null;

  const sorted = [...items].sort((a, b) => a.order - b.order);

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <SectionWrapper
      id="schedule"
      className="py-20 md:py-28"
      style={{ background: `#fdf9f4` }}
    >
      <div ref={ref} className="relative z-20 max-w-3xl mx-auto px-6">
        {/* ── Section header ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-12"
        >
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: `var(--color-accent, ${theme.accentColor})` }}
          >
            Program
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold"
            style={{
              fontFamily: `var(--font-family, ${theme.fontFamily})`,
              color: `var(--color-primary, ${theme.primaryColor})`,
            }}
          >
            Event Schedule
          </h2>
          <div
            className="mx-auto mt-4"
            style={{
              width: "4rem",
              height: "2px",
              background: `var(--color-accent, ${theme.accentColor})`,
            }}
          />
        </motion.div>

        {/* ── Cards ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {sorted.map((item, i) => (
            <ScheduleCard
              key={item.id}
              item={item}
              index={i}
              theme={theme}
              inView={inView}
            />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
