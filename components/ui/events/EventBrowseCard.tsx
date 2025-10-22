import React from 'react';
import Link from 'next/link';
import { formatEventDate } from '@/lib/formatters/dateFormatter';
import { formatVenue } from '@/lib/formatters/venueFormatter';
import { getPerformerCardClass, getPerformerTextClass } from '@/lib/utils/performerStyles';
import { X, Mic, HelpCircle, Video, Music } from 'lucide-react';

interface EventBrowseCardProps {
    event: any;
    showSetlist?: boolean;
}

const EventBrowseCard: React.FC<EventBrowseCardProps> = ({ event, showSetlist = false }) => {
    // Build detailed set summary for when setlist is NOT shown
    const sets = event.sets || [];
    let setLabel = '';

    if (event.eventType?.name === 'Errata' && event.publicNotes) {
        setLabel = event.publicNotes;
    } else if (sets.length === 0) {
        setLabel = '';
    } else {
        // Get set type names
        const setTypeNames = sets.map((s: any) => s.setType?.displayName || 'Set').join(' / ');
        setLabel = setTypeNames;
    }

    // Calculate recording counts
    const lmaRecordings = event.recordings?.filter((r: any) => r.lmaIdentifier) || [];
    const lmaTypes = [...new Set(lmaRecordings.map((r: any) => r.recordingType?.name).filter(Boolean))];
    const youtubeCount = event.recordings?.filter((r: any) => r.youtubeVideoId).length || 0;

    // Performer display
    const performerName = event.primaryBand?.name || 'Robert Hunter';
    const performerTextClass = getPerformerTextClass(performerName);

    return (
        <Link
            href={`/event/${event.slug}`}
            className={`event-card ${getPerformerCardClass(event)} block rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4`}
        >
            {/* Header row: Performer | Date | Venue | Event Type Badges | Recording Counts */}
            <div className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Performer */}
                    <span className={`font-semibold ${performerTextClass} flex-shrink-0`}>
                        {performerName}
                    </span>

                    <span className="text-gray-400">|</span>

                    {/* Date with uncertainty badge */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="font-semibold text-gray-900">
                            {event.displayDate || formatEventDate(event)}
                        </span>
                        {(!event.year || !event.month || !event.day || event.dateUncertain) && (
                            <span className="badge-uncertain-small" title="Date uncertain">
                                ?
                            </span>
                        )}
                    </div>

                    <span className="text-gray-400">|</span>

                    {/* Venue with uncertainty badge */}
                    <div className="flex items-center gap-1 text-gray-600 min-w-0">
                        <span className="truncate">
                            {formatVenue(event.venue)}
                        </span>
                        {(event.venue?.name?.includes('Unknown') || event.venue?.isUncertain || event.venueUncertain) && (
                            <span className="badge-uncertain-small flex-shrink-0" title="Venue uncertain">
                                ?
                            </span>
                        )}
                    </div>
                </div>

                {/* Right side: Event type badges and recordings */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Event type badges */}
                    {event.eventType?.name === 'Errata' && (
                        <span className="badge-errata">
                            <X size={10} className="inline" /> Errata
                        </span>
                    )}
                    {event.eventType?.name === 'Studio Session' && (
                        <span className="badge-studio">
                            <Mic size={10} className="inline" /> Studio
                        </span>
                    )}
                    {event.eventType?.name === 'Interview' && (
                        <span className="badge-interview">
                            <Mic size={10} className="inline" /> Interview
                        </span>
                    )}

                    {/* Recordings */}
                    {lmaTypes.length > 0 && (
                        <span className="flex items-center gap-1 font-medium text-blue-700">
                            <Music size={14} />
                            {lmaTypes.join(' / ')}
                        </span>
                    )}
                    {youtubeCount > 0 && (
                        <span className="flex items-center gap-1 font-medium text-red-600">
                            <Video size={14} />
                            YT
                        </span>
                    )}
                </div>
            </div>

            {/* Billing row */}
            {event.billing && (
                <div className="text-sm italic text-gray-600 mt-2">
                    {event.billing}
                </div>
            )}

            {/* Set info row - ONLY show when setlist is NOT shown */}
            {!showSetlist && setLabel && (
                <div className="text-sm text-gray-600 mt-2">
                    {setLabel}
                </div>
            )}

            {/* Setlist section - ONLY show when setlist IS shown */}
            {showSetlist && event.sets && event.sets.length > 0 && (
                <div className="mt-4">
                    {event.sets.map((set: any, setIndex: number) => (
                        <div key={set.id || setIndex} className={setIndex > 0 ? 'mt-3' : ''}>
                            <div className="flex gap-4">
                                {/* Left column: Set type label */}
                                <div className="w-32 font-semibold text-gray-700 text-sm flex-shrink-0 text-right">
                                    {set.setType?.displayName || `Set ${setIndex + 1}`}
                                </div>

                                {/* Right column: Song list */}
                                <div className="flex-1 text-sm leading-relaxed text-gray-600">
                                    {set.performances?.map((performance: any, perfIndex: number) => (
                                        <React.Fragment key={performance.id || perfIndex}>
                                            <span className="inline-block whitespace-nowrap">
                                                {performance.song?.title || 'Unknown Song'}
                                                {performance.seguesInto && ' > '}
                                            </span>
                                            {perfIndex < set.performances.length - 1 && !performance.seguesInto && ', '}
                                        </React.Fragment>
                                    )) || 'No songs listed'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Link>
    );
};

export default EventBrowseCard;