'use client';

import { PageContainer } from '@/components/ui/PageContainer';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { BandFilterChips } from './BandFilterChips';
import Link from 'next/link';
import EventCard from '@/components/ui/events/EventCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const dynamic = 'force-dynamic';

function EventBrowsePageContent() {
  const searchParamsHook = useSearchParams();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'standard' | 'complete'>('standard');
  const [eventViewModes, setEventViewModes] = useState<Record<number, 'standard' | 'complete'>>({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  useEffect(() => {
    setIsHydrated(true);
    const savedViewMode = localStorage.getItem('setlist-view-mode');
    if (savedViewMode === 'standard' || savedViewMode === 'complete') {
      setViewMode(savedViewMode);
    }
  }, []);

  const handleViewModeChange = (mode: 'standard' | 'complete') => {
    setViewMode(mode);
    setEventViewModes({});
    if (isHydrated) {
      localStorage.setItem('setlist-view-mode', mode);
    }
  };

  const handleEventViewModeChange = (eventId: number, mode: 'standard' | 'complete') => {
    setEventViewModes(prev => ({
      ...prev,
      [eventId]: mode
    }));
  };

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
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
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

  const { events, bandCounts, selectedTypes, search, searchType } = results;
  const searchParamsObj = Object.fromEntries(searchParamsHook.entries());
  const typedEvents = events as import('@/lib/types').Event[];
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
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
        <div className="page-title">
          Browse Events <span className="text-gray-500 font-normal text-lg">({events.length})</span>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">View:</span>
            <div className="inline-flex bg-gray-100 rounded-md p-0.5">
              <button
                className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${viewMode === 'standard'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
                onClick={() => handleViewModeChange('standard')}
              >
                Compact
              </button>
              <button
                className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${viewMode === 'complete'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
                onClick={() => handleViewModeChange('complete')}
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`mb-8 bg-gray-50 border border-gray-200 rounded-lg ${showHelp ? 'p-5' : 'p-3'}`}>
        <div
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
        >
          <h3 className="text-lg font-semibold text-gray-900">How to use this page</h3>
          <span className="text-gray-500 text-lg">{showHelp ? '▼' : '▶'}</span>
        </div>

        {showHelp && (
          <ul className="text-sm text-gray-700 leading-relaxed space-y-2 list-disc pl-5 mt-3">
            <li>Use the search bar in the header to filter by date (YYYY-MM-DD, YYYY-MM or YYYY), band, guests or venue.</li>
            <li>The default setlist view is Compact - fragmentary songs and notes hidden, medleys and suites collapsed. Toggle the Complete setting (for the whole page or a specific show) to see the full setlist with performance notes.</li>
            <li>Click the event header to view all event info, including recordings, show notes, stage banter, etc. (Details are still being added and primarily exist from 1976-1983 at present.)</li>
          </ul>
        )}
      </div>

      {hasActiveSearch && (
        <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded px-4 py-2">
          <span className="text-blue-700 font-medium">
            Showing results for: <span className="font-bold">{getSearchLabel(searchType)}: {search}</span>
          </span>
          <Link href={getClearSearchUrl(searchParamsObj)} className="text-blue-700 hover:text-blue-900 font-medium">
            Clear
          </Link>
        </div>
      )}

      <div className="mb-6">
        <BandFilterChips bandCounts={bandCounts} selectedKeys={selectedTypes} />
      </div>

      <div className="flex flex-col gap-5">
        {typedEvents.map(event => (
          <EventCard
            key={event.id}
            event={event}
            showPrevNext={false}
            showViewToggle={true}
            showPerformanceNotes={(eventViewModes[event.id] || viewMode) === 'complete'}
            showStageTalk={false}
            showRecordings={false}
            showContributors={false}
            viewMode={eventViewModes[event.id] || viewMode}
            onViewModeChange={(mode) => handleEventViewModeChange(event.id, mode)}
          />
        ))}
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