'use client';

import { PageContainer } from '@/components/ui/PageContainer';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { BandFilterChips } from './BandFilterChips';
import { formatEventDate } from '@/lib/formatters/dateFormatter';
import { getPerformerCardClass } from '@/lib/utils/performerStyles';
import Pagination from '@/components/ui/Pagination'

import Setlist from '@/components/ui/Setlist';

export const dynamic = 'force-dynamic';

function getEventDisplayDate(event: any) {
  if (event.displayDate) return event.displayDate;
  return formatEventDate(event);
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
                className={`event-card ${getPerformerCardClass(event)} block p-6`}
              >
                <div className="mb-2 text-sm font-medium text-gray-700">
                  {event.billing ? event.billing : event.primaryBand?.name || 'Robert Hunter'}
                </div>
                <div className="mb-4">
                  <div className="flex items-center gap-3 text-lg font-semibold">
                    <span>{getEventDisplayDate(event)}</span>
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

          <Pagination currentPage={currentPage} totalPages={totalPages} searchParams={searchParamsObj} basePath='/event' />
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