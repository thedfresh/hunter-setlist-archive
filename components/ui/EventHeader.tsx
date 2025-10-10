import React from 'react';
import Link from 'next/link';
import { getPerformerCardClass } from '@/lib/utils/performerStyles';

interface EventHeaderProps {
  event: {
    year: number;
    month?: number | null;
    day?: number | null;
    displayDate?: string | null;
    venue?: { name: string; city?: string | null; stateProvince?: string | null } | null;
    primaryBand?: { name: string } | null;
    showTiming?: string | null;
    verified?: boolean;
    isNotHunterBand?: boolean;
  };
  eventMusicians?: Array<{ musician: { name: string }; instrument: { name: string } }>;
  adjacent: {
    prev: { slug: string } | null;
    next: { slug: string } | null;
  };
}

function formatDateAmerican(event: EventHeaderProps['event']) {
  // Use displayDate if provided
  if (event.displayDate) return event.displayDate;
  // Always format as MM/DD/YYYY
  const m = event.month ? event.month.toString().padStart(2, '0') : '??';
  const d = event.day ? event.day.toString().padStart(2, '0') : '??';
  const y = event.year;
  let dateStr = `${m}/${d}/${y}`;
  if (event.showTiming) {
    if (event.showTiming === 'Early') {
      dateStr += ' (Early Show)';
    } else if (event.showTiming === 'Late') {
      dateStr += ' (Late Show)';
    } else {
      dateStr += ` (${event.showTiming})`;
    }
  }
  return dateStr;
}

const EventHeader: React.FC<EventHeaderProps> = ({ event, eventMusicians, adjacent }) => {
  const performer = event.primaryBand?.name || 'Robert Hunter';
  const performerClass = getPerformerCardClass({
    primaryBand: event.primaryBand ? {
      name: event.primaryBand.name,
      isHunterBand: !event.isNotHunterBand
    } : { name: 'Robert Hunter', isHunterBand: true }
  });
  const venue = event.venue
    ? `${event.venue.name}${event.venue.city ? ', ' + event.venue.city : ''}${event.venue.stateProvince ? ', ' + event.venue.stateProvince : ''}`
    : '';

  return (
    <>
      <div className={`flex justify-between items-center mb-2`}>
        <div className={`card-title ${performerClass}`}>{performer}</div>
        <div className="flex gap-2">
          <Link href={adjacent.prev ? `/event/${adjacent.prev.slug}` : '#'}>
            <button className="btn btn-secondary btn-small" disabled={!adjacent.prev}>
              Prev
            </button>
          </Link>
          <Link href={adjacent.next ? `/event/${adjacent.next.slug}` : '#'}>
            <button className="btn btn-secondary btn-small" disabled={!adjacent.next}>
              Next
            </button>
          </Link>
        </div>
      </div>
      <div className="flex justify-between items-start card-subtitle mb-1">
        <div className="font-bold text-base">
          <span>{formatDateAmerican(event)}</span>
          {venue && (
            <>
              <br className="leading-tight half-line" />
              <span className="block leading-tight half-line text-base">{venue}</span>
            </>
          )}
        </div>
      </div>
      {eventMusicians && eventMusicians.length > 0 && (
        <div className="card-subtitle italic mb-6">
          With {eventMusicians.map((em) => `${em.musician.name} on ${em.instrument.name}`).join(', ')}
        </div>
      )}
    </>
  );
};

export default EventHeader;
