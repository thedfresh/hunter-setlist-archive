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
  const [showSetlists, setShowSetlists] = useState(true);
  const [viewMode, setViewMode] = useState<'standard' | 'complete'>('standard');
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize from localStorage after hydration
  useEffect(() => {
    setIsHydrated(true);
    const savedSetlists = localStorage.getItem('hunterArchive_browseShowSetlists');
    const savedViewMode = localStorage.getItem('setlist-view-mode');
    
    if (savedSetlists !== null) {
      setShowSetlists(savedSetlists === 'true');
    }
    if (savedViewMode === 'standard' || savedViewMode === 'complete') {
      setViewMode(savedViewMode);
    }
  }, []);

  const toggleSetlists = () => {
    const newValue = !showSetlists;
    setShowSetlists(newValue);
    if (isHydrated) {
      localStorage.setItem('hunterArchive_browseShowSetlists', newValue.toString());
    }
  };

  const handleViewModeChange = (mode: 'standard' | 'complete') => {
    setViewMode(mode);
    if (isHydrated) {
      localStorage.setItem('setlist-view-mode', mode);
    }
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

  const { events, bandCounts, currentPage, totalPages, selectedTypes, search, searchType } = results;
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
      <div className="flex gap-10">
        <div className="hidden md:block fixed left-10 top-[160px] w-[160px]">
          <BandFilterChips bandCounts={bandCounts} selectedKeys={selectedTypes} />
        </div>
        <div className="flex-1">
          {/* Page Header with Controls */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
            <div className="page-title">
              Browse Events <span className="text-gray-500 font-normal text-lg">({events.length})</span>
            </div>
            
            <div className="flex gap-4 items-center">
              {/* Setlist toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Setlists:</span>
                <div className="inline-flex bg-gray-100 rounded-md p-0.5">
                  <button
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                      showSetlists
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setShowSetlists(true)}
                  >
                    Show
                  </button>
                  <button
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                      !showSetlists
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setShowSetlists(false)}
                  >
                    Hide
                  </button>
                </div>
              </div>
              
              {/* View mode toggle */}
              {showSetlists && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">View:</span>
                  <div className="inline-flex bg-gray-100 rounded-md p-0.5">
                    <button
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                        viewMode === 'standard'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      onClick={() => handleViewModeChange('standard')}
                    >
                      Compact
                    </button>
                    <button
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                        viewMode === 'complete'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      onClick={() => handleViewModeChange('complete')}
                    >
                      Complete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {hasActiveSearch && (
            <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded px-4 py-2">
              <span className="text-blue-700 font-medium">
                Showing results for: <span className="font-bold">{getSearchLabel(searchType)}: {search}</span>
              </span>
              <Link href={getClearSearchUrl(searchParamsObj)} className="block transition-transform hover:-translate-y-1">
                Clear
              </Link>
            </div>
          )}

          {/* Cards - Single column, max-width centered */}
          <div className="max-w-4xl mx-auto flex flex-col gap-5">
            {typedEvents.map(event => (
              <Link key={event.id} href={`/event/${event.slug}`}>
                <EventCard
                  event={event}
                  showPrevNext={false}
                  showViewToggle={showSetlists}
                  showPerformanceNotes={viewMode === 'complete'}
                  showStageTalk={false}
                  showRecordings={false}
                  showContributors={false}
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                />
              </Link>
            ))}
          </div>
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
