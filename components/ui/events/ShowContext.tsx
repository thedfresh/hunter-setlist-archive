import React from 'react';

interface ShowContextProps {
    event: any;
    showEventMusicians?: boolean;
    showSetBandContext?: boolean;
    showSetMusicians?: boolean;
    showPublicNotes?: boolean;
    hasGuestLeadVocals?: boolean;
}


const ShowContext: React.FC<ShowContextProps> = ({
    event,
    showEventMusicians = true,
    showSetBandContext = true,
    showSetMusicians = true,
    showPublicNotes = true,
    hasGuestLeadVocals = false,
}) => {
    const hasEventMusicians = showEventMusicians && event.eventMusicians?.length > 0;
    const hasPublicNotes = showPublicNotes && event.publicNotes;
    const hasAnyContent = hasEventMusicians || hasPublicNotes || hasGuestLeadVocals;
    if (!hasAnyContent) return null;

    return (
        <div className="notes-section">
            <div className="notes-title">Show Notes</div>
            {/* Event-level musicians */}
            {hasEventMusicians && (
                <div className="text-xs text-gray-700 mb-2">
                    With {event.eventMusicians
                        .filter((em: any) => em.musician && em.instrument)
                        .map((em: any) => `${em.musician.name} on ${em.instrument.name}`)
                        .join(', ')}
                </div>
            )}
            {/* Public notes */}
            {hasPublicNotes && (
                <div className="notes-content">{event.publicNotes}</div>
            )}
        </div>
    );
};

export default ShowContext;
