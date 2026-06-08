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
  visualSettings?: EventVisualSettings;
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

// ─── Hero Media System ────────────────────────────────────────────────────────

export type HeroMode = "static" | "ken_burns" | "video_background" | "intro_video";

export type KenBurnsDirection = "zoom_in" | "zoom_out" | "pan_left" | "pan_right";

export interface KenBurnsSettings {
  direction: KenBurnsDirection;
  duration: number;       // seconds, default 20
  scale: number;          // e.g. 1.2
}

export interface VideoBackgroundSettings {
  videoUrl: string;
  posterUrl?: string;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  overlayOpacity: number; // 0-1
}

export interface IntroVideoSettings {
  videoUrl: string;
  skipEnabled: boolean;
  autoSkipSeconds?: number; // 0 = no auto skip
}

export interface HeroMediaSettings {
  mode: HeroMode;
  imageUrl?: string;
  kenBurns?: KenBurnsSettings;
  videoBackground?: VideoBackgroundSettings;
  introVideo?: IntroVideoSettings;
}

// ─── Opening Experience ───────────────────────────────────────────────────────

export type OpeningStyle = "envelope" | "curtain" | "fade" | "flower_bloom" | "none";

export interface OpeningSettings {
  style: OpeningStyle;
  musicUrl?: string;
  musicTitle?: string;
  duration: number; // seconds
  buttonText?: string; // "Open Invitation"
}

// ─── Music System ─────────────────────────────────────────────────────────────

export interface MusicSettings {
  musicUrl?: string;
  musicTitle?: string;
  autoPlay: boolean;
  loop: boolean;
}

// ─── Section Animation System ─────────────────────────────────────────────────

export type AnimationType =
  | "fade_up"
  | "fade_down"
  | "fade_left"
  | "fade_right"
  | "scale_in"
  | "zoom_in"
  | "blur_reveal"
  | "parallax"
  | "none";

export interface SectionAnimationConfig {
  heroAnimation: AnimationType;
  storyAnimation: AnimationType;
  timelineAnimation: AnimationType;
  scheduleAnimation: AnimationType;
  galleryAnimation: AnimationType;
  locationAnimation: AnimationType;
  rsvpAnimation: AnimationType;
  blessingAnimation: AnimationType;
  giftAnimation: AnimationType;
}

// ─── Layer Engine 2.0 ─────────────────────────────────────────────────────────

export type LayerType = "background" | "image" | "video" | "decoration" | "text" | "overlay";

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  imageUrl?: string;
  videoUrl?: string;
  text?: string;
  positionX: number;   // percentage 0-100
  positionY: number;
  width: number;       // percentage
  height: number;
  rotation: number;
  opacity: number;     // 0-1
  zIndex: number;
}

// ─── Floating Decorations ─────────────────────────────────────────────────────

export type FloatingAnimationType = "fall" | "float" | "sparkle" | "drift";

export interface FloatingDecorationConfig {
  enabled: boolean;
  imageUrl?: string;   // custom image, else use preset
  preset?: "flowers" | "leaves" | "sparkles" | "particles" | "custom" | "none";
  speed: number;       // 1-10
  density: number;     // 1-50 (number of elements)
  opacity: number;     // 0-1
  animationType: FloatingAnimationType;
}

// ─── Section Background ───────────────────────────────────────────────────────

export type BackgroundType = "solid" | "gradient" | "image" | "video";

export interface SectionBackground {
  type: BackgroundType;
  solidColor?: string;
  gradient?: string;   // CSS gradient string
  imageUrl?: string;
  videoUrl?: string;
  overlayColor?: string;
  overlayOpacity?: number;
}

// ─── Extended EventSections ───────────────────────────────────────────────────

export interface EventVisualSettings {
  heroMedia?: HeroMediaSettings;
  openingSettings?: OpeningSettings;
  musicSettings?: MusicSettings;
  sectionAnimations?: SectionAnimationConfig;
  floatingDecorations?: FloatingDecorationConfig;
  sectionBackgrounds?: Record<string, SectionBackground>;  // keyed by section name
  layers?: Record<string, Layer[]>;                         // keyed by section name
}

// ─── Guest / CRM System ───────────────────────────────────────────────────────

export type GuestStatus =
  | "invited"
  | "viewed"
  | "rsvp_pending"
  | "attending"
  | "not_attending"
  | "completed";

export interface Guest {
  id: string;
  eventId: string;
  fullName: string;
  nickname?: string;
  phone?: string;
  email?: string;
  token: string;           // unique 8-char random token
  invitationUrl: string;   // full URL
  viewed: boolean;
  viewedAt?: Timestamp | Date | string;
  firstVisit?: Timestamp | Date | string;
  lastVisit?: Timestamp | Date | string;
  visitCount?: number;
  rsvpStatus?: AttendanceStatus;
  rsvpAt?: Timestamp | Date | string;
  guestCount?: number;
  reminderSent: boolean;
  reminderSentAt?: Timestamp | Date | string;
  notes?: string;
  status: GuestStatus;
  createdAt?: Timestamp | Date | string;
  updatedAt?: Timestamp | Date | string;
}

export interface InvitationView {
  id: string;
  guestId: string;
  eventId: string;
  token: string;
  viewedAt: Timestamp | Date | string;
  userAgent?: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface InvitationAnalytics {
  totalGuests: number;
  viewed: number;
  notViewed: number;
  openRate: number;       // percentage
  rsvpTotal: number;
  attending: number;
  notAttending: number;
  maybe: number;
  rsvpRate: number;       // percentage
  viewsByDay: Record<string, number>;
  rsvpsByDay: Record<string, number>;
}
