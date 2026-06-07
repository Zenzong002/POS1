"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import type { GiftInfo, Theme } from "@/lib/types";
import SectionWrapper from "./SectionWrapper";

// ─── Props ────────────────────────────────────────────────────────────────────

interface GiftSectionProps {
  giftInfo: GiftInfo;
  theme: Theme;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GiftSection({ giftInfo, theme }: GiftSectionProps) {
  const { bankName, accountNumber, accountName, qrCodeUrl } = giftInfo;
  const [copied, setCopied] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const EASE = [0.22, 1, 0.36, 1] as const;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API unavailable — silently ignore
    }
  };

  return (
    <SectionWrapper
      id="gift"
      className="py-20 md:py-28"
      style={{ background: "#fff" }}
    >
      <div ref={ref} className="relative z-20 max-w-3xl mx-auto px-6">
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
            Gift Registry
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold"
            style={{
              fontFamily: `var(--font-family, ${theme.fontFamily})`,
              color: `var(--color-primary, ${theme.primaryColor})`,
            }}
          >
            Gift Giving
          </h2>
          <p className="mt-3 text-base" style={{ color: "rgba(0,0,0,0.5)" }}>
            Your presence is the greatest gift. If you wish to send a token of love, you may do so via bank transfer.
          </p>
        </motion.div>

        <div className={`grid gap-6 ${qrCodeUrl ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-md mx-auto"}`}>
          {/* ── Bank transfer card ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.1 }}
            className="rounded-3xl p-6 sm:p-8 flex flex-col gap-5"
            style={{
              background: `linear-gradient(135deg, var(--color-primary, ${theme.primaryColor}) 0%, ${shadeColor(theme.primaryColor, -20)} 100%)`,
              boxShadow: `0 16px 48px var(--color-primary, ${theme.primaryColor})30`,
            }}
          >
            {/* Bank icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>

            {/* Bank name */}
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-1"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Bank
              </p>
              <p className="text-xl font-bold text-white">{bankName}</p>
            </div>

            {/* Account name */}
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-1"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Account Name
              </p>
              <p className="text-lg font-semibold text-white">{accountName}</p>
            </div>

            {/* Account number + copy button */}
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Account Number
              </p>
              <div
                className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                <span
                  className="text-xl font-mono font-bold tracking-widest text-white select-all"
                  style={{ letterSpacing: "0.15em" }}
                >
                  {accountNumber}
                </span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200"
                  style={{
                    background: copied
                      ? `var(--color-accent, ${theme.accentColor})`
                      : "rgba(255,255,255,0.25)",
                    color: "#fff",
                  }}
                  aria-label="Copy account number"
                >
                  {copied ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* ── QR code card ────────────────────────────────────────────── */}
          {qrCodeUrl && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.65, ease: EASE, delay: 0.18 }}
              className="rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center gap-4"
              style={{
                background: "#fdf9f4",
                boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: `var(--color-accent, ${theme.accentColor})` }}
              >
                Scan to Pay
              </p>
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  width: "min(200px, 100%)",
                  aspectRatio: "1/1",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                }}
              >
                <Image
                  src={qrCodeUrl}
                  alt="QR code for bank transfer"
                  fill
                  sizes="200px"
                  style={{ objectFit: "contain" }}
                />
              </div>
              <p
                className="text-xs text-center"
                style={{ color: "rgba(0,0,0,0.4)" }}
              >
                Scan with your banking app
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Darken/lighten a hex color by `amount` (negative = darker). */
function shadeColor(hex: string, amount: number): string {
  try {
    const clean = hex.replace("#", "");
    const r = Math.min(255, Math.max(0, parseInt(clean.slice(0, 2), 16) + amount));
    const g = Math.min(255, Math.max(0, parseInt(clean.slice(2, 4), 16) + amount));
    const b = Math.min(255, Math.max(0, parseInt(clean.slice(4, 6), 16) + amount));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  } catch {
    return hex;
  }
}
