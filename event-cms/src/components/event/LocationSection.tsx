"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { LocationData, Theme } from "@/lib/types";
import SectionWrapper from "./SectionWrapper";

// ─── Props ────────────────────────────────────────────────────────────────────

interface LocationSectionProps {
  locationData: LocationData;
  theme: Theme;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LocationSection({ locationData, theme }: LocationSectionProps) {
  const { venueName, address, googleMapsEmbedUrl } = locationData;

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const EASE = [0.22, 1, 0.36, 1] as const;

  // Build an "open in Google Maps" URL from the address
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${venueName} ${address}`
  )}`;

  return (
    <SectionWrapper
      id="location"
      className="py-20 md:py-28"
      style={{ background: "#fdf9f4" }}
    >
      <div ref={ref} className="relative z-20 max-w-5xl mx-auto px-6">
        {/* ── Header ──────────────────────────────────────────────────────── */}
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
            Where to find us
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold"
            style={{
              fontFamily: `var(--font-family, ${theme.fontFamily})`,
              color: `var(--color-primary, ${theme.primaryColor})`,
            }}
          >
            Location
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          {/* ── Venue info ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.1 }}
            className="md:col-span-2 flex flex-col gap-6"
          >
            {/* Venue name card */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "#fff",
                boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              {/* Pin icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{
                  background: `var(--color-primary, ${theme.primaryColor})`,
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>

              <h3
                className="text-xl font-bold mb-2"
                style={{
                  fontFamily: `var(--font-family, ${theme.fontFamily})`,
                  color: `var(--color-primary, ${theme.primaryColor})`,
                }}
              >
                {venueName}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(0,0,0,0.55)" }}
              >
                {address}
              </p>
            </div>

            {/* Open in Google Maps button */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-sm transition-all duration-200"
              style={{
                background: `var(--color-primary, ${theme.primaryColor})`,
                color: "#fff",
                boxShadow: `0 4px 16px var(--color-primary, ${theme.primaryColor})40`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Open in Google Maps
            </a>
          </motion.div>

          {/* ── Embed map ───────────────────────────────────────────────── */}
          {googleMapsEmbedUrl && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.65, ease: EASE, delay: 0.15 }}
              className="md:col-span-3 overflow-hidden rounded-2xl"
              style={{
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                border: "1px solid rgba(0,0,0,0.07)",
                height: "380px",
              }}
            >
              <iframe
                src={googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map for ${venueName}`}
              />
            </motion.div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
