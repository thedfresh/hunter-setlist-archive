'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ShowContext from './ShowContext';
import Setlist from './Setlist';
import { getPerformerCardClass } from '@/lib/utils/performerStyles';
import PerformanceNotes from './PerformanceNotes';
import StageTalk from './StageTalk';
import RecordingsSection from './RecordingsSection';
import ContributorsSection from './ContributorsSection';
import { formatEventDate } from '@/lib/formatters/dateFormatter';
import { formatVenue } from '@/lib/formatters/venueFormatter';
import { calculateSetlistVisibility } from '@/lib/utils/setlistVisibility';
import { X, Mic, HelpCircle, AlertTriangle } from 'lucide-react';

interface EventCardProps {
    event: any;
    variant: 'browse' | 'detail';
    showPrevNext?: boolean;
    showPerformanceNotes?: boolean;
    showStageTalk?: boolean;
    showRecordings?: boolean;
    showContributors?: boolean;
    prevEvent?: any;
    nextEvent?: any;
}

const EventCard: React.FC<EventCardProps> = ({
    event,
    variant,
    showPrevNext = false,
    showPerformanceNotes = false,
    showStageTalk = false,
    showRecordings = false,
    showContributors = false,
    prevEvent,
    nextEvent,
}) => {
    // Expanded groups state
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    const [viewMode, setViewMode] = useState<'standard' | 'complete'>(() => {
        // Read from localStorage during initialization (no flash)
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('setlist-view-mode');
            if (saved === 'standard' || saved === 'complete') {
                return saved;
            }
        }
        return 'standard';
    });

    // Reset expanded groups when view mode changes
    useEffect(() => {
        if (viewMode === 'complete') {
            setExpandedGroups(new Set());
        } else {
            setExpandedGroups(new Set());
        }
    }, [viewMode]);

    // Save preference when changed
    function handleViewModeChange(mode: 'standard' | 'complete') {
        setViewMode(mode);
        localStorage.setItem('setlist-view-mode', mode);
    }

    // Calculate all visibility state using centralized utility
    const visibilityData = calculateSetlistVisibility(
        event.sets ?? [],
        expandedGroups,
        viewMode
    );

    // Common header content
    const headerContent = event.primaryBand?.name || 'Robert Hunter';

    const header = variant === 'detail' && showPrevNext ? (
        <div className="flex justify-between items-start mb-2">
            <div className="text-sm font-medium text-gray-700">
                <span className={`card inline-block px-3 py-1 text-sm font-medium ${getPerformerCardClass(event)}`}>{headerContent}</span>
            </div>
            <div className="flex gap-2">
                <Link href={prevEvent?.slug ? `/event/${prevEvent.slug}` : '#'}>
                    <button className="btn btn-secondary btn-small" disabled={!prevEvent?.slug}>
                        Prev
                    </button>
                </Link>
                <Link href={nextEvent?.slug ? `/event/${nextEvent.slug}` : '#'}>
                    <button className="btn btn-secondary btn-small" disabled={!nextEvent?.slug}>
                        Next
                    </button>
                </Link>
            </div>
        </div>
    ) : (
        <div className="mb-2 text-sm font-medium text-gray-700">
            {headerContent}
        </div>
    );

    const dateVenue = (
        <div className={variant === 'detail' ? 'my-4' : 'mb-2'}>
            <div className="flex items-center gap-2 text-lg font-semibold mb-1">
                <span>{event.displayDate || formatEventDate(event)}</span>
                {event.eventType?.name === 'Errata' && (
                    <span className="badge-errata">
                        <X size={16} className="inline" /> Errata
                    </span>
                )}
                {event.eventType?.name === 'Studio Session' && (
                    <span className="badge-studio">
                        <Mic size={16} className="inline" /> Studio
                    </span>
                )}
                {event.eventType?.name === 'Interview' && (
                    <span className="badge-interview">
                        <Mic size={16} className="inline" /> Interview
                    </span>
                )}
                {(!event.year || !event.month || !event.day || event.dateUncertain) && (
                    <span className="badge-uncertain-small" title="Date uncertain">
                        ?
                    </span>
                )}
            </div>
            <div className="flex items-center gap-2 text-gray-700 text-base font-normal">
                <span>
                    {event.venue ? formatVenue(event.venue) : ''}
                </span>
                {(event.venue?.name?.includes('Unknown') || event.venue?.isUncertain || event.venueUncertain) && (
                    <span className="badge-uncertain-small" title="Venue uncertain">
                        ?
                    </span>
                )}
            </div>
            {/* {event.isUncertain && (
                <div className="event-uncertainty-alert">
                    <AlertTriangle size={14} className="inline" /> Event details uncertain
                </div>
            )} */}
        </div>
    );

    const browseClass = `event-card ${getPerformerCardClass(event)} block p-6`;

    const billingSection = event.billing ? (
        <div className="text-sm italic text-gray-600 mb-3">{event.billing}</div>
    ) : null;

    const viewToggle = variant === 'detail' && (
        <div className="flex justify-end mb-2">
            <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
                <button
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'standard'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    onClick={() => handleViewModeChange('standard')}
                >
                    Compact
                </button>
                <button
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'complete'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    onClick={() => handleViewModeChange('complete')}
                >
                    Complete
                </button>
            </div>
        </div>
    );

    const setsSection = (
        <div className={`px-4 pt-1 pb-6 rounded ${variant === 'browse'
            ? 'bg-white/50'
            : `bg-white/50 border border-gray-200`
            }`}>
            <Setlist
                sets={event.sets}
                showFootnotes={variant === 'detail'}
                showSongLinks={variant === 'detail'}
                event={event}
                viewMode={viewMode}
                expandedGroups={expandedGroups}
                setExpandedGroups={setExpandedGroups}
                visibilityData={visibilityData}
            />
        </div>
    );

    const hasShowContext = event.eventMusicians?.length > 0 ||
        event.sets?.some((s: any) => s.bandId && s.bandId !== event.primaryBandId && s.band) ||
        event.sets?.some((s: any) => s.setMusicians && s.setMusicians.length > 0) ||
        event.publicNotes;

    const showContextSection = hasShowContext ? (
        <div>
            <ShowContext event={event} showPublicNotes={true} />
        </div>
    ) : null;

    const performanceNotes = showPerformanceNotes && (
        <div>
            <PerformanceNotes
                event={event}
                viewMode={viewMode}
                visibilityData={visibilityData}
            />
        </div>
    );

    const stageTalk = showStageTalk && (
        <div>
            <StageTalk sets={event.sets ?? []} />
        </div>
    );

    const recordings = showRecordings && (
        <div>
            <RecordingsSection recordings={event.recordings ?? []} />
        </div>
    );

    const contributors = showContributors && (
        <div>
            <ContributorsSection contributors={
                (event.eventContributors || [])
                    .filter((c: any) => c.contributor && c.description != null)
                    .map((c: any) => ({
                        id: c.id,
                        description: c.description ?? '',
                        contributor: { name: c.contributor.name }
                    }))
            } />
        </div>
    );

    if (variant === 'browse') {
        return (
            <div className={browseClass}>
                {header}
                {dateVenue}
                {billingSection}
                {setsSection}
                {showContextSection && (
                    <div className="event-detail-sections mt-6">
                        <ShowContext
                            event={event}
                            showPublicNotes={false}
                            showEventMusicians={true}
                            showSetMusicians={true}
                            showSetBandContext={true}
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="event-detail-card p-6">
            {header}
            {dateVenue}
            {billingSection}
            {viewToggle}
            {setsSection}
            <div className="event-detail-sections mt-6">
                {showContextSection}
                {performanceNotes}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-4">
                        {recordings}
                        {contributors}
                    </div>
                    <div>
                        {stageTalk}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default EventCard;