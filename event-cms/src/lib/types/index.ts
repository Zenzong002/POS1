import type { Timestamp } from "firebase/firestore";

// ─── Enums / Union Types ──────────────────────────────────────────────────────

export type EventType =
  | "wedding"
  | "birthday"
  | "housewarming"
  | "community"
  | "family_gathering";

export type EventStatus = "draft" | "published" | "archived";

export type AttendanceStatus = "attending" | "not_attending" | "maybe";

export type BlessingStatus = "pending" | "approved" | "rejected";

export type AssetCategory =
  | "frames"
  | "flowers"
  | "envelopes"
  | "leaves"
  | "ribbons"
  | "icons"
  | "dividers"
  | "traditional";

export type ButtonStyle = "filled" | "outlined" | "ghost" | "rounded" | "square" | "pill";

// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface Event {
  id: string;
  slug: string;
  title: string;
  eventType: EventType;
  templateId: string;
  themeId: string;
  status: EventStatus;
  createdAt?: Timestamp | Date | string;
  updatedAt?: Timestamp | Date | string;
  userId: string;
  seoTitle?: string;
  seoDescription?: string;
}

// ─── Section Data Types ───────────────────────────────────────────────────────

export interface HeroData {
  eventTitle: string;
  subtitle?: string;
  hostName: string;
  eventDate: string;           // ISO 8601 date string
  countdownDate: string;       // ISO 8601 date-time string used for countdown
  heroBackgroundUrl?: string;
  coverImageUrl?: string;
}

export interface StoryData {
  title: string;
  description: string;
  storyImageUrl?: string;
}

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description?: string;
  imageUrl?: string;
  order: number;
}

export interface ScheduleItem {
  id: string;
  time: string;
  eventName: string;
  description?: string;
  order: number;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  caption?: string;
  order: number;
}

export interface LocationData {
  venueName: string;
  address: string;
  googleMapsEmbedUrl?: string;
}

export interface GiftInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
  qrCodeUrl?: string;
}

export interface DecorationItem {
  id: string;
  name: string;
  imageUrl: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
}

// ─── Asset & Theme ────────────────────────────────────────────────────────────

export interface AssetItem {
  id: string;
  name: string;
  category: AssetCategory;
  imageUrl: string;
  tags: string[];
}

export interface Theme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: ButtonStyle;
  previewImageUrl?: string;
}

// ─── Aggregated Section Document ─────────────────────────────────────────────

/**
 * Stored as a single Firestore document (keyed by event id) containing
 * all section-level content for an event.
 */
export interface EventSections {
  id: string;                        // same as the event id
  heroData?: HeroData;
  storyData?: StoryData;
  timelineItems?: TimelineItem[];
  scheduleItems?: ScheduleItem[];
  galleryItems?: GalleryItem[];
  locationData?: LocationData;
  giftInfo?: GiftInfo;
  decorations?: DecorationItem[];
}

// ─── Submissions ──────────────────────────────────────────────────────────────

export interface RSVPSubmission {
  id: string;
  eventId: string;
  name: string;
  phone: string;
  numberOfGuests: number;
  attendanceStatus: AttendanceStatus;
  notes?: string;
  createdAt: Timestamp | Date | string;
}

export interface Blessing {
  id: string;
  eventId: string;
  name: string;
  message: string;
  status: BlessingStatus;
  createdAt: Timestamp | Date | string;
}

// ─── Template ─────────────────────────────────────────────────────────────────

export interface Template {
  id: string;
  name: string;
  eventType: EventType;
  description: string;
  previewImageUrl?: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Timestamp | Date | string;
  updatedAt: Timestamp | Date | string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface AnalyticsEntry {
  id: string;
  eventId: string;
  eventType: string;       // e.g. "page_view", "rsvp_submit", "blessing_submit"
  metadata?: Record<string, unknown>;
  createdAt: Timestamp | Date | string;
}

// ─── API / UI Helpers ─────────────────────────────────────────────────────────

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}
