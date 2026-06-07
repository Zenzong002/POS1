export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import { eventsCollection, eventSectionsCollection, themesCollection } from "@/lib/firebase/firestore";
import type { Theme, DecorationItem } from "@/lib/types";

// Section components
import HeroSection from "@/components/event/HeroSection";
import StorySection from "@/components/event/StorySection";
import TimelineSection from "@/components/event/TimelineSection";
import ScheduleSection from "@/components/event/ScheduleSection";
import GallerySection from "@/components/event/GallerySection";
import LocationSection from "@/components/event/LocationSection";
import RSVPSection from "@/components/event/RSVPSection";
import BlessingWall from "@/components/event/BlessingWall";
import GiftSection from "@/components/event/GiftSection";

// ─── Default theme fallback ───────────────────────────────────────────────────

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

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getEventPageData(slug: string) {
  // Fetch event by slug
  const event = await eventsCollection.getBySlug(slug);

  if (!event || event.status !== "published") {
    return null;
  }

  // Fetch sections and theme in parallel
  const [sections, theme] = await Promise.all([
    eventSectionsCollection.getByEventId(event.id),
    event.themeId ? themesCollection.get(event.themeId) : Promise.resolve(null),
  ]);

  return {
    event,
    sections: sections ?? null,
    theme: theme ?? DEFAULT_THEME,
  };
}

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const data = await getEventPageData(slug);

  if (!data) {
    return {
      title: "Event Not Found",
      robots: { index: false, follow: false },
    };
  }

  const { event, sections } = data;
  const heroTitle = sections?.heroData?.eventTitle ?? event.title;
  const seoTitle = event.seoTitle ?? heroTitle;
  const seoDescription =
    event.seoDescription ??
    sections?.storyData?.description?.slice(0, 160) ??
    `Join us for ${heroTitle}`;
  const coverImage = sections?.heroData?.coverImageUrl ?? sections?.heroData?.heroBackgroundUrl;

  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      ...(coverImage ? { images: [{ url: coverImage }] } : {}),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      ...(coverImage ? { images: [coverImage] } : {}),
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const data = await getEventPageData(slug);
  if (!data) notFound();

  const { event, sections, theme } = data;

  // Split decorations by section or share all across sections
  const allDecorations: DecorationItem[] = sections?.decorations ?? [];

  // CSS custom properties for theming
  const themeVars: React.CSSProperties = {
    "--color-primary": theme.primaryColor,
    "--color-secondary": theme.secondaryColor,
    "--color-accent": theme.accentColor,
    "--font-family": theme.fontFamily,
  } as React.CSSProperties;

  return (
    <div style={themeVars}>
      {/* Hero */}
      {sections?.heroData && (
        <HeroSection
          heroData={sections.heroData}
          theme={theme}
          decorations={allDecorations}
        />
      )}

      {/* Story */}
      {sections?.storyData && (
        <StorySection
          storyData={sections.storyData}
          theme={theme}
          decorations={allDecorations}
        />
      )}

      {/* Timeline */}
      {sections?.timelineItems && sections.timelineItems.length > 0 && (
        <TimelineSection items={sections.timelineItems} theme={theme} />
      )}

      {/* Schedule */}
      {sections?.scheduleItems && sections.scheduleItems.length > 0 && (
        <ScheduleSection items={sections.scheduleItems} theme={theme} />
      )}

      {/* Gallery */}
      {sections?.galleryItems && sections.galleryItems.length > 0 && (
        <GallerySection items={sections.galleryItems} theme={theme} />
      )}

      {/* Location */}
      {sections?.locationData && (
        <LocationSection locationData={sections.locationData} theme={theme} />
      )}

      {/* RSVP */}
      <RSVPSection eventId={event.id} theme={theme} />

      {/* Blessing wall */}
      <BlessingWall eventId={event.id} theme={theme} />

      {/* Gift */}
      {sections?.giftInfo && (
        <GiftSection giftInfo={sections.giftInfo} theme={theme} />
      )}

      {/* Footer */}
      <footer
        className="py-8 text-center text-sm"
        style={{
          background: theme.primaryColor,
          color: "rgba(255,255,255,0.45)",
        }}
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
