'use client';

import dynamic from 'next/dynamic';
import type { EventVisualSettings } from '@/lib/types';

const EventPageClient = dynamic(
  () => import('@/app/event/[slug]/EventPageClient'),
  { ssr: false, loading: () => <div className="min-h-screen bg-white" /> }
);

interface Props {
  eventId: string;
  slug: string;
  visualSettings?: EventVisualSettings;
  children: React.ReactNode;
}

export default function EventPageWrapper(props: Props) {
  return <EventPageClient {...props} />;
}
