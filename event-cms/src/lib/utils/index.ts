import type { CountdownResult } from "../types";

// ─── generateSlug ─────────────────────────────────────────────────────────────

/**
 * Convert a title string into a URL-safe slug.
 *
 * @example
 * generateSlug("My Wedding 2025!")  // "my-wedding-2025"
 * generateSlug("งาน แต่งงาน")       // "งาน-แต่งงาน"  (preserves Unicode letters)
 */
export function generateSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")           // spaces / underscores → hyphens
    .replace(/[^\p{L}\p{N}-]/gu, "")  // remove chars that are not letters, digits, or hyphens
    .replace(/-{2,}/g, "-")            // collapse multiple hyphens
    .replace(/^-+|-+$/g, "");          // strip leading/trailing hyphens
}

// ─── formatDate ──────────────────────────────────────────────────────────────

/**
 * Format an ISO 8601 date string (or Date object) into a human-readable string.
 *
 * @param date   - ISO date string or Date object.
 * @param locale - BCP 47 locale tag (default: "th-TH" for Thai locale).
 *
 * @example
 * formatDate("2025-06-15")              // "15 มิถุนายน 2025" (th-TH)
 * formatDate("2025-06-15", "en-US")     // "June 15, 2025"
 */
export function formatDate(
  date: string | Date,
  locale: string = "th-TH"
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    console.warn("[formatDate] Invalid date value:", date);
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

// ─── getCountdown ────────────────────────────────────────────────────────────

/**
 * Calculate the time remaining until a target date.
 * All values are non-negative integers; `expired` is `true` when the target is in the past.
 *
 * @param targetDate - ISO 8601 date-time string (e.g. "2025-12-31T18:00:00").
 *
 * @example
 * const { days, hours, minutes, seconds, expired } = getCountdown("2025-12-31T18:00:00");
 */
export function getCountdown(targetDate: string): CountdownResult {
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const totalSeconds = Math.floor(diff / 1_000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, expired: false };
}

// ─── cn (className merger) ────────────────────────────────────────────────────

type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, boolean | null | undefined>
  | ClassValue[];

/**
 * Merge Tailwind / CSS class names, filtering out falsy values.
 * Supports strings, conditional objects, and nested arrays.
 *
 * This is a lightweight implementation that avoids a `clsx`/`tailwind-merge`
 * dependency. If your project already uses `clsx` + `tailwind-merge`, replace
 * the body with: `return twMerge(clsx(...classes))`.
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-blue-500", { "font-bold": isBold })
 * // => "px-4 py-2 bg-blue-500 font-bold"
 */
export function cn(...classes: ClassValue[]): string {
  return classes
    .flat(Infinity as 20)
    .filter(Boolean)
    .map((cls) => {
      if (typeof cls === "object" && cls !== null) {
        return Object.entries(cls as Record<string, boolean | null | undefined>)
          .filter(([, active]) => Boolean(active))
          .map(([name]) => name)
          .join(" ");
      }
      return String(cls);
    })
    .filter((s) => s.trim() !== "")
    .join(" ");
}

// ─── Misc Helpers ─────────────────────────────────────────────────────────────

/**
 * Truncate a string to `maxLength` characters, appending `…` when trimmed.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Delay execution for `ms` milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random alphanumeric string of `length` characters.
 * Useful for temporary IDs in optimistic UI updates.
 */
export function randomId(length = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}
