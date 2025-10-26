'use client';
import React from 'react';
import Link from 'next/link';
import { X, Mic, Music, Video, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPerformerCardClass } from '@/lib/utils/performerStyles';
import { getBandConfig, getPerformerBorderClass, getPerformerLightBgClass } from '@/lib/config/bands';
import { formatEventDate } from '@/lib/formatters/dateFormatter';
import { formatVenue } from '@/lib/formatters/venueFormatter';
import Setlist from './Setlist';
import PerformanceNotes from './PerformanceNotes';
import ShowContext from './ShowContext';
import StageTalk from './StageTalk';
import RecordingsSection from './RecordingsSection';
import ContributorsSection from './ContributorsSection';
import { calculateSetlistVisibility } from '@/lib/utils/setlistVisibility';

interface EventCardProps {
    event: any;
    showPrevNext?: boolean;
    showViewToggle?: boolean;
    showPerformanceNotes?: boolean;
    showStageTalk?: boolean;
    showRecordings?: boolean;
    showContributors?: boolean;
    viewMode: 'standard' | 'complete';
    onViewModeChange?: (mode: 'standard' | 'complete') => void;
    prevEvent?: { slug: string } | null;
    nextEvent?: { slug: string } | null;
}

const EventCard: React.FC<EventCardProps> = ({
    event,
    showPrevNext = false,
    showViewToggle = false,
    showPerformanceNotes = false,
    showStageTalk = false,
    showRecordings = false,
    showContributors = false,
    viewMode,
    onViewModeChange,
    prevEvent,
    nextEvent,
}) => {
    const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());

    // Reset expanded groups when view mode changes
    React.useEffect(() => {
        setExpandedGroups(new Set());
    }, [viewMode]);

    // Calculate visibility
    const visibilityData = calculateSetlistVisibility(
        event.sets ?? [],
        expandedGroups,
        viewMode
    );

    // Get styling
    const performerName = event.primaryBand?.name || 'Robert Hunter';
    const performerCardClass = getPerformerCardClass(event);
    const bandConfig = getBandConfig(performerName);
    const textClass = bandConfig.textClass;
    const borderClass = getPerformerBorderClass(event);
    const lightBgClass = getPerformerLightBgClass(event);

    // Calculate recordings for badges
    const lmaRecordings = event.recordings?.filter((r: any) => r.lmaIdentifier) || [];
    const lmaTypes = [...new Set(lmaRecordings.map((r: any) => r.recordingType?.name).filter(Boolean))];
    const youtubeCount = event.recordings?.filter((r: any) => r.youtubeVideoId).length || 0;

    // Render badges
    const badges = (
        <>
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
            {lmaTypes.length > 0 && (
                <span className="flex items-center gap-1 font-medium text-blue-700 text-xs">
                    <Music size={14} />
                    {lmaTypes.join(' / ')}
                </span>
            )}
            {youtubeCount > 0 && (
                <span className="flex items-center gap-1 font-medium text-red-600 text-xs">
                    <Video size={14} />
                    YT
                </span>
            )}
        </>
    );

    // Check for content
    const hasSets = event.sets && event.sets.length > 0;
    
    const hasShowContext = event.eventMusicians?.length > 0 ||
        event.sets?.some((s: any) => s.bandId && s.bandId !== event.primaryBandId && s.band) ||
        event.sets?.some((s: any) => s.setMusicians && s.setMusicians.length > 0) ||
        event.publicNotes;

    // Check if there's anything that changes between Compact and Complete modes
    const hasToggleableContent = visibilityData.allPerformances.some((p: any) => 
        p.publicNotes || 
        p.performanceMusicians?.length > 0 ||
        p.isLyricalFragment || 
        p.isMusicalFragment || 
        p.isPartial
    );

    // Only show notes border if there are actual notes to display
    const hasNotesContent = hasShowContext || (showPerformanceNotes && hasToggleableContent);

    const hasBottomSection = (showRecordings && event.recordings?.length > 0) ||
                            (showContributors && event.eventContributors?.length > 0) ||
                            (showStageTalk && event.sets?.some((s: any) => 
                                s.performances?.some((p: any) => p.showBanter?.length > 0)
                            ));

    return (
        <>
            <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${borderClass}`}>
                {/* Header - colored background */}
                <div className={`${performerCardClass} px-5 py-4 border-b border-white/30`}>
                    <div className="flex justify-between items-center mb-2">
                        <div className={`text-sm font-semibold ${textClass}`}>
                            {performerName}
                        </div>
                        <div className="flex gap-2">
                            {showPrevNext ? (
                                <>
                                    <Link href={prevEvent?.slug ? `/event/${prevEvent.slug}` : '#'}>
                                        <button className="btn btn-secondary btn-small" disabled={!prevEvent?.slug}>
                                            <ChevronLeft size={14} /> Prev
                                        </button>
                                    </Link>
                                    <Link href={nextEvent?.slug ? `/event/${nextEvent.slug}` : '#'}>
                                        <button className="btn btn-secondary btn-small" disabled={!nextEvent?.slug}>
                                            Next <ChevronRight size={14} />
                                        </button>
                                    </Link>
                                </>
                            ) : (
                                <div className="flex gap-2 items-center">
                                    {badges}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2.5">
                        <span className="text-lg font-semibold text-gray-900">
                            {event.displayDate || formatEventDate(event)}
                            {(!event.year || !event.month || !event.day || event.dateUncertain) && (
                                <span className="badge-uncertain-small ml-1" title="Date uncertain">?</span>
                            )}
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-base text-gray-700">
                            {formatVenue(event.venue)}
                            {(event.venue?.name?.includes('Unknown') || event.venue?.isUncertain || event.venueUncertain) && (
                                <span className="badge-uncertain-small ml-1" title="Venue uncertain">?</span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Main Content - White background */}
                <div className="px-6 py-5 bg-white">
                    {/* Billing + Toggle Row - only show toggle if there's toggleable content */}
                    {(event.billing || (showViewToggle && hasSets && hasToggleableContent)) && (
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-sm italic text-gray-600">
                                {event.billing || ''}
                            </div>
                            {showViewToggle && hasSets && hasToggleableContent && onViewModeChange && (
                                <div className="inline-flex bg-gray-100 rounded-md p-0.5">
                                    <button
                                        className={`px-3 py-1 text-[11px] font-medium rounded transition-all ${
                                            viewMode === 'standard'
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                        onClick={() => onViewModeChange('standard')}
                                    >
                                        Compact
                                    </button>
                                    <button
                                        className={`px-3 py-1 text-[11px] font-medium rounded transition-all ${
                                            viewMode === 'complete'
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                        onClick={() => onViewModeChange('complete')}
                                    >
                                        Complete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Setlist */}
                    {hasSets && (
                        <div className="mb-5">
                            <Setlist
                                sets={event.sets}
                                showFootnotes={true}
                                showSongLinks={true}
                                event={event}
                                viewMode={viewMode}
                                expandedGroups={expandedGroups}
                                setExpandedGroups={setExpandedGroups}
                                visibilityData={visibilityData}
                            />
                        </div>
                    )}

                    {/* No setlist message */}
                    {!hasSets && (
                        <div className="text-sm text-gray-400 italic">No setlist available</div>
                    )}

                    {/* Notes section - only show border if has sets AND notes content exists */}
                    {hasSets && hasNotesContent && (
                        <div className="mt-6 pt-5 border-t border-gray-200">
                            {/* Show Context (event musicians, set context) */}
                            {hasShowContext && (
                                <div className="mb-5">
                                    <ShowContext event={event} showPublicNotes={true} />
                                </div>
                            )}

                            {/* Performance Notes */}
                            {showPerformanceNotes && (
                                <PerformanceNotes
                                    event={event}
                                    viewMode={viewMode}
                                    visibilityData={visibilityData}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section - OUTSIDE main card, very light band-colored bg */}
            {hasBottomSection && (
                <div className={`mt-6 p-6 border border-gray-200 rounded-lg ${lightBgClass}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            {showContributors && event.eventContributors && event.eventContributors.length > 0 && (
                                <ContributorsSection
                                    contributors={event.eventContributors
                                        .filter((c: any) => c.contributor && c.description != null)
                                        .map((c: any) => ({
                                            id: c.id,
                                            description: c.description ?? '',
                                            contributor: { name: c.contributor.name }
                                        }))}
                                />
                            )}
                            {showRecordings && event.recordings && event.recordings.length > 0 && (
                                <RecordingsSection recordings={event.recordings} />
                            )}
                        </div>
                        <div>
                            {showStageTalk && (
                                <StageTalk sets={event.sets ?? []} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EventCard;
