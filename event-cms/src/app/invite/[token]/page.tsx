export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { serverTimestamp } from "firebase/firestore";
import type { Theme, DecorationItem } from "@/lib/types";
import {
  guestsCollection,
  eventsCollection,
  eventSectionsCollection,
  invitationViewsCollection,
  themesCollection,
  patchDoc,
  COLLECTIONS,
} from "@/lib/firebase/firestore";

// Section components
import HeroSection from "@/components/event/HeroSection";
import StorySection from "@/components/event/StorySection";
import TimelineSection from "@/components/event/TimelineSection";
import ScheduleSection from "@/components/event/ScheduleSection";
import GallerySection from "@/components/event/GallerySection";
import LocationSection from "@/components/event/LocationSection";
import BlessingWall from "@/components/event/BlessingWall";
import GiftSection from "@/components/event/GiftSection";
import PersonalizedRSVP from "@/components/event/PersonalizedRSVP";

// ─── Default theme ────────────────────────────────────────────────────────────

const DEFAULT_THEME: Theme = {
  id: "default",
  name: "Classic Gold",
  primaryColor: "#2c1810",
  secondaryColor: "#8b4513",
  accentColor: "#c9a96e",
  fontFamily: "Georgia, 'Times New Roman', serif",
  borderRadius: "0.75rem",
  buttonStyle: "rounded",
};

// ─── Not found page ───────────────────────────────────────────────────────────

function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: "linear-gradient(135deg, #1a0a00 0%, #2c1810 50%, #1a0a00 100%)",
      }}
    >
      <div className="text-center max-w-md">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(201,169,110,0.12)", border: "1.5px solid rgba(201,169,110,0.3)" }}
        >
          <span style={{ fontSize: "2rem" }}>✉</span>
        </div>
        <h1
          className="text-3xl font-bold mb-3"
          style={{ color: "#c9a96e", fontFamily: "Georgia, serif" }}
        >
          Invitation Not Found
        </h1>
        <p className="text-base mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
          This invitation link is invalid or has expired.
        </p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
          Please check your invitation link or contact the event organiser.
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // 1. Look up guest by token
  const guest = await guestsCollection.getByToken(token);
  if (!guest) return <NotFoundPage />;

  // 2. Fetch event + sections + theme in parallel
  const [event, sections] = await Promise.all([
    eventsCollection.get(guest.eventId),
    eventSectionsCollection.getByEventId(guest.eventId),
  ]);
  if (!event) return <NotFoundPage />;

  const theme = event.themeId
    ? (await themesCollection.get(event.themeId)) ?? DEFAULT_THEME
    : DEFAULT_THEME;

  // 3. Track view — fire and forget errors so they never break the page
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") ?? undefined;
  try {
    await Promise.all([
      invitationViewsCollection.create({
        guestId: guest.id,
        eventId: guest.eventId,
        token,
        viewedAt: serverTimestamp(),
        userAgent,
      }),
      patchDoc(COLLECTIONS.GUESTS, guest.id, {
        viewed: true,
        viewedAt: serverTimestamp(),
        lastVisit: serverTimestamp(),
        ...(!guest.firstVisit ? { firstVisit: serverTimestamp() } : {}),
        visitCount: (guest.visitCount ?? 0) + 1,
        // Advance status from 'invited' to 'viewed' if still at initial state
        ...(guest.status === "invited" ? { status: "viewed" } : {}),
      }),
    ]);
  } catch {
    // Non-fatal — page still renders
  }

  const allDecorations: DecorationItem[] = sections?.decorations ?? [];
  const displayName = guest.nickname ?? guest.fullName;

  const themeVars: React.CSSProperties = {
    "--color-primary": theme.primaryColor,
    "--color-secondary": theme.secondaryColor,
    "--color-accent": theme.accentColor,
    "--font-family": theme.fontFamily,
  } as React.CSSProperties;

  return (
    <div style={themeVars}>
      {/* ── Personalized Welcome Header ──────────────────────────────────── */}
      <section
        className="relative py-16 px-6 text-center overflow-hidden"
        style={{
          background: `linear-gradient(160deg, #1a0800 0%, ${theme.primaryColor} 40%, #2a1a00 100%)`,
        }}
      >
        {/* Decorative rings */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(201,169,110,0.07) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Gold envelope icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{
              background: `linear-gradient(135deg, ${theme.accentColor}22 0%, ${theme.accentColor}44 100%)`,
              border: `1.5px solid ${theme.accentColor}55`,
            }}
          >
            <span style={{ fontSize: "1.75rem" }}>✉</span>
          </div>

          {/* Ornament line */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-16" style={{ background: `${theme.accentColor}60` }} />
            <span style={{ color: theme.accentColor, fontSize: "1rem" }}>✦</span>
            <div className="h-px w-16" style={{ background: `${theme.accentColor}60` }} />
          </div>

          <p
            className="text-base mb-2"
            style={{ color: `${theme.accentColor}bb`, fontFamily: theme.fontFamily, letterSpacing: "0.02em" }}
          >
            Dear {displayName},
          </p>
          <h1
            className="text-3xl sm:text-4xl font-bold mb-3 leading-tight"
            style={{ color: "#ffffff", fontFamily: theme.fontFamily }}
          >
            You are cordially invited
          </h1>
          <p
            className="text-lg sm:text-xl mb-2"
            style={{ color: theme.accentColor, fontFamily: theme.fontFamily }}
          >
            to {sections?.heroData?.eventTitle ?? event.title}
          </p>

          {sections?.heroData?.eventDate && (
            <p className="text-sm mt-4" style={{ color: "rgba(255,255,255,0.45)" }}>
              {sections.heroData.eventDate}
            </p>
          )}

          {/* Bottom ornament */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="h-px w-24" style={{ background: `${theme.accentColor}40` }} />
            <span style={{ color: `${theme.accentColor}80`, fontSize: "0.75rem" }}>✦ ✦ ✦</span>
            <div className="h-px w-24" style={{ background: `${theme.accentColor}40` }} />
          </div>
        </div>
      </section>

      {/* ── Event Sections ────────────────────────────────────────────────── */}
      {sections?.heroData && (
        <HeroSection heroData={sections.heroData} theme={theme} decorations={allDecorations} />
      )}

      {sections?.storyData && (
        <StorySection storyData={sections.storyData} theme={theme} decorations={allDecorations} />
      )}

      {sections?.timelineItems && sections.timelineItems.length > 0 && (
        <TimelineSection items={sections.timelineItems} theme={theme} />
      )}

      {sections?.scheduleItems && sections.scheduleItems.length > 0 && (
        <ScheduleSection items={sections.scheduleItems} theme={theme} />
      )}

      {sections?.galleryItems && sections.galleryItems.length > 0 && (
        <GallerySection items={sections.galleryItems} theme={theme} />
      )}

      {sections?.locationData && (
        <LocationSection locationData={sections.locationData} theme={theme} />
      )}

      {/* ── Personalized RSVP ────────────────────────────────────────────── */}
      <PersonalizedRSVP
        eventId={guest.eventId}
        guestId={guest.id}
        token={token}
        guestName={guest.fullName}
        currentRsvpStatus={guest.rsvpStatus}
        defaultGuestCount={guest.guestCount ?? 1}
        theme={theme}
      />

      <BlessingWall eventId={guest.eventId} theme={theme} />

      {sections?.giftInfo && (
        <GiftSection giftInfo={sections.giftInfo} theme={theme} />
      )}

      <footer
        className="py-8 text-center text-sm"
        style={{ background: theme.primaryColor, color: "rgba(255,255,255,0.35)" }}
      >
        <p>
          Made with{" "}
          <span style={{ color: theme.accentColor }}>♥</span>
          {" "}using Event CMS
        </p>
      </footer>
    </div>
  );
}
