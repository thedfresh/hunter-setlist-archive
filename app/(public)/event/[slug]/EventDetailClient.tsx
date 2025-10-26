'use client';
import React, { useState, useEffect } from 'react';
import EventCard from '@/components/ui/events/EventCard';

interface EventDetailClientProps {
  event: any;
  prevEvent: { slug: string } | null;
  nextEvent: { slug: string } | null;
}

export default function EventDetailClient({ event, prevEvent, nextEvent }: EventDetailClientProps) {
  const [viewMode, setViewMode] = useState<'standard' | 'complete'>('standard');
  const [isHydrated, setIsHydrated] = useState(false);

  // Load view mode from localStorage after hydration
  useEffect(() => {
    setIsHydrated(true);
    const saved = localStorage.getItem('setlist-view-mode');
    if (saved === 'standard' || saved === 'complete') {
      setViewMode(saved);
    }
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
