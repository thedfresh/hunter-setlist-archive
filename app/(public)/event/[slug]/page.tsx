import React from 'react';
import EventCard from '@/components/ui/events/EventCard';
import { getEventBySlugWithNavigation } from '@/lib/queries/eventDetailQueries';
import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/ui/PageContainer';
import { formatEventDate } from '@/lib/formatters/dateFormatter';
import { formatVenue } from '@/lib/formatters/venueFormatter';
import Link from 'next/link';
import { calculateEventStatistics } from '@/lib/queries/eventDetailQueries';
type EventStatistics = {
  firstPerformances: Array<{ songId: number; songTitle: string; songSlug: string }>;
  lastPerformances: Array<{ songId: number; songTitle: string; songSlug: string }>;
  onlyPerformances: Array<{ songId: number; songTitle: string; songSlug: string }>;
  comebacks: Array<{ songId: number; songTitle: string; songSlug: string; gap: number }>;
};
import EventDetailClient from './EventDetailClient';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { event } = await getEventBySlugWithNavigation(params.slug);

  if (!event) {
    return {
      title: 'Event Not Found | Hunter Archive',
    };
  }

  const performer = event.primaryBand?.name || 'Robert Hunter';
  const venue = event.venue;
  const title = venue
    ? `${formatEventDate(event)} - ${performer} at ${formatVenue(venue)} | Hunter Archive`
    : `${formatEventDate(event)} - ${performer} | Hunter Archive`;

  return {
    title,
    description: `Setlist and recordings from ${performer}${venue ? ` at ${venue.name}` : ''}`,
  };
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const { event, prevEvent, nextEvent } = await getEventBySlugWithNavigation(params.slug);

  if (!event) {
    return notFound();
  }

  // Only pass navigation events with a valid slug
  const safePrevEvent = prevEvent && typeof prevEvent.slug === 'string' ? { ...prevEvent, slug: prevEvent.slug } : null;
  const safeNextEvent = nextEvent && typeof nextEvent.slug === 'string' ? { ...nextEvent, slug: nextEvent.slug } : null;

  // Calculate statistics server-side
  const stats: EventStatistics = await calculateEventStatistics(event);

  return (
    <PageContainer>
      <EventDetailClient
        event={event}
        prevEvent={safePrevEvent}
        nextEvent={safeNextEvent}
        stats={stats}
      />
    </PageContainer>
  );
}
