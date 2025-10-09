import { PageContainer } from '@/components/ui/PageContainer';
import { getEventsBrowse } from '@/lib/queries/eventBrowseQueries';
import Link from 'next/link';

const FILTER_CATEGORIES = [
  { key: 'all', label: 'All Events', className: 'card', bandNames: [] },
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
  const { getBrowsableEventsWhere } = await import('@/lib/queryFilters');

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

  // --- SEARCH FILTER LOGIC ---
  const search = searchParams.search || "";
  const searchType = searchParams.searchType || "";
  let searchFilter: any = null;
  if (search && searchType) {
    if (searchType === "year") {
      const yearNum = parseInt(search);
      if (!isNaN(yearNum)) searchFilter = { year: yearNum };
    } else if (searchType === "yearMonth") {
      const [yearStr, monthStr] = search.split('-');
      const yearNum = parseInt(yearStr);
      const monthNum = parseInt(monthStr);
      if (!isNaN(yearNum) && !isNaN(monthNum)) {
        searchFilter = { year: yearNum, month: monthNum };
      }
    } else if (searchType === "date") {
      const [yearStr, monthStr, dayStr] = search.split('-');
      const yearNum = parseInt(yearStr);
      const monthNum = parseInt(monthStr);
      const dayNum = parseInt(dayStr);
      if (!isNaN(yearNum) && !isNaN(monthNum) && !isNaN(dayNum)) {
        searchFilter = { year: yearNum, month: monthNum, day: dayNum };
      }
    } else if (searchType === "venue") {
      searchFilter = { venue: { name: { contains: search, mode: "insensitive" } } };
    } else if (searchType === "city") {
      searchFilter = { venue: { city: { contains: search, mode: "insensitive" } } };
    } else if (searchType === "state") {
      searchFilter = { venue: { stateProvince: { contains: search, mode: "insensitive" } } };
    } else if (searchType === "band") {
      // Find the band by name to get its ID
      const band = await prisma.band.findFirst({
        where: { name: { equals: search, mode: 'insensitive' } }
      });
      if (band) {
        searchFilter = { primaryBandId: band.id };
      }
    } else if (searchType === "musician") {
      const musician = await prisma.musician.findFirst({
        where: { name: { equals: search, mode: 'insensitive' } }
      });
      if (musician) {
        searchFilter = {
          OR: [
            { eventMusicians: { some: { musicianId: musician.id } } },
            { sets: { some: { setMusicians: { some: { musicianId: musician.id } } } } },
            { sets: { some: { performances: { some: { performanceMusicians: { some: { musicianId: musician.id } } } } } } }
          ]
        };
      }
    } else if (searchType === "person-all") {

      const [bands, musicians] = await Promise.all([
        prisma.band.findMany({
          where: { name: { equals: search, mode: 'insensitive' } }
        }),
        prisma.musician.findMany({
          where: { name: { equals: search, mode: 'insensitive' } }
        })
      ]);

      const bandIds = bands.map(b => b.id);
      const musicianIds = musicians.map(m => m.id);

      if (bandIds.length > 0 || musicianIds.length > 0) {
        searchFilter = {
          OR: [
            ...(bandIds.length > 0 ? [{ primaryBandId: { in: bandIds } }] : []),
            ...(musicianIds.length > 0 ? [
              { eventMusicians: { some: { musicianId: { in: musicianIds } } } },
              { sets: { some: { setMusicians: { some: { musicianId: { in: musicianIds } } } } } },
              { sets: { some: { performances: { some: { performanceMusicians: { some: { musicianId: { in: musicianIds } } } } } } } },
              { primaryBand: { bandMusicians: { some: { musicianId: { in: musicianIds } } } } }
            ] : [])
          ]
        };
      }
    } else if (searchType === "person-band") {
      const bandId = parseInt(searchParams.bandId || '0');
      const musicianId = parseInt(searchParams.musicianId || '0');
      if (bandId && musicianId) {
        searchFilter = {
          primaryBandId: bandId,
          primaryBand: { bandMusicians: { some: { musicianId } } }
        };
      }
    } else if (searchType === "person-guest") {
      const musician = await prisma.musician.findFirst({
        where: { name: { equals: search, mode: 'insensitive' } }
      });
      if (musician) {
        searchFilter = {
          OR: [
            { eventMusicians: { some: { musicianId: musician.id } } },
            { sets: { some: { setMusicians: { some: { musicianId: musician.id } } } } },
            { sets: { some: { performances: { some: { performanceMusicians: { some: { musicianId: musician.id } } } } } } }
          ]
        };
      }
    }

  }

  // Query counts for each filter category (unchanged)
  const allCount = await prisma.event.count({ where: getBrowsableEventsWhere() });
  const soloCount = await prisma.event.count({ where: { primaryBand: { name: 'Robert Hunter' } } });
  const roadhogCount = await prisma.event.count({ where: { primaryBand: { name: 'Roadhog' } } });
  const comfortCount = await prisma.event.count({ where: { primaryBand: { name: 'Comfort' } } });
  const dinosaursCount = await prisma.event.count({ where: { primaryBand: { name: 'Dinosaurs' } } });
  const specialCount = await prisma.event.count({ where: { primaryBand: { isHunterBand: true, name: { notIn: ['Robert Hunter', 'Roadhog', 'Comfort', 'Dinosaurs'] } } } });
  const guestCount = await prisma.event.count({ where: { primaryBand: { isHunterBand: false } } });

  const bandCounts = [
    { key: 'all', label: 'All Events', className: 'card', count: allCount },
    { key: 'solo', label: 'Solo Hunter', className: 'event-card-solo', count: soloCount },
    { key: 'roadhog', label: 'Roadhog', className: 'event-card-roadhog', count: roadhogCount },
    { key: 'comfort', label: 'Comfort', className: 'event-card-comfort', count: comfortCount },
    { key: 'dinosaurs', label: 'Dinosaurs', className: 'event-card-dinosaurs', count: dinosaursCount },
    { key: 'special', label: 'Ad-Hoc Bands', className: 'event-card-special', count: specialCount },
    { key: 'guest', label: 'Guest Spots', className: 'event-card-guest', count: guestCount }
  ];

  // Build where clause for events query
  // Build where clause for events query
  const baseWhere = getBrowsableEventsWhere();

  let where: any;

  // Case 1: No filters at all
  if (bandOrFilters.length === 0 && !searchFilter) {
    where = baseWhere;
  }
  // Case 2: Only band filters
  else if (bandOrFilters.length > 0 && !searchFilter) {
    where = {
      AND: [
        baseWhere,
        { OR: bandOrFilters }
      ]
    };
  }
  // Case 3: Only search filter (no band filters)
  else if (!bandOrFilters.length && searchFilter) {
    if (searchFilter.OR) {
      // Search filter has OR, wrap in AND with baseWhere
      where = {
        AND: [
          baseWhere,
          searchFilter
        ]
      };
    } else {
      // Simple search filter, wrap in AND with baseWhere
      where = {
        AND: [
          baseWhere,
          searchFilter
        ]
      };
    }
  }
  // Case 4: Both band filters AND search filter
  else {
    where = {
      AND: [
        baseWhere,
        { OR: bandOrFilters },
        searchFilter
      ]
    };
  }

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
