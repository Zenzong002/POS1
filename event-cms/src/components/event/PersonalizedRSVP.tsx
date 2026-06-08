"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, useInView } from "framer-motion";
import { serverTimestamp } from "firebase/firestore";
import type { Theme, AttendanceStatus } from "@/lib/types";
import { rsvpsCollection, guestsCollection } from "@/lib/firebase/firestore";
import SectionWrapper from "./SectionWrapper";

// ─── Schema ───────────────────────────────────────────────────────────────────

const rsvpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .min(8, "Phone number must be at least 8 digits")
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number"),
  numberOfGuests: z
    .number()
    .int("Must be a whole number")
    .min(1, "At least 1 guest")
    .max(20, "Maximum 20 guests"),
  attendanceStatus: z.enum(["attending", "not_attending", "maybe"]),
  notes: z.string().max(500, "Notes too long").optional(),
});

type RSVPFormValues = z.infer<typeof rsvpSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface PersonalizedRSVPProps {
  eventId: string;
  guestId: string;
  token: string;
  guestName: string;
  currentRsvpStatus?: AttendanceStatus;
  defaultGuestCount?: number;
  theme: Theme;
}

// ─── Field styles ─────────────────────────────────────────────────────────────

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

// ─── Confetti particles ───────────────────────────────────────────────────────

function Confetti() {
  const pieces = Array.from({ length: 18 });
  const colors = ["#c9a96e", "#D4AF37", "#f59e0b", "#fbbf24", "#fff", "#fdba74"];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${5 + (i * 87) % 90}%`,
            top: "-10px",
            background: colors[i % colors.length],
            opacity: 0.85,
            animation: `confetti-fall ${1.2 + (i % 5) * 0.3}s ease-in ${(i % 8) * 0.12}s forwards`,
            transform: `rotate(${i * 23}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0.9; }
          100% { transform: translateY(320px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PersonalizedRSVP({
  eventId,
  guestId,
  guestName,
  currentRsvpStatus,
  defaultGuestCount = 1,
  theme,
}: PersonalizedRSVPProps) {
  const alreadySubmitted = Boolean(currentRsvpStatus);
  const [submitted, setSubmitted] = useState(alreadySubmitted);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const EASE = [0.22, 1, 0.36, 1] as const;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<RSVPFormValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      name: guestName,
      numberOfGuests: defaultGuestCount,
      attendanceStatus: currentRsvpStatus ?? "attending",
    },
  });

  const attendanceStatus = watch("attendanceStatus");

  const onSubmit = async (data: RSVPFormValues) => {
    setServerError(null);
    try {
      // Create RSVP record
      await rsvpsCollection.create({
        eventId,
        name: data.name,
        phone: data.phone,
        numberOfGuests: data.numberOfGuests,
        attendanceStatus: data.attendanceStatus as AttendanceStatus,
        notes: data.notes ?? "",
        createdAt: serverTimestamp(),
      });

      // Update guest record
      const guestStatus =
        data.attendanceStatus === "attending"
          ? "attending"
          : data.attendanceStatus === "not_attending"
          ? "not_attending"
          : "rsvp_pending";

      await guestsCollection.update(guestId, {
        rsvpStatus: data.attendanceStatus as AttendanceStatus,
        rsvpAt: serverTimestamp(),
        guestCount: data.numberOfGuests,
        status: guestStatus as "attending" | "not_attending" | "rsvp_pending",
      });

      setShowConfetti(true);
      setSubmitted(true);
      setTimeout(() => setShowConfetti(false), 2500);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  const attendanceOptions: { value: AttendanceStatus; label: string; icon: string }[] = [
    { value: "attending", label: "Attending", icon: "✓" },
    { value: "not_attending", label: "Not Attending", icon: "✗" },
    { value: "maybe", label: "Maybe", icon: "?" },
  ];

  return (
    <SectionWrapper
      id="rsvp"
      className="py-20 md:py-28"
      style={{ background: `var(--color-primary, ${theme.primaryColor})` }}
    >
      <div ref={ref} className="relative z-20 max-w-2xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-10"
        >
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: `var(--color-accent, ${theme.accentColor})` }}
          >
            Your Personal RSVP
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold"
            style={{
              fontFamily: `var(--font-family, ${theme.fontFamily})`,
              color: "#ffffff",
            }}
          >
            RSVP
          </h2>
          {alreadySubmitted && (
            <p className="mt-3 text-sm" style={{ color: `${theme.accentColor}bb` }}>
              You&apos;ve already submitted an RSVP. You can update it below.
            </p>
          )}
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          className="rounded-3xl p-6 sm:p-8 relative overflow-hidden"
          style={{ background: "#fff", boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}
        >
          {showConfetti && <Confetti />}

          {submitted ? (
            /* Success state */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="text-center py-8"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: `${theme.accentColor}20` }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                  stroke={theme.accentColor} strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3
                className="text-2xl font-bold mb-2"
                style={{
                  fontFamily: `var(--font-family, ${theme.fontFamily})`,
                  color: `var(--color-primary, ${theme.primaryColor})`,
                }}
              >
                Thank you!
              </h3>
              <p className="text-base mb-1" style={{ color: "rgba(0,0,0,0.7)" }}>
                Your RSVP has been recorded.
              </p>
              <p className="text-sm" style={{ color: "rgba(0,0,0,0.45)" }}>
                We can&apos;t wait to celebrate with you!
              </p>
              <button
                className="mt-6 px-5 py-2 rounded-xl text-sm font-medium border transition-colors"
                style={{
                  borderColor: "rgba(0,0,0,0.12)",
                  color: "rgba(0,0,0,0.55)",
                }}
                onClick={() => setSubmitted(false)}
              >
                Update RSVP
              </button>
            </motion.div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
              {/* Name — pre-filled, editable */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" style={{ color: "rgba(0,0,0,0.7)" }}>
                  Full Name *
                </label>
                <input
                  {...register("name")}
                  type="text"
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
                  <p className="text-xs" style={{ color: "#ef4444" }}>{errors.name.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" style={{ color: "rgba(0,0,0,0.7)" }}>
                  Phone Number *
                </label>
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="Your phone number"
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
                {errors.phone && (
                  <p className="text-xs" style={{ color: "#ef4444" }}>{errors.phone.message}</p>
                )}
              </div>

              {/* Number of guests */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" style={{ color: "rgba(0,0,0,0.7)" }}>
                  Number of Guests *
                </label>
                <input
                  {...register("numberOfGuests", { valueAsNumber: true })}
                  type="number"
                  min={1}
                  max={20}
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
                {errors.numberOfGuests && (
                  <p className="text-xs" style={{ color: "#ef4444" }}>{errors.numberOfGuests.message}</p>
                )}
              </div>

              {/* Attendance status */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold" style={{ color: "rgba(0,0,0,0.7)" }}>
                  Attendance *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {attendanceOptions.map((opt) => {
                    const selected = attendanceStatus === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setValue("attendanceStatus", opt.value, { shouldValidate: true })}
                        className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{
                          background: selected
                            ? `var(--color-primary, ${theme.primaryColor})`
                            : "rgba(0,0,0,0.04)",
                          color: selected ? "#fff" : "rgba(0,0,0,0.55)",
                          border: `1.5px solid ${selected ? `var(--color-primary, ${theme.primaryColor})` : "transparent"}`,
                          boxShadow: selected
                            ? `0 4px 12px var(--color-primary, ${theme.primaryColor})30`
                            : "none",
                        }}
                      >
                        <span style={{ fontSize: "1.1rem" }}>{opt.icon}</span>
                        <span className="text-xs">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.attendanceStatus && (
                  <p className="text-xs" style={{ color: "#ef4444" }}>
                    {errors.attendanceStatus.message}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" style={{ color: "rgba(0,0,0,0.7)" }}>
                  Notes{" "}
                  <span style={{ color: "rgba(0,0,0,0.35)", fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  placeholder="Dietary restrictions, special requests…"
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
                {errors.notes && (
                  <p className="text-xs" style={{ color: "#ef4444" }}>{errors.notes.message}</p>
                )}
              </div>

              {serverError && (
                <p className="text-sm text-center" style={{ color: "#ef4444" }}>{serverError}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-200"
                style={{
                  background: isSubmitting
                    ? "rgba(0,0,0,0.15)"
                    : `var(--color-primary, ${theme.primaryColor})`,
                  color: "#fff",
                  boxShadow: isSubmitting
                    ? "none"
                    : `0 6px 20px var(--color-primary, ${theme.primaryColor})40`,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                }}
              >
                {isSubmitting ? "Sending…" : "Confirm RSVP"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
