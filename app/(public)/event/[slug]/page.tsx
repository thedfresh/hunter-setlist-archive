
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
  const adjacent = await fetchAdjacentEvents({
    year: event.year,
    month: event.month,
    day: event.day,
    showTiming: event.showTiming,
  slug: event.slug ?? undefined
  });

  // Dynamic performer card class
  let cardClass = 'event-card-solo';
  if (event.primaryBand && event.primaryBand.isHunterBand === false) {
    cardClass = 'event-card-guest';
  } else {
    const performer = event.primaryBand?.name || 'Solo Hunter';
    if (performer === 'Dinosaurs') cardClass = 'event-card-dinosaurs';
    else if (performer === 'Comfort') cardClass = 'event-card-comfort';
    else if (performer === 'Roadhog') cardClass = 'event-card-roadhog';
    else if (performer === 'Solo Hunter') cardClass = 'event-card-solo';
    else cardClass = 'event-card-special';
  }

  // Determine if Show Notes section should be shown
  const hasEventMusicians = event.eventMusicians && event.eventMusicians.length > 0;
  const hasBandContext = event.sets && event.sets.some((set: any) => set.bandId && set.bandId !== event.primaryBandId && set.band);
  const hasSetMusicians = event.sets && event.sets.some((set: any) => set.setMusicians && set.setMusicians.length > 0);
  const hasPublicNotes = !!event.publicNotes;
  const showNotesSection = hasEventMusicians || hasBandContext || hasSetMusicians || hasPublicNotes;

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
        adjacent={adjacent}
      />
      { showNotesSection ? (
        <div className="notes-section mb-6">
          <div className="notes-title font-semibold mb-1">Show Notes</div>
          {/* Event-level musicians */}
          {event.eventMusicians && event.eventMusicians.length > 0 && (
            <div className="text-xs text-gray-700 mb-2">
              With {event.eventMusicians
                .filter((em: any) => em.musician && em.instrument)
                .map((em: any) => `${em.musician.name} on ${em.instrument.name}`)
                .join(', ')}
            </div>
          )}
          {/* Set band context lines */}
          {event.sets && event.sets.length > 0 && event.sets.map((set: any, idx: number) => (
            (set.bandId && set.bandId !== event.primaryBandId && set.band) ? (
              <div key={set.id} className="text-xs text-gray-700 mb-2">
                Set {set.position ?? idx + 1} is {set.band.name}
              </div>
            ) : null
          ))}
          {/* Set-level musicians */}
          {event.sets && event.sets.length > 0 && event.sets.map((set: any, idx: number) => (
            (set.setMusicians && set.setMusicians.length > 0) ? (
              <div key={set.id + '-musicians'} className="text-xs text-gray-700 mb-2">
                Set {idx + 1}: with {set.setMusicians
                  .filter((sm: any) => sm.musician && sm.instrument)
                  .map((sm: any) => `${sm.musician.name} on ${sm.instrument.displayName}`)
                  .join(', ')}
              </div>
            ) : null
          ))}
          {/* Public notes */}
          {event.publicNotes && (
            <div className="notes-content">{event.publicNotes}</div>
          )}
        </div>
      ) : (<div className="mt-6"></div>) }
 
      <EventSetlist
        sets={event.sets.map((set: any) => ({
          ...set
        }))}
        eventPrimaryBandId={event.primaryBandId}
      />
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
                    contributor: { name: c.contributor.name }
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
