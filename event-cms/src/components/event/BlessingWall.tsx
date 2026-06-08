"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, useInView, AnimatePresence } from "framer-motion";
import type { Theme, Blessing } from "@/lib/types";
import { blessingsCollection } from "@/lib/firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import SectionWrapper from "./SectionWrapper";

// ─── Schema ───────────────────────────────────────────────────────────────────

const blessingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  message: z
    .string()
    .min(5, "Message must be at least 5 characters")
    .max(500, "Message too long (max 500 characters)"),
});

type BlessingFormValues = z.infer<typeof blessingSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface BlessingWallProps {
  eventId: string;
  theme: Theme;
}

// ─── Blessing card ────────────────────────────────────────────────────────────

function BlessingCard({ blessing, index, inView, theme }: {
  blessing: Blessing & { id: string };
  index: number;
  inView: boolean;
  theme: Theme;
}) {
  const EASE = [0.22, 1, 0.36, 1] as const;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: EASE }}
      className="rounded-2xl p-5"
      style={{
        background: "#fff",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {/* Quote mark */}
      <div
        className="text-4xl font-serif leading-none mb-2 select-none"
        style={{ color: `var(--color-accent, ${theme.accentColor})`, opacity: 0.4 }}
      >
        &ldquo;
      </div>
      <p
        className="text-sm leading-relaxed mb-4"
        style={{ color: "rgba(0,0,0,0.65)" }}
      >
        {blessing.message}
      </p>
      <div className="flex items-center gap-2">
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: `var(--color-primary, ${theme.primaryColor})` }}
        >
          {blessing.name.charAt(0).toUpperCase()}
        </div>
        <span
          className="text-sm font-semibold"
          style={{ color: `var(--color-primary, ${theme.primaryColor})` }}
        >
          {blessing.name}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BlessingWall({ eventId, theme }: BlessingWallProps) {
  const [blessings, setBlessings] = useState<(Blessing & { id: string })[]>([]);
  const [loadingBlessings, setLoadingBlessings] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const EASE = [0.22, 1, 0.36, 1] as const;

  const INPUT_STYLE: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "0.75rem",
    border: "1.5px solid rgba(0,0,0,0.12)",
    background: "#fff",
    fontSize: "0.9375rem",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    color: "#1a1a1a",
  };

  // Fetch approved blessings
  useEffect(() => {
    setLoadingBlessings(true);
    blessingsCollection
      .listApproved(eventId)
      .then((data) => setBlessings(data))
      .catch(() => setBlessings([]))
      .finally(() => setLoadingBlessings(false));
  }, [eventId]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BlessingFormValues>({
    resolver: zodResolver(blessingSchema),
  });

  const onSubmit = async (data: BlessingFormValues) => {
    setServerError(null);
    try {
      await blessingsCollection.create({
        eventId,
        name: data.name,
        message: data.message,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      reset();
      setFormSubmitted(true);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <SectionWrapper
      id="blessings"
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
            Wishes
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold"
            style={{
              fontFamily: `var(--font-family, ${theme.fontFamily})`,
              color: `var(--color-primary, ${theme.primaryColor})`,
            }}
          >
            Blessing Wall
          </h2>
          <p className="mt-3 text-base" style={{ color: "rgba(0,0,0,0.5)" }}>
            Leave your warm wishes for the celebration
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* ── Submit form ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div
              className="rounded-3xl p-6 sm:p-7"
              style={{
                background: "#fff",
                boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <AnimatePresence mode="wait">
                {formSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="text-center py-6"
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: `${theme.accentColor}20` }}
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={theme.accentColor}
                        strokeWidth="2.5"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </div>
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{
                        fontFamily: `var(--font-family, ${theme.fontFamily})`,
                        color: `var(--color-primary, ${theme.primaryColor})`,
                      }}
                    >
                      Thank you!
                    </h3>
                    <p className="text-sm" style={{ color: "rgba(0,0,0,0.5)" }}>
                      Your blessing has been submitted and is pending approval.
                    </p>
                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="mt-4 text-sm font-medium underline"
                      style={{ color: `var(--color-accent, ${theme.accentColor})` }}
                    >
                      Send another blessing
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-4"
                    noValidate
                  >
                    <h3
                      className="text-lg font-bold"
                      style={{
                        fontFamily: `var(--font-family, ${theme.fontFamily})`,
                        color: `var(--color-primary, ${theme.primaryColor})`,
                      }}
                    >
                      Leave a Blessing
                    </h3>

                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        className="text-sm font-semibold"
                        style={{ color: "rgba(0,0,0,0.7)" }}
                      >
                        Your Name *
                      </label>
                      <input
                        {...register("name")}
                        type="text"
                        placeholder="Your name"
                        style={INPUT_STYLE}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = `var(--color-accent, ${theme.accentColor})`;
                          e.currentTarget.style.boxShadow = `0 0 0 3px var(--color-accent, ${theme.accentColor})20`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                      {errors.name && (
                        <p className="text-xs" style={{ color: "#ef4444" }}>
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        className="text-sm font-semibold"
                        style={{ color: "rgba(0,0,0,0.7)" }}
                      >
                        Your Blessing *
                      </label>
                      <textarea
                        {...register("message")}
                        rows={4}
                        placeholder="Write your warm wishes here…"
                        style={{ ...INPUT_STYLE, resize: "vertical" }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = `var(--color-accent, ${theme.accentColor})`;
                          e.currentTarget.style.boxShadow = `0 0 0 3px var(--color-accent, ${theme.accentColor})20`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                      {errors.message && (
                        <p className="text-xs" style={{ color: "#ef4444" }}>
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    {serverError && (
                      <p className="text-sm text-center" style={{ color: "#ef4444" }}>
                        {serverError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
                      style={{
                        background: isSubmitting
                          ? "rgba(0,0,0,0.15)"
                          : `var(--color-primary, ${theme.primaryColor})`,
                        color: "#fff",
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        boxShadow: isSubmitting
                          ? "none"
                          : `0 4px 16px var(--color-primary, ${theme.primaryColor})40`,
                      }}
                    >
                      {isSubmitting ? "Sending…" : "Send Blessing"}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Blessing cards grid ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.15 }}
            className="lg:col-span-3"
          >
            {loadingBlessings ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl h-32 animate-pulse"
                    style={{ background: "rgba(0,0,0,0.06)" }}
                  />
                ))}
              </div>
            ) : blessings.length === 0 ? (
              <div
                className="rounded-2xl p-10 text-center flex flex-col items-center gap-3 h-full min-h-[200px] justify-center"
                style={{
                  background: "#fff",
                  border: "1.5px dashed rgba(0,0,0,0.12)",
                  borderRadius: "1.5rem",
                }}
              >
                <div
                  className="text-5xl select-none"
                  style={{ opacity: 0.3 }}
                >
                  💌
                </div>
                <p
                  className="text-base font-medium"
                  style={{ color: "rgba(0,0,0,0.4)" }}
                >
                  Be the first to leave a blessing!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {blessings.map((blessing, i) => (
                  <BlessingCard
                    key={blessing.id}
                    blessing={blessing}
                    index={i}
                    inView={inView}
                    theme={theme}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
