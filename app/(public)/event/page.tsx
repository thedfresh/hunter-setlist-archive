'use client';

import { PageContainer } from '@/components/ui/PageContainer';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { BandFilterChips } from './BandFilterChips';

export const dynamic = 'force-dynamic';

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

function Pagination({ currentPage, totalPages, searchParams }: { currentPage: number; totalPages: number; searchParams: Record<string, string> }) {
  const pageLinks = [];
  for (let i = 1; i <= totalPages; i++) {
    const params = new URLSearchParams(searchParams);
    params.set('page', i.toString());
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

  const prevParams = new URLSearchParams(searchParams);
  prevParams.set('page', (currentPage - 1).toString());
  const nextParams = new URLSearchParams(searchParams);
  nextParams.set('page', (currentPage + 1).toString());

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

function EventBrowsePageContent() {
  const searchParamsHook = useSearchParams();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = Object.fromEntries(searchParamsHook.entries());

    fetch(`/api/events/search?${new URLSearchParams(params)}`)
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load events:', err);
        setLoading(false);
      });
  }, [searchParamsHook]);

  if (loading) {
    return (
      <PageContainer>
        <div className="text-center py-12">Loading events...</div>
      </PageContainer>
    );
  }

  if (!results) {
    return (
      <PageContainer>
        <div className="text-center py-12 text-red-600">Failed to load events</div>
      </PageContainer>
    );
  }

  const { events, bandCounts, currentPage, totalPages, selectedTypes, search, searchType } = results;
  const searchParamsObj = Object.fromEntries(searchParamsHook.entries());

  const hasActiveSearch = !!(search && searchType);

  function getSearchLabel(type: string) {
    if (type === "year") return "Year";
    if (type === "venue") return "Venue";
    if (type === "city") return "City";
    if (type === "state") return "State";
    return "Search";
  }

  function getClearSearchUrl(params: Record<string, string>) {
    const newParams = { ...params };
    delete newParams.search;
    delete newParams.searchType;
    const urlParams = new URLSearchParams(newParams);
    return `/event?${urlParams.toString()}`;
  }

  return (
    <PageContainer>
      <div className="flex gap-10">
        <div className="fixed left-10 top-[160px] w-[160px]">
          <BandFilterChips bandCounts={bandCounts} selectedKeys={selectedTypes} />
        </div>
        <div className="flex-1">
          <div className="page-header">
            <div className="page-title">Browse Events</div>
          </div>

          {hasActiveSearch && (
            <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded px-4 py-2">
              <span className="text-blue-700 font-medium">Showing results for: <span className="font-bold">{getSearchLabel(searchType)}: {search}</span></span>
              <Link href={getClearSearchUrl(searchParamsObj)} className="ml-2 px-2 py-1 text-xs bg-blue-100 rounded hover:bg-blue-200 text-blue-800 border border-blue-300">Clear</Link>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {events.map((event: any) => (
              <Link
                key={event.id}
                href={`/event/${event.slug}`}
                className={`event-card ${getCardClass(event)} block p-6`}
              >
                <div className="mb-2 text-sm font-medium text-gray-700">
                  {event.billing ? event.billing : event.primaryBand?.name ? event.primaryBand.name : 'Robert Hunter'}
                </div>
                <div className="mb-4">
                  <div className="flex items-center gap-3 text-lg font-semibold">
                    <span>{formatEventDate(event)}</span>
                    <span className="text-gray-700 text-base font-normal">
                      {event.venue?.name}{event.venue?.city ? `, ${event.venue.city}` : ''}{event.venue?.stateProvince ? `, ${event.venue.stateProvince}` : ''}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <Setlist sets={event.sets} />
                </div>
              </Link>
            ))}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} searchParams={searchParamsObj} />
        </div>
      </div>
    </PageContainer>
  );
}

export default function EventBrowsePage() {
  return (
    <Suspense fallback={
      <PageContainer>
        <div className="text-center py-12">Loading...</div>
      </PageContainer>
    }>
      <EventBrowsePageContent />
    </Suspense>
  );
}