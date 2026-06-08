"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { TimelineItem, Theme } from "@/lib/types";
import SectionWrapper from "./SectionWrapper";

// ─── Animation ────────────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const;

function itemVariant(side: "left" | "right") {
  return {
    hidden: { opacity: 0, x: side === "left" ? -40 : 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: EASE } },
  };
}

// ─── Single timeline entry ────────────────────────────────────────────────────

function TimelineEntry({
  item,
  index,
  theme,
}: {
  item: TimelineItem;
  index: number;
  theme: Theme;
}) {
  const isLeft = index % 2 === 0;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const variant = itemVariant(isLeft ? "left" : "right");

  return (
    <div ref={ref} className="relative grid grid-cols-[1fr_auto_1fr] gap-x-6 md:gap-x-10 items-start">
      {/* ── Left cell ──────────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        {isLeft && (
          <motion.div
            variants={variant}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="max-w-sm w-full text-right"
          >
            <EntryCard item={item} theme={theme} align="right" />
          </motion.div>
        )}
      </div>

      {/* ── Center dot ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-0 pt-1">
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: `var(--color-accent, ${theme.accentColor})`,
            border: `3px solid var(--color-primary, ${theme.primaryColor})`,
            outline: `2px solid var(--color-accent, ${theme.accentColor})`,
            flexShrink: 0,
          }}
        />
        {/* line segment is drawn via parent pseudo-element */}
      </div>

      {/* ── Right cell ─────────────────────────────────────────────────────── */}
      <div className="flex justify-start">
        {!isLeft && (
          <motion.div
            variants={variant}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="max-w-sm w-full"
          >
            <EntryCard item={item} theme={theme} align="left" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function EntryCard({
  item,
  theme,
  align,
}: {
  item: TimelineItem;
  theme: Theme;
  align: "left" | "right";
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#fff",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {item.imageUrl && (
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 90vw, 380px"
            style={{ objectFit: "cover" }}
          />
        </div>
      )}
      <div className={`p-4 sm:p-5 ${align === "right" ? "text-right" : "text-left"}`}>
        {/* Date badge */}
        <span
          className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
          style={{
            background: `rgba(${hexToRgbString(theme.accentColor)}, 0.12)`,
            color: `var(--color-accent, ${theme.accentColor})`,
          }}
        >
          {item.date}
        </span>
        <h3
          className="text-base font-bold leading-snug mb-1"
          style={{
            fontFamily: `var(--font-family, ${theme.fontFamily})`,
            color: `var(--color-primary, ${theme.primaryColor})`,
          }}
        >
          {item.title}
        </h3>
        {item.description && (
          <p className="text-sm leading-relaxed" style={{ color: "rgba(0,0,0,0.55)" }}>
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function hexToRgbString(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return "201,169,110";
  return `${r},${g},${b}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TimelineSectionProps {
  items: TimelineItem[];
  theme: Theme;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TimelineSection({ items, theme }: TimelineSectionProps) {
  if (!items || items.length === 0) return null;

  const sorted = [...items].sort((a, b) => a.order - b.order);

  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

  return (
    <SectionWrapper
      id="timeline"
      className="py-20 md:py-28"
      style={{ background: "#fff" }}
    >
      <div className="relative z-20 max-w-5xl mx-auto px-6">
        {/* ── Section header ─────────────────────────────────────────────── */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: `var(--color-accent, ${theme.accentColor})` }}
          >
            Our Journey
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold"
            style={{
              fontFamily: `var(--font-family, ${theme.fontFamily})`,
              color: `var(--color-primary, ${theme.primaryColor})`,
            }}
          >
            Timeline
          </h2>
        </motion.div>

        {/* ── Timeline items ─────────────────────────────────────────────── */}
        <div className="relative">
          {/* Vertical connecting line */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 pointer-events-none"
            style={{
              width: "2px",
              background: `linear-gradient(to bottom, transparent, var(--color-accent, ${theme.accentColor}), transparent)`,
              opacity: 0.3,
            }}
          />

          <div className="flex flex-col gap-12 md:gap-16">
            {sorted.map((item, i) => (
              <TimelineEntry key={item.id} item={item} index={i} theme={theme} />
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
