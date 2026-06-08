'use client';

import { createContext, useContext } from 'react';
import type { EventVisualSettings } from '@/lib/types';

const EventVisualContext = createContext<EventVisualSettings | null>(null);

export function EventVisualProvider({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: EventVisualSettings;
}) {
  return (
    <EventVisualContext.Provider value={settings}>
      {children}
    </EventVisualContext.Provider>
  );
}

export function useEventVisual(): EventVisualSettings | null {
  return useContext(EventVisualContext);
}
