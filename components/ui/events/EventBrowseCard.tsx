import React from 'react';
import Link from 'next/link';
import { formatEventDate } from '@/lib/formatters/dateFormatter';
import { getPerformerCardClass } from '@/lib/utils/performerStyles';
import { X, Mic, HelpCircle, Video, Music } from 'lucide-react';

interface EventBrowseCardProps {
    event: any;
}

const EventBrowseCard: React.FC<EventBrowseCardProps> = ({ event }) => {
    // Build detailed set summary
    const sets = event.sets || [];
    let setLabel = '';
    let setLabelClass = 'font-medium text-gray-700';

    if (event.eventType?.name === 'Errata' && event.publicNotes) {
        setLabel = event.publicNotes;
        setLabelClass = 'font-normal text-gray-600 italic text-xs';
    } else if (sets.length === 0) {
        setLabel = '';
        setLabelClass = 'font-normal text-gray-500 italic';
    } else {
        // Get set type names
        const setTypeNames = sets.map((s: any) => s.setType?.displayName || 'Set').join(' / ');
        setLabel = setTypeNames;
    }
    // Calculate recording counts
    const lmaRecordings = event.recordings?.filter((r: any) => r.lmaIdentifier) || [];
    const lmaTypes = [...new Set(lmaRecordings.map((r: any) => r.recordingType?.name).filter(Boolean))];

    // YouTube count stays the same
    const youtubeCount = event.recordings?.filter((r: any) => r.youtubeVideoId).length || 0;  // Performer display
    const performerName = event.primaryBand?.name || 'Robert Hunter';

    // Format venue with smart truncation (truncate name, preserve city/state)
    function formatVenueSmart(venue: any) {
        if (!venue) return 'Unknown venue';

        const parts = [];

        // Truncate venue name if needed
        if (venue.name) {
            const name = venue.name.length > 30
                ? venue.name.substring(0, 30) + '...'
                : venue.name;
            parts.push(name);
        }

        // Always show full city/state
        if (venue.city) parts.push(venue.city);
        if (venue.stateProvince) parts.push(venue.stateProvince);

        return parts.join(', ');
    }

    return (
        <Link
            href={`/event/${event.slug}`}
            className={`event-card ${getPerformerCardClass(event)} block p-3 hover:shadow-lg transition-shadow cursor-pointer`}
        >
            {/* Top row: Performer | Date | Venue | Event Type Badge */}
            <div className="flex items-center justify-between gap-3 text-sm mb-3">
                <div className="flex items-baseline gap-3 min-w-0 flex-1">
                    {/* Performer */}
                    <span className="font-semibold text-gray-700 flex-shrink-0">
                        {performerName}
                    </span>

                    {/* Date with uncertainty badge */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="font-semibold">
                            {event.displayDate || formatEventDate(event)}
                        </span>
                        {(!event.year || !event.month || !event.day || event.dateUncertain) && (
                            <span className="badge-uncertain-small" title="Date uncertain">
                                ?
                            </span>
                        )}
                    </div>

                    {/* Venue with uncertainty badge */}
                    <div className="flex items-center gap-1 text-gray-600 min-w-0">
                        <span className="truncate">
                            {formatVenueSmart(event.venue)}
                        </span>
                        {(event.venue?.name?.includes('Unknown') || event.venue?.isUncertain || event.venueUncertain) && (
                            <span className="badge-uncertain-small flex-shrink-0" title="Venue uncertain">
                                ?
                            </span>
                        )}
                    </div>
                </div>

                {/* Event type badges - far right */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    {event.eventType?.name === 'Errata' && (
                        <span className="badge-errata text-xs px-2 py-0.5">
                            <X size={10} className="inline" /> Errata
                        </span>
                    )}
                    {event.eventType?.name === 'Studio Session' && (
                        <span className="badge-studio text-xs px-2 py-0.5">
                            <Mic size={10} className="inline" /> Studio
                        </span>
                    )}
                    {event.eventType?.name === 'Interview' && (
                        <span className="badge-interview text-xs px-2 py-0.5">
                            <Mic size={10} className="inline" /> Interview
                        </span>
                    )}
                </div>
            </div>

            {/* Billing row - NEW */}
            {event.billing && (
                <div className="text-sm italic text-gray-600 mb-2">
                    {event.billing}
                </div>
            )}
            {/* Bottom row: Set info & Recordings */}
            <div className="flex items-center justify-between text-sm border-t border-gray-200 pt-2">
                {/* Set info */}
                <div className={setLabelClass}>
                    {setLabel}
                </div>

                {/* Recordings */}
                <div className="flex items-center gap-3">
                    {lmaTypes.length > 0 && (
                        <span className="flex items-center gap-1 font-medium text-blue-700">
                            <Music size={14} />
                            {lmaTypes.join(' / ')}
                        </span>
                    )}
                    {youtubeCount > 0 && (
                        <span className="flex items-center gap-1 font-medium text-red-600">
                            <Video size={14} />
                            YouTube
                        </span>
                    )}
                    {lmaTypes.length === 0 && youtubeCount === 0 && (
                        <span className="text-gray-400 text-xs">{/*No recordings*/}</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default EventBrowseCard;