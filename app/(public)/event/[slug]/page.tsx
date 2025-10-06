
import { notFound } from 'next/navigation';
import React from 'react';

import EventHeader from '@/components/ui/EventHeader';
import EventSetlist from '@/components/ui/EventSetlist';
import PerformanceNotes from '@/components/ui/PerformanceNotes';
import RecordingsSection from '@/components/ui/RecordingsSection';
import ContributorsSection from '@/components/ui/ContributorsSection';
import StageTalk from '@/components/ui/StageTalk';
import { fetchEventBySlug, fetchAdjacentEvents } from '@/lib/eventQueries';


export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);
  if (!event) notFound();
  const adjacent = await fetchAdjacentEvents(event);

  // Dynamic performer card class
  const performer = event.primaryBand?.name || 'Solo Hunter';
  let cardClass = 'event-card-solo';
  if (performer === 'Dinosaurs') cardClass = 'event-card-dinosaurs';
  else if (performer === 'Comfort') cardClass = 'event-card-comfort';
  else if (performer === 'Roadhog') cardClass = 'event-card-roadhog';

  // Flatten performances for notes
  const flattenedPerformances = event.sets.flatMap((s: any) => s.performances);

  return (
    <main className={`event-card ${cardClass} p-6`}>
      <EventHeader
        event={{
          year: event.year ?? 0,
          month: event.month ?? undefined,
          day: event.day ?? undefined,
          displayDate: event.displayDate,
          venue: event.venue,
          primaryBand: event.primaryBand,
          showTiming: event.showTiming,
          verified: event.verified,
        }}
        eventMusicians={event.eventMusicians
          ?.filter((em: any) => em.musician && em.instrument)
          .map((em: any) => ({ musician: { name: em.musician.name }, instrument: { name: em.instrument.name } }))}
        adjacent={adjacent}
      />
      {event.publicNotes && (
        <div className="notes-section mb-6">
          <div className="notes-title font-semibold mb-1">Show Notes</div>
          <div className="notes-content">{event.publicNotes}</div>
        </div>
      )}
      <EventSetlist sets={event.sets} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <PerformanceNotes performances={flattenedPerformances} />
            <ContributorsSection
              contributors={
                (event.eventContributors || [])
                  .filter((c: any) => c.contributor && c.description != null)
                  .map((c: any) => ({
                    id: c.id,
                    description: c.description ?? '',
                    contributor: { name: c.contributor.name },
                  }))
              }
            />
            <RecordingsSection recordings={event.recordings} />
          </div>
          <div>
            <StageTalk sets={event.sets} />
          </div>
        </div>
    </main>
  );
}
