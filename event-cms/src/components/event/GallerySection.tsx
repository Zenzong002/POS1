"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import type { GalleryItem, Theme } from "@/lib/types";
import SectionWrapper from "./SectionWrapper";

// ─── Animation ────────────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const;

// ─── Lightbox ─────────────────────────────────────────────────────────────────

interface LightboxProps {
  items: GalleryItem[];
  activeIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function Lightbox({ items, activeIndex, onClose, onPrev, onNext }: LightboxProps) {
  const item = items[activeIndex];
  if (!item) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.92)" }}
      onClick={onClose}
    >
      {/* Content — stop propagation so clicking image doesn't close */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="relative flex flex-col items-center max-w-5xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div
          className="relative w-full"
          style={{ maxHeight: "80vh", aspectRatio: "auto" }}
        >
          <div
            className="relative w-full overflow-hidden rounded-lg"
            style={{ maxHeight: "80vh" }}
          >
            <img
              src={item.imageUrl}
              alt={item.caption ?? `Gallery image ${activeIndex + 1}`}
              style={{
                width: "100%",
                height: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        </div>

        {/* Caption */}
        {item.caption && (
          <p
            className="mt-3 text-center text-sm"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            {item.caption}
          </p>
        )}

        {/* Counter */}
        <p
          className="mt-1 text-xs"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          {activeIndex + 1} / {items.length}
        </p>
      </motion.div>

      {/* Navigation buttons */}
      {items.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-colors"
            style={{
              width: "48px",
              height: "48px",
              background: "rgba(255,255,255,0.12)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            aria-label="Previous image"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-colors"
            style={{
              width: "48px",
              height: "48px",
              background: "rgba(255,255,255,0.12)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            aria-label="Next image"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </button>
        </>
      )}

      {/* Close button */}
      <button
        className="absolute top-4 right-4 flex items-center justify-center rounded-full transition-colors"
        style={{
          width: "40px",
          height: "40px",
          background: "rgba(255,255,255,0.12)",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </motion.div>
  );
}

// ─── Gallery card ─────────────────────────────────────────────────────────────

function GalleryCard({
  item,
  index,
  inView,
  onClick,
  theme,
}: {
  item: GalleryItem;
  index: number;
  inView: boolean;
  onClick: () => void;
  theme: Theme;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: EASE }}
      className="group relative overflow-hidden rounded-xl cursor-pointer w-full text-left"
      style={{
        aspectRatio: index % 5 === 0 ? "1/1.3" : index % 3 === 1 ? "1/0.75" : "1/1",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      }}
      onClick={onClick}
    >
      <Image
        src={item.imageUrl}
        alt={item.caption ?? `Gallery photo ${index + 1}`}
        fill
        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
        loading="lazy"
        style={{ objectFit: "cover", transition: "transform 0.4s ease" }}
        className="group-hover:scale-105"
      />

      {/* Hover overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3"
        style={{
          background: `linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)`,
        }}
      >
        {item.caption && (
          <p className="text-white text-sm font-medium leading-tight">
            {item.caption}
          </p>
        )}
      </div>

      {/* Expand icon */}
      <div
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-full"
        style={{
          width: "32px",
          height: "32px",
          background: "rgba(255,255,255,0.9)",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={theme.primaryColor}
          strokeWidth="2.5"
        >
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
      </div>
    </motion.button>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface GallerySectionProps {
  items: GalleryItem[];
  theme: Theme;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GallerySection({ items, theme }: GallerySectionProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const sorted = [...(items ?? [])].sort((a, b) => a.order - b.order);

  const openLightbox = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i - 1 + sorted.length) % sorted.length)),
    [sorted.length]
  );
  const nextImage = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i + 1) % sorted.length)),
    [sorted.length]
  );

  if (!sorted.length) return null;

  return (
    <>
      <SectionWrapper
        id="gallery"
        className="py-20 md:py-28"
        style={{ background: "#fff" }}
      >
        <div ref={ref} className="relative z-20 max-w-7xl mx-auto px-6">
          {/* ── Header ──────────────────────────────────────────────────── */}
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
              Memories
            </span>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold"
              style={{
                fontFamily: `var(--font-family, ${theme.fontFamily})`,
                color: `var(--color-primary, ${theme.primaryColor})`,
              }}
            >
              Gallery
            </h2>
          </motion.div>

          {/* ── Masonry grid ────────────────────────────────────────────── */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {sorted.map((item, i) => (
              <div key={item.id} className="break-inside-avoid">
                <GalleryCard
                  item={item}
                  index={i}
                  inView={inView}
                  onClick={() => openLightbox(i)}
                  theme={theme}
                />
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            items={sorted}
            activeIndex={lightboxIndex}
            onClose={closeLightbox}
            onPrev={prevImage}
            onNext={nextImage}
          />
        )}
      </AnimatePresence>
    </>
  );
}
