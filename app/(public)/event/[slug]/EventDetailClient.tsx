'use client';
import React, { useState, useEffect } from 'react';
import EventCard from '@/components/ui/events/EventCard';

interface EventDetailClientProps {
  event: any;
  prevEvent: { slug: string } | null;
  nextEvent: { slug: string } | null;
}

export default function EventDetailClient({ event, prevEvent, nextEvent }: EventDetailClientProps) {
  const [viewMode, setViewMode] = useState<'standard' | 'complete'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('setlist-view-mode');
      if (saved === 'standard' || saved === 'complete') return saved;
    }
    return 'standard';
  });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Save preference when changed
  function handleViewModeChange(mode: 'standard' | 'complete') {
    setViewMode(mode);
    if (isHydrated) {
      localStorage.setItem('setlist-view-mode', mode);
    }
  }

  return (
    <EventCard
      event={event}
      showPrevNext={true}
      showViewToggle={true}
      showPerformanceNotes={true}
      showStageTalk={true}
      showRecordings={true}
      showContributors={true}
      viewMode={viewMode}
      onViewModeChange={handleViewModeChange}
      prevEvent={prevEvent}
      nextEvent={nextEvent}
    />
  );
}
