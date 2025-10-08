import { getEventsBrowse } from '@/lib/queries/eventBrowseQueries';
import Link from 'next/link';
import { generateSlug } from '@/lib/eventSlug';

const FILTER_CATEGORIES = [
  { key: 'all', label: 'All Shows', className: 'card', bandNames: [] },
  { key: 'solo', label: 'Solo Hunter', className: 'event-card-solo', bandNames: ['Robert Hunter'] },
  { key: 'roadhog', label: 'Roadhog', className: 'event-card-roadhog', bandNames: ['Roadhog'] },
  { key: 'comfort', label: 'Comfort', className: 'event-card-comfort', bandNames: ['Comfort'] },
  { key: 'dinosaurs', label: 'Dinosaurs', className: 'event-card-dinosaurs', bandNames: ['Dinosaurs'] },
  { key: 'special', label: 'Ad Hoc Bands', className: 'event-card-special', bandNames: [] },
  { key: 'guest', label: 'Guest Appearances', className: 'event-card-guest', bandNames: [] }
];

import { BandFilterChips } from './BandFilterChips';

function formatEventDate(event: any) {
  let date = '';
  if (event.displayDate) date = event.displayDate;
  else if (event.year && event.month && event.day) {
    const mm = String(event.month).padStart(2, '0');
    const dd = String(event.day).padStart(2, '0');
    date = `${event.year}-${mm}-${dd}`;
  } else if (event.year) date = String(event.year);
  if (event.showTiming && (event.showTiming.toLowerCase() === 'early' || event.showTiming.toLowerCase() === 'late')) {
    date += ` (${event.showTiming.charAt(0).toUpperCase() + event.showTiming.slice(1).toLowerCase()})`;
  }
  return date;
}

function getPerformerName(event: any) {
  return event.primaryBand?.name || 'Solo';
}

function getCardClass(event: any) {
  if (event.primaryBand && event.primaryBand.isHunterBand === false) {
    return 'event-card-guest';
  }
  const name = getPerformerName(event).toLowerCase();
  if (name === 'robert hunter' || name === 'solo') return 'event-card-solo';
  if (name.includes('roadhog')) return 'event-card-roadhog';
  if (name.includes('comfort')) return 'event-card-comfort';
  if (name.includes('dinosaurs')) return 'event-card-dinosaurs';
  return 'event-card-special';
}

function Setlist({ sets }: { sets: any[] }) {
  if (!sets || sets.length === 0) {
    return <div className="text-gray-500 text-sm italic">No known setlist</div>;
  }
  return (
    <div className="text-sm leading-loose text-gray-800 setlist space-y-2">
      {sets.map((set, i) => (
        <div key={set.id} className="space-y-2">
          <span className="font-semibold">{set.setType?.displayName || `Set ${i + 1}`}:</span>{' '}
          {set.performances.map((perf: any, idx: number) => (
            <span key={perf.id}>
              {perf.song?.title ? perf.song.title : '—'}
              {perf.seguesInto ? ' > ' : (idx < set.performances.length - 1 ? ', ' : '')}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function Pagination({ currentPage, totalPages, searchParams }: { currentPage: number; totalPages: number; searchParams: Record<string, string | undefined> }) {
  const pageLinks = [];
  for (let i = 1; i <= totalPages; i++) {
    const params = new URLSearchParams();
    params.set('page', i.toString());
    if (searchParams.types) {
      params.set('types', searchParams.types);
    }
    pageLinks.push(
      <Link
        key={i}
        href={`/event?${params.toString()}`}
        className={`page-link${i === currentPage ? ' page-link-active' : ''}`}
      >
        {i}
      </Link>
    );
  }
  // Previous/Next links
  const prevParams = new URLSearchParams();
  prevParams.set('page', (currentPage - 1).toString());
  if (searchParams.types) {
    prevParams.set('types', searchParams.types);
  }
  const nextParams = new URLSearchParams();
  nextParams.set('page', (currentPage + 1).toString());
  if (searchParams.types) {
    nextParams.set('types', searchParams.types);
  }
  return (
    <div className="pagination mt-6 flex gap-2 items-center justify-center">
      <Link href={`/event?${prevParams.toString()}`} className="page-link" aria-disabled={currentPage === 1} tabIndex={currentPage === 1 ? -1 : 0}>
        Previous
      </Link>
      {pageLinks}
      <Link href={`/event?${nextParams.toString()}`} className="page-link" aria-disabled={currentPage === totalPages} tabIndex={currentPage === totalPages ? -1 : 0}>
        Next
      </Link>
    </div>
  );
}

export default async function EventBrowsePage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const page = parseInt(searchParams?.page || '1', 10) || 1;
  const prisma = (await import('@/lib/prisma')).prisma;
  const { getAllEventsWhere } = await import('@/lib/queryDefaults');

  // Parse selected types from searchParams.types
  const ALL_KEYS = FILTER_CATEGORIES.map((cat: { key: string }) => cat.key);
  const selectedTypes = (searchParams.types?.split(',').map((s: string) => s.trim()).filter((key: string) => ALL_KEYS.includes(key))) || ALL_KEYS;

  // Build OR filter for selected categories
  let bandOrFilters: any[] = [];
  if (selectedTypes.length < ALL_KEYS.length) {
    for (const type of selectedTypes) {
      if (type === 'solo') {
        bandOrFilters.push({ primaryBand: { name: 'Robert Hunter' } });
      } else if (type === 'roadhog') {
        bandOrFilters.push({ primaryBand: { name: 'Roadhog' } });
      } else if (type === 'comfort') {
        bandOrFilters.push({ primaryBand: { name: 'Comfort' } });
      } else if (type === 'dinosaurs') {
        bandOrFilters.push({ primaryBand: { name: 'Dinosaurs' } });
      } else if (type === 'special') {
        bandOrFilters.push({ primaryBand: { isHunterBand: true, name: { notIn: ['Robert Hunter', 'Roadhog', 'Comfort', 'Dinosaurs'] } } });
      } else if (type === 'guest') {
        bandOrFilters.push({ primaryBand: { isHunterBand: false } });
      }
    }
  }

  // Query counts for each filter category (unchanged)
  const allCount = await prisma.event.count({ where: getAllEventsWhere() });
  const soloCount = await prisma.event.count({ where: { primaryBand: { name: 'Robert Hunter' } } });
  const roadhogCount = await prisma.event.count({ where: { primaryBand: { name: 'Roadhog' } } });
  const comfortCount = await prisma.event.count({ where: { primaryBand: { name: 'Comfort' } } });
  const dinosaursCount = await prisma.event.count({ where: { primaryBand: { name: 'Dinosaurs' } } });
  const specialCount = await prisma.event.count({ where: { primaryBand: { isHunterBand: true, name: { notIn: ['Robert Hunter', 'Roadhog', 'Comfort', 'Dinosaurs'] } } } });
  const guestCount = await prisma.event.count({ where: { primaryBand: { isHunterBand: false } } });

  const bandCounts = [
    { key: 'all', label: 'All Shows', className: 'card', count: allCount },
    { key: 'solo', label: 'Solo Hunter', className: 'event-card-solo', count: soloCount },
    { key: 'roadhog', label: 'Roadhog', className: 'event-card-roadhog', count: roadhogCount },
    { key: 'comfort', label: 'Comfort', className: 'event-card-comfort', count: comfortCount },
    { key: 'dinosaurs', label: 'Dinosaurs', className: 'event-card-dinosaurs', count: dinosaursCount },
    { key: 'special', label: 'Ad-Hoc Bands', className: 'event-card-special', count: specialCount },
    { key: 'guest', label: 'Guest Appearances', className: 'event-card-guest', count: guestCount }
  ];

  // Build where clause for events query
  const baseWhere = getAllEventsWhere();
  const where = (bandOrFilters.length > 0)
    ? { ...baseWhere, OR: bandOrFilters }
    : baseWhere;

  const { events, totalCount, currentPage, totalPages, pageSize } = await getEventsBrowse({ page, where });

  // Color legend for each artist
  const legend = [
    { label: 'Robert Hunter', className: 'event-card-solo' },
    { label: 'Roadhog', className: 'event-card-roadhog' },
    { label: 'Comfort', className: 'event-card-comfort' },
    { label: 'Dinosaurs', className: 'event-card-dinosaurs' },
    { label: 'Ad-Hoc Bands', className: 'event-card-special' },
    { label: 'Guest Appearances', className: 'event-card-guest' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Browse Events</h1>
      {/* Band filter chips */}
      <BandFilterChips bandCounts={bandCounts} selectedKeys={selectedTypes} />
      <div className="grid grid-cols-1 gap-4">
        {events.map((event: any) => (
          <Link
            key={event.id}
            href={`/event/${event.slug ?? generateSlug(event)}`}
            className={`event-card ${getCardClass(event)} block p-6`}
          >
            {/* Display billing or band name, default to Robert Hunter */}
            <div className="mb-2 text-sm font-medium text-gray-700">
              {event.billing
                ? event.billing
                : event.primaryBand?.name
                ? event.primaryBand.name
                : 'Robert Hunter'}
            </div>
            <div className="mb-4">
              <div className="flex items-center gap-3 text-lg font-semibold">
                <span>{formatEventDate(event)}</span>
                <span className="text-gray-700 text-base font-normal">{event.venue?.name}{event.venue?.city ? `, ${event.venue.city}` : ''}{event.venue?.stateProvince ? `, ${event.venue.stateProvince}` : ''}</span>
              </div>
            </div>
            <div className="space-y-4">
              <Setlist sets={event.sets} />
            </div>
          </Link>
        ))}
      </div>
  <Pagination currentPage={currentPage} totalPages={totalPages} searchParams={searchParams} />
    </div>
  );
}
