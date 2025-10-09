import { PageContainer } from '@/components/ui/PageContainer';
import { searchEvents } from '@/lib/queries/eventSearchQueries';
import Link from 'next/link';

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
  const results = await searchEvents({ searchParams });
  const {
    events,
    bandCounts,
    totalCount,
    currentPage,
    totalPages,
    pageSize,
    selectedTypes,
    search,
    searchType
  } = results;

  // Color legend for each artist
  const legend = [
    { label: 'Robert Hunter', className: 'event-card-solo' },
    { label: 'Roadhog', className: 'event-card-roadhog' },
    { label: 'Comfort', className: 'event-card-comfort' },
    { label: 'Dinosaurs', className: 'event-card-dinosaurs' },
    { label: 'Ad-Hoc Bands', className: 'event-card-special' },
    { label: 'Guest Appearances', className: 'event-card-guest' },
  ];

  // --- ACTIVE SEARCH DISPLAY ---
  const hasActiveSearch = !!(search && searchType);

  function getSearchLabel(type: string) {
    if (type === "year") return "Year";
    if (type === "venue") return "Venue";
    if (type === "city") return "City";
    if (type === "state") return "State";
    return "Search";
  }

  // --- CLEAR SEARCH BUTTON ---
  function getClearSearchUrl(params: Record<string, string | undefined>) {
    const newParams = { ...params };
    delete newParams.search;
    delete newParams.searchType;
    const urlParams = new URLSearchParams(newParams as Record<string, string>);
    return `/event?${urlParams.toString()}`;
  }

  return (
    <PageContainer>
      <div className="flex gap-10">
        {/* Left sidebar - 180px to match nav offset */}
        <div className="fixed left-10 top-[160px] w-[160px]">
          <BandFilterChips bandCounts={bandCounts} selectedKeys={selectedTypes} />
        </div>
        {/* Main content */}
        <div className="flex-1">
          <div className="page-header">
            <div className="page-title">Browse Events</div>
          </div>      {/* Band filter chips */}

          {hasActiveSearch && (
            <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded px-4 py-2">
              <span className="text-blue-700 font-medium">Showing results for: <span className="font-bold">{getSearchLabel(searchType)}: {search}</span></span>
              <Link href={getClearSearchUrl(searchParams)} className="ml-2 px-2 py-1 text-xs bg-blue-100 rounded hover:bg-blue-200 text-blue-800 border border-blue-300">Clear</Link>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4">
            {events.map((event: any) => (
              <Link
                key={event.id}
                href={`/event/${event.slug}`}
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
      </div>
    </PageContainer>
  );
}
