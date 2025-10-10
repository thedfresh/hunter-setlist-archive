import React from 'react';
import Link from 'next/link';
import ShowContext from './ShowContext';
import Setlist from './Setlist';
import { getPerformerCardClass } from '@/lib/utils/performerStyles';
import PerformanceNotes from './PerformanceNotes';
import StageTalk from './StageTalk';
import RecordingsSection from './RecordingsSection';
import ContributorsSection from './ContributorsSection';
import { formatEventDate } from '@/lib/formatters/dateFormatter';
import { getPerformerTextClass } from '@/lib/utils/performerStyles';

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

    // Common header content
    const headerContent = event.primaryBand?.name || 'Robert Hunter';

    // Header - with or without nav buttons depending on variant
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
        <div className="mb-2">
            <div className="flex items-center gap-3 text-lg font-semibold">
                <span>{event.displayDate || formatEventDate(event)}</span>
                <span className="text-gray-700 text-base font-normal">
                    {event.venue?.name}
                    {event.venue?.city ? `, ${event.venue.city}` : ''}
                    {event.venue?.stateProvince ? `, ${event.venue.stateProvince}` : ''}
                </span>
            </div>
        </div>
    );

    // Browse card styling
    const browseClass = `event-card ${getPerformerCardClass(event)} block p-6`;

    // Billing
    const billingSection = event.billing ? (
        <div className="text-sm italic text-gray-600 mb-3">{event.billing}</div>
    ) : null;

    // Sets
    const setsSection = (
        <div className={`px-4 pt-1 pb-6 rounded ${variant === 'browse'
            ? 'bg-white/50'
            : `bg-white/50 border border-gray-200`
            }`}>
            <Setlist
                sets={event.sets}
                showFootnotes={variant === 'detail'}
                showSongLinks={variant === 'detail'}
                eventPrimaryBandId={event.primaryBandId}
            />
        </div>
    );

    const hasShowContext = event.eventMusicians?.length > 0 ||
        event.sets?.some((s: any) => s.bandId && s.bandId !== event.primaryBandId && s.band) ||
        event.sets?.some((s: any) => s.setMusicians && s.setMusicians.length > 0) ||
        event.publicNotes;


    // Detail-only sections
    const prevNextNav = showPrevNext && (
        <div className="my-4 flex gap-2">
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
    );

    const showContextSection = hasShowContext ? (
        <div>
            <ShowContext event={event} showPublicNotes={true} />
        </div>
    ) : null;

    const performanceNotes = showPerformanceNotes && (
        <div>
            <PerformanceNotes performances={event.sets?.flatMap((s: any) => s.performances) ?? []} />
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

    // Render
    if (variant === 'browse') {
        return (
            <div className={browseClass}>
                {header}
                {dateVenue}
                {billingSection}
                {setsSection}
                {showContextSection && (
                    <div className="event-detail-sections mt-6">
                        {showContextSection}
                    </div>
                )}
            </div>
        );
    }

    // Detail variant
    return (
        <div className="event-detail-card p-6">
            {header}
            {dateVenue}
            {billingSection}
            {setsSection}
            <div className="event-detail-sections mt-6">
                {showContextSection}
                {performanceNotes}
                <div className="grid grid-cols-2 gap-6 mt-4">
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
